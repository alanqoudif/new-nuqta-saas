'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiServer, FiCode, FiMessageSquare, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(true);

  // تبسيط التحقق من الجلسة
  useEffect(() => {
    // تأخير قصير لضمان تحميل بيانات المستخدم
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // التحقق من وجود المستخدم بعد التحميل
      if (!user) {
        console.error('No user data found after loading');
        router.push('/auth/login?error=session_expired');
      }
    }, 2000);

    // عرض رسائل النجاح
    if (success === 'login') {
      toast.success('تم تسجيل الدخول بنجاح!');
    } else if (success === 'signup') {
      toast.success('تم إنشاء حسابك بنجاح!');
    }

    return () => clearTimeout(timer);
  }, [success, user, router]);

  // عرض رسالة خطأ إذا كان هناك معلمة خطأ في العنوان
  useEffect(() => {
    if (error) {
      toast.error(error === 'access_denied' ? 'ليس لديك صلاحية الوصول إلى هذه الصفحة' : error);
    }
  }, [error]);

  // إذا كان التحميل جارياً، عرض رسالة تحميل
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // التحقق من وجود المستخدم
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">لم يتم العثور على بيانات المستخدم</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  // عرض لوحة التحكم للمستخدم
  return (
    <div className="py-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">مرحباً، {user.full_name || user.email}</h1>
        <p className="text-gray-400">
          مرحباً بك في لوحة تحكم نقطة الذكاء. استكشف خدماتنا المتنوعة.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <motion.div variants={fadeIn}>
          <Link href="/dashboard/private-ai-request">
            <Card className="p-6 hover:border-primary-500 transition-all duration-300 h-full">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="p-3 bg-primary-900/30 rounded-lg w-fit">
                    <FiServer className="text-2xl text-primary-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">الذكاء الخاص</h3>
                <p className="text-gray-400 mb-4 flex-grow">
                  قم بتنفيذ نماذج الذكاء الاصطناعي المتقدمة في بنيتك التحتية الخاصة مع خصوصية كاملة والتحكم في البيانات.
                </p>
                <div className="mt-auto flex items-center text-primary-400 text-sm">
                  استكشف الآن <FiArrowRight className="mr-1" />
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Link href="/dashboard/site-builder">
            <Card className="p-6 hover:border-secondary-500 transition-all duration-300 h-full">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="p-3 bg-secondary-900/30 rounded-lg w-fit">
                    <FiCode className="text-2xl text-secondary-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">منشئ المواقع الذكي</h3>
                <p className="text-gray-400 mb-4 flex-grow">
                  أنشئ مواقع ويب مذهلة في دقائق باستخدام الذكاء الاصطناعي.
                </p>
                <div className="mt-auto flex items-center text-secondary-400 text-sm">
                  ابدأ الآن <FiArrowRight className="mr-1" />
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={fadeIn}>
          <a href="https://whats.nuqtai.com/" target="_blank" rel="noopener noreferrer">
            <Card className="p-6 hover:border-indigo-500 transition-all duration-300 h-full">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="p-3 bg-indigo-900/30 rounded-lg w-fit">
                    <FiMessageSquare className="text-2xl text-indigo-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">روبوت واتساب</h3>
                <p className="text-gray-400 mb-4 flex-grow">
                  دمج روبوتات ذكية في واتساب لخدمة العملاء الآلية.
                </p>
                <div className="mt-auto flex items-center text-indigo-400 text-sm">
                  تعرف على المزيد <FiArrowRight className="mr-1" />
                </div>
              </div>
            </Card>
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
} 