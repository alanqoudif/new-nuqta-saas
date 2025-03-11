"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // التحقق من المصادقة
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('No user found in dashboard layout, redirecting to login');
      toast.error('يجب تسجيل الدخول للوصول إلى لوحة التحكم');
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  // عرض شاشة التحميل أثناء التحقق من المصادقة
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">جاري التحقق من المصادقة...</p>
        </div>
      </div>
    );
  }

  // عرض المحتوى إذا كان المستخدم مصادقًا
  if (user) {
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