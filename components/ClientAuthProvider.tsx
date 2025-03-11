"use client";

import React, { useEffect } from 'react';
import { AuthProvider } from "@/context/AuthContext";
import { supabase } from '@/lib/supabase';
import { Toaster } from 'react-hot-toast';
import { isAuthenticated } from '@/utils/auth';

export default function ClientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // التحقق من الجلسة عند تحميل التطبيق
  useEffect(() => {
    const checkSession = async () => {
      try {
        // التحقق من الجلسة
        const authenticated = await isAuthenticated();
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check in ClientAuthProvider:', session ? 'Active' : 'None', 'User:', session?.user?.email || 'None');
        
        // إذا لم تكن هناك جلسة، تأكد من حذف أي بيانات محلية قديمة
        if (!authenticated && typeof window !== 'undefined') {
          localStorage.removeItem('nuqta-auth-token');
          localStorage.removeItem('nuqta-auth-session');
          
          // محاولة تحديث الجلسة
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            console.log('Session refresh failed:', error.message);
          }
        }
      } catch (error) {
        console.error('Error in session check:', error);
      }
    };
    
    checkSession();
    
    // الاستماع لتغييرات حالة المصادقة
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in ClientAuthProvider:', event, session?.user?.email || 'None');
      
      // تحديث الصفحة عند تغيير حالة المصادقة لضمان تحديث الواجهة
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        // تأخير قصير لضمان اكتمال عمليات المصادقة
        setTimeout(() => {
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
            window.location.reload();
          }
        }, 300);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  return (
    <>
      <AuthProvider>{children}</AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F2937',
            color: '#F9FAFB',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#F9FAFB',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#F9FAFB',
            },
          },
        }}
      />
    </>
  );
} 