"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, AuthState } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { isAuthenticated, getCurrentUser, signOut as authSignOut } from '@/utils/auth';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSession: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });
  const router = useRouter();
  const pathname = usePathname();

  // وظيفة لتحديث معلومات المستخدم
  const refreshSession = async (): Promise<User | null> => {
    try {
      console.log('Refreshing session...');
      
      // التحقق من وجود جلسة نشطة
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        console.log('No active session found');
        setAuthState({
          user: null,
          isLoading: false,
          error: null,
        });
        return null;
      }
      
      console.log('Session found, user ID:', session.user.id);
      
      // الحصول على معلومات المستخدم من جدول profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // إذا لم يتم العثور على الملف الشخصي، إنشاء ملف جديد
        if (profileError.code === 'PGRST116') {
          console.log('Profile not found, creating new profile');
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || '',
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw insertError;
          }
        } else {
          throw profileError;
        }
      }
      
      // إنشاء كائن المستخدم
      const user: User = {
        id: session.user.id,
        email: session.user.email || '',
        role: profile?.role || 'user',
        full_name: profile?.full_name || session.user.user_metadata?.full_name || '',
        avatar_url: profile?.avatar_url || null,
      };
      
      console.log('User loaded:', user.email, 'Role:', user.role);
      
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
      
      return user;
    } catch (error: any) {
      console.error('خطأ في تحديث الجلسة:', error);
      setAuthState({
        user: null,
        isLoading: false,
        error: error.message || 'خطأ في تحميل المستخدم',
      });
      return null;
    }
  };

  // تحميل معلومات المستخدم عند بدء التطبيق
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('Initial auth check...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthState({
            user: null,
            isLoading: false,
            error: error.message,
          });
          return;
        }
        
        if (!session) {
          console.log('No active session found');
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
          });
          
          // إعادة التوجيه إلى صفحة تسجيل الدخول إذا كان المستخدم في صفحة محمية
          if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
            router.push('/auth/login');
          }
          return;
        }
        
        console.log('Active session found:', session.user.email);
        await refreshSession();
      } catch (error: any) {
        console.error('Error in initial auth check:', error);
        setAuthState({
          user: null,
          isLoading: false,
          error: error.message,
        });
      }
    };

    fetchUser();

    // الاستماع لتغييرات حالة المصادقة
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        // تحديث الحالة عند تسجيل الدخول
        const user = await refreshSession();
        
        // تحديد الصفحة المناسبة بناءً على دور المستخدم
        if (user) {
          const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
          if (pathname === '/auth/login' || pathname === '/auth/signup') {
            router.push(`${redirectPath}?success=login`);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          isLoading: false,
          error: null,
        });
        
        // إعادة التوجيه إلى الصفحة الرئيسية عند تسجيل الخروج
        if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
          router.push('/');
        }
      } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // تحديث الحالة عند تحديث الرمز أو معلومات المستخدم
        await refreshSession();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  // وظيفة تسجيل الدخول
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // تحديث حالة المستخدم يدويًا للتأكد من تحديث الحالة فورًا
      if (data.user) {
        // الحصول على ملف المستخدم مع دوره
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('خطأ في الحصول على ملف المستخدم:', profileError);
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          role: profile?.role || 'user',
          full_name: profile?.full_name || data.user.user_metadata?.full_name,
          avatar_url: profile?.avatar_url,
        };

        console.log('User signed in successfully:', user.email, 'Role:', user.role);

        setAuthState({
          user,
          isLoading: false,
          error: null,
        });

        // تحديد الصفحة المناسبة بناءً على دور المستخدم
        const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
        
        // عرض رسالة نجاح وإعادة توجيه
        toast.success('تم تسجيل الدخول بنجاح، جاري توجيهك إلى لوحة التحكم');
        
        // تأخير قصير قبل إعادة التوجيه للسماح بظهور رسالة النجاح
        setTimeout(() => {
          router.push(`${redirectPath}?success=login`);
        }, 500);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'خطأ في تسجيل الدخول',
      }));
      toast.error(error.message || 'خطأ في تسجيل الدخول');
    }
  };

  // وظيفة التسجيل
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // التحقق من وجود المستخدم قبل التسجيل
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      if (existingUser) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'البريد الإلكتروني مستخدم بالفعل',
        }));
        toast.error('البريد الإلكتروني مستخدم بالفعل');
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));

      // عرض رسالة نجاح مختلفة بناءً على ما إذا كان التحقق من البريد الإلكتروني مطلوبًا
      if (data?.user?.identities?.length === 0) {
        toast.error('البريد الإلكتروني مستخدم بالفعل');
      } else if (data?.user?.email_confirmed_at) {
        toast.success('تم إنشاء حسابك بنجاح، جاري توجيهك إلى لوحة التحكم');
        setTimeout(() => {
          router.push('/dashboard?success=signup');
        }, 500);
      } else {
        toast.success('تم إنشاء حسابك بنجاح، يرجى التحقق من بريدك الإلكتروني');
        // إعادة التوجيه إلى صفحة التأكيد
        setTimeout(() => {
          router.push('/auth/login?success=signup');
        }, 500);
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'خطأ في التسجيل',
      }));
      toast.error(error.message || 'خطأ في التسجيل');
    }
  };

  // وظيفة تسجيل الخروج
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const success = await authSignOut();
      
      if (!success) throw new Error('فشل تسجيل الخروج');
      
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
      
      toast.success('تم تسجيل الخروج بنجاح');
      router.push('/');
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'خطأ في تسجيل الخروج',
      }));
      toast.error(error.message || 'خطأ في تسجيل الخروج');
    }
  };

  // وظيفة إعادة تعيين كلمة المرور
  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));

      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      router.push('/auth/check-email');
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'خطأ في طلب إعادة تعيين كلمة المرور',
      }));
      toast.error(error.message || 'خطأ في طلب إعادة تعيين كلمة المرور');
    }
  };

  const value = {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 