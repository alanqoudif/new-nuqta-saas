'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiExternalLink, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { ServicesService, Service } from '@/lib/services-service';
import DynamicIcon from '@/components/ui/DynamicIcon';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// Helper function to get color classes based on color name
const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string, text: string, bgLight: string, hoverBg: string }> = {
    primary: { bg: 'bg-primary-600', text: 'text-primary-500', bgLight: 'bg-primary-900/30', hoverBg: 'hover:bg-primary-700' },
    secondary: { bg: 'bg-secondary-600', text: 'text-secondary-500', bgLight: 'bg-secondary-900/30', hoverBg: 'hover:bg-secondary-700' },
    accent: { bg: 'bg-accent-600', text: 'text-accent-500', bgLight: 'bg-accent-900/30', hoverBg: 'hover:bg-accent-700' },
    indigo: { bg: 'bg-indigo-600', text: 'text-indigo-500', bgLight: 'bg-indigo-900/30', hoverBg: 'hover:bg-indigo-700' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-500', bgLight: 'bg-purple-900/30', hoverBg: 'hover:bg-purple-700' },
    teal: { bg: 'bg-teal-600', text: 'text-teal-500', bgLight: 'bg-teal-900/30', hoverBg: 'hover:bg-teal-700' },
    amber: { bg: 'bg-amber-600', text: 'text-amber-500', bgLight: 'bg-amber-900/30', hoverBg: 'hover:bg-amber-700' },
  };

  return colorMap[color] || colorMap.primary;
};

export default function ShowcasePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // التحقق من صلاحيات المستخدم
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push('/auth/login?error=session_expired');
        return;
      }

      // التحقق من أن المستخدم مسؤول
      if (user.role !== 'admin') {
        router.push('/dashboard?error=access_denied');
        return;
      }

      // تحميل الخدمات
      await loadServices();
    };

    const timer = setTimeout(() => {
      checkAdmin();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, router]);

  // تحميل الخدمات
  const loadServices = async () => {
    setIsLoading(true);
    try {
      const allServices = await ServicesService.getAllServices();
      // ترتيب الخدمات حسب الترتيب المحدد
      const sortedServices = allServices.sort((a, b) => a.display_order - b.display_order);
      setServices(sortedServices);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // إذا كان التحميل جارياً، عرض مؤشر تحميل
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">عرض الخدمات</h1>
          <p className="text-gray-400">
            صفحة عرض الخدمات المخصصة لإنجاز عمون. يمكن مشاركة هذه الصفحة مع الزوار.
          </p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => router.push('/admin')}
          className="flex items-center"
        >
          <FiArrowLeft className="ml-2" /> العودة للوحة الإدارة
        </Button>
      </div>

      <div className="bg-gray-900 p-8 rounded-xl mb-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text">خدمات نقطة للذكاء الاصطناعي</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            مجموعة متكاملة من الخدمات المدعومة بالذكاء الاصطناعي لتلبية احتياجاتك المختلفة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const colorClasses = getColorClasses(service.color);
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                className="h-full"
              >
                <Card className="p-6 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 ${colorClasses.bgLight} rounded-lg ml-4`}>
                      <DynamicIcon 
                        iconName={service.icon_name} 
                        className={`text-2xl ${colorClasses.text}`} 
                      />
                    </div>
                    <h3 className="text-xl font-bold">{service.name}</h3>
                  </div>
                  
                  <p className="text-gray-400 mb-6 flex-grow">
                    {service.description}
                  </p>
                  
                  <div className="mt-auto flex justify-end">
                    {service.is_coming_soon ? (
                      <span className="inline-block px-3 py-1 bg-amber-900/30 text-amber-500 rounded-full text-sm">
                        قريباً
                      </span>
                    ) : (
                      <a 
                        href={service.url} 
                        target={service.url.startsWith('http') ? "_blank" : "_self"}
                        rel={service.url.startsWith('http') ? "noopener noreferrer" : ""}
                        className={`inline-flex items-center px-4 py-2 rounded-lg ${colorClasses.bg} ${colorClasses.hoverBg} text-white transition-colors`}
                      >
                        استخدم الخدمة
                        {service.url.startsWith('http') && <FiExternalLink className="mr-2" />}
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="text-center mt-12 p-6 bg-gray-900 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">مشاركة الصفحة</h2>
        <p className="text-gray-400 mb-6">
          يمكنك مشاركة هذه الصفحة مع الزوار لعرض الخدمات المتاحة في نقطة للذكاء الاصطناعي.
        </p>
        <div className="flex justify-center">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('تم نسخ الرابط بنجاح!');
            }}
          >
            نسخ رابط الصفحة
          </Button>
        </div>
      </div>
    </div>
  );
} 