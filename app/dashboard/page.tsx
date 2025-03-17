'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ServicesService, Service } from '@/lib/services-service';
import ServiceCard from '@/components/ui/ServiceCard';

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
  const [services, setServices] = useState<Service[]>([]);

  // تحميل الخدمات من قاعدة البيانات
  useEffect(() => {
    const loadServices = async () => {
      try {
        const activeServices = await ServicesService.getActiveServices();
        setServices(activeServices);
      } catch (err) {
        console.error('Error loading services:', err);
        toast.error('حدث خطأ أثناء تحميل الخدمات');
      }
    };

    loadServices();
  }, []);

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
        {services.map((service) => (
          <motion.div key={service.id} variants={fadeIn}>
            <ServiceCard service={service} />
          </motion.div>
        ))}

        {services.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-400">لا توجد خدمات متاحة حالياً.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
} 