"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // التحقق من صلاحيات المسؤول
  useEffect(() => {
    const checkAdminPermissions = async () => {
      try {
        if (!user) {
          console.log('No user found, redirecting to login');
          toast.error('يجب تسجيل الدخول للوصول إلى لوحة الإدارة');
          router.push('/auth/login');
          return;
        }

        console.log('Checking admin permissions for user:', user.id, user.email);
        
        // التحقق من دور المستخدم في قاعدة البيانات
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
          toast.error('حدث خطأ في التحقق من صلاحيات المسؤول');
          router.push('/dashboard');
          return;
        }
        
        console.log('User profile found:', profile);
        
        if (profile?.role !== 'admin') {
          console.log('User is not an admin, redirecting to dashboard');
          setIsAdmin(false);
          toast.error('ليس لديك صلاحية الوصول إلى لوحة الإدارة');
          router.push('/dashboard');
          return;
        }
        
        console.log('Admin permissions verified successfully');
        setIsAdmin(true);
      } catch (error) {
        console.error('Error in admin check:', error);
        setIsAdmin(false);
        toast.error('حدث خطأ في التحقق من صلاحيات المسؤول');
        router.push('/dashboard');
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    if (!isLoading) {
      checkAdminPermissions();
    }
  }, [user, isLoading, router]);

  // عرض شاشة التحميل أثناء التحقق من المصادقة
  if (isLoading || isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">جاري التحقق من صلاحيات المسؤول...</p>
        </div>
      </div>
    );
  }

  // عرض المحتوى إذا كان المستخدم مسؤولًا
  if (user && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950" dir="rtl">
        <DashboardSidebar />
        <div className="md:mr-64 min-h-screen transition-all duration-300">
          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    );
  }

  // عرض شاشة فارغة أثناء إعادة التوجيه
  return null;
} 