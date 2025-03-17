'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiInfo, FiMail, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EarlyAccessModal from '@/components/ui/EarlyAccessModal';
import ServiceAccessCheck from '@/components/ui/ServiceAccessCheck';
import Link from 'next/link';

export default function SiteBuilderPage() {
  const { user } = useAuth();
  const [isEarlyAccessModalOpen, setIsEarlyAccessModalOpen] = useState(false);

  // محتوى الصفحة الرئيسي (يظهر عندما تكون الخدمة متاحة)
  const MainContent = () => (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <FiCode className="ml-3 text-secondary-500" /> منشئ المواقع الذكي
        </h1>
        <p className="text-gray-400">
          أنشئ مواقع ويب مذهلة في دقائق باستخدام الذكاء الاصطناعي.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">مشاريعك</h2>
            
            {/* هنا يمكن إضافة قائمة المشاريع في المستقبل */}
            <div className="text-center py-8">
              <p className="text-gray-400 mb-6">لم تقم بإنشاء أي مشروع بعد. ابدأ بإنشاء موقعك الأول!</p>
              
              <Link href="/dashboard/site-builder/editor" className="inline-block">
                <Button variant="gradient" className="flex items-center">
                  إنشاء موقع جديد <FiArrowRight className="mr-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">حول منشئ المواقع الذكي</h2>
            <p className="text-gray-400 mb-4">
              منشئ المواقع الذكي هو أداة تستخدم الذكاء الاصطناعي لإنشاء مواقع ويب كاملة بناءً على وصفك النصي.
            </p>
            <h3 className="text-lg font-bold mb-2">المميزات الرئيسية</h3>
            <ul className="list-disc list-inside text-gray-400 space-y-1 mb-4">
              <li>إنشاء موقع كامل من وصف نصي</li>
              <li>تخصيص التصميم والألوان</li>
              <li>إضافة صفحات وأقسام بسهولة</li>
              <li>نشر الموقع بنقرة واحدة</li>
              <li>تحديثات مستمرة للتصميم</li>
            </ul>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <Card gradient className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-grow">
              <h2 className="text-xl font-bold mb-2">كيف يعمل؟</h2>
              <p className="text-gray-300">
                ما عليك سوى وصف ما تحتاجه وسيقوم الذكاء الاصطناعي بإنشاء موقع ويب كامل لك. ثم يمكنك تخصيصه حسب رغبتك.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );

  // محتوى الوصول المبكر (يظهر عندما تكون الخدمة في مرحلة الوصول المبكر)
  const EarlyAccessContent = () => (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <FiCode className="ml-3 text-secondary-500" /> منشئ المواقع الذكي
        </h1>
        <p className="text-gray-400">
          أنشئ مواقع ويب مذهلة في دقائق باستخدام الذكاء الاصطناعي.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-secondary-500/20 rounded-full flex items-center justify-center mb-6">
              <FiInfo className="text-secondary-500 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold mb-4">الوصول المبكر</h2>
            <p className="text-gray-300 mb-6 max-w-lg">
              منشئ المواقع الذكي حالياً في مرحلة الوصول المبكر. سيتم إرسال رسالة إليك عندما يتم تفعيل حسابك للوصول إلى هذه الخدمة.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="gradient"
                icon={<FiMail />}
                onClick={() => setIsEarlyAccessModalOpen(true)}
              >
                طلب وصول مبكر
              </Button>
            </div>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">حول منشئ المواقع الذكي</h2>
            <p className="text-gray-400 mb-4">
              منشئ المواقع الذكي هو أداة تستخدم الذكاء الاصطناعي لإنشاء مواقع ويب كاملة بناءً على وصفك النصي.
            </p>
            <h3 className="text-lg font-bold mb-2">المميزات الرئيسية</h3>
            <ul className="list-disc list-inside text-gray-400 space-y-1 mb-4">
              <li>إنشاء موقع كامل من وصف نصي</li>
              <li>تخصيص التصميم والألوان</li>
              <li>إضافة صفحات وأقسام بسهولة</li>
              <li>نشر الموقع بنقرة واحدة</li>
              <li>تحديثات مستمرة للتصميم</li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              ملاحظة: هذه الخدمة متاحة حالياً للمستخدمين المختارين في مرحلة الوصول المبكر.
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-12">
        <Card gradient className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-grow">
              <h2 className="text-xl font-bold mb-2">كيف يعمل؟</h2>
              <p className="text-gray-300">
                ما عليك سوى وصف ما تحتاجه وسيقوم الذكاء الاصطناعي بإنشاء موقع ويب كامل لك. ثم يمكنك تخصيصه حسب رغبتك.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );

  return (
    <div className="py-6" dir="rtl">
      <ServiceAccessCheck servicePath="/dashboard/site-builder">
        <MainContent />
      </ServiceAccessCheck>

      {/* نموذج الوصول المبكر */}
      <EarlyAccessModal 
        isOpen={isEarlyAccessModalOpen} 
        onClose={() => setIsEarlyAccessModalOpen(false)} 
        serviceName="منشئ المواقع الذكي"
      />
    </div>
  );
} 