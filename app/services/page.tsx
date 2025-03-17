"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiServer, FiCode, FiMessageSquare, FiLayers, FiDatabase, FiUser, FiShield, FiActivity } from 'react-icons/fi';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';

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
      staggerChildren: 0.1
    }
  }
};

// Service details
const serviceDetails = [
  {
    id: 'nlp',
    title: 'معالجة اللغة الطبيعية',
    icon: <FiMessageSquare />,
    description: 'حلول متقدمة لفهم وتحليل النصوص واستخراج البيانات والمعلومات منها بكفاءة عالية',
    features: [
      'تحليل المشاعر والآراء',
      'استخراج المعلومات من النصوص',
      'تصنيف المحتوى تلقائياً',
      'بناء روبوتات المحادثة الذكية',
      'الملخصات التلقائية للنصوص الطويلة',
      'الترجمة الآلية المتقدمة'
    ]
  },
  {
    id: 'app-dev',
    title: 'تطوير التطبيقات الذكية',
    icon: <FiCode />,
    description: 'تصميم وتطوير تطبيقات مدعومة بالذكاء الاصطناعي تناسب احتياجات عملك الخاصة',
    features: [
      'تطبيقات ويب تفاعلية',
      'تطبيقات الهاتف المحمول',
      'منصات الويب المتكاملة',
      'واجهات برمجة التطبيقات (API)',
      'خدمات الويب المتقدمة',
      'تكامل مع أنظمة الشركات'
    ]
  },
  {
    id: 'data-analytics',
    title: 'تحليل البيانات الضخمة',
    icon: <FiDatabase />,
    description: 'استخراج الرؤى القيمة من بياناتك باستخدام خوارزميات متقدمة واتخاذ قرارات مدعومة بالبيانات',
    features: [
      'تحليل البيانات الوصفي والتنبؤي',
      'لوحات المعلومات التفاعلية',
      'تقارير آلية متقدمة',
      'اكتشاف الأنماط في البيانات',
      'تحليل سلوك المستخدمين',
      'استخراج مؤشرات الأداء الرئيسية'
    ]
  },
  {
    id: 'cloud',
    title: 'الحوسبة السحابية',
    icon: <FiServer />,
    description: 'بنية تحتية متكاملة وحلول سحابية مرنة تدعم تطبيقات الذكاء الاصطناعي الخاصة بك',
    features: [
      'خدمات استضافة مخصصة للذكاء الاصطناعي',
      'تحليل البيانات السحابية',
      'الخدمات السحابية الهجينة',
      'إدارة البنية التحتية',
      'أمان البيانات في السحابة',
      'قابلية التوسع والمرونة'
    ]
  },
  {
    id: 'computer-vision',
    title: 'الرؤية الحاسوبية',
    icon: <FiLayers />,
    description: 'حلول متطورة لتحليل الصور والفيديو واستخراج معلومات قيمة منها بدقة عالية',
    features: [
      'التعرف على الوجوه',
      'كشف الأجسام والمنتجات',
      'تحليل المشاهد وتفسيرها',
      'مراقبة الجودة الآلية',
      'تحليل الفيديو في الوقت الفعلي',
      'التصنيف التلقائي للصور'
    ]
  },
  {
    id: 'consulting',
    title: 'الاستشارات التقنية',
    icon: <FiUser />,
    description: 'خدمات استشارية متخصصة لمساعدتك على اختيار أفضل التقنيات والحلول لأعمالك',
    features: [
      'تقييم الاحتياجات التقنية',
      'استراتيجيات التحول الرقمي',
      'اختيار الحلول التقنية المناسبة',
      'تدريب الفرق على التقنيات الجديدة',
      'دراسات الجدوى التقنية',
      'خطط تنفيذ المشاريع التقنية'
    ]
  },
  {
    id: 'security',
    title: 'أمن المعلومات',
    icon: <FiShield />,
    description: 'حلول أمنية متكاملة لحماية بياناتك ونظمك من التهديدات الإلكترونية',
    features: [
      'تقييم المخاطر الأمنية',
      'حماية البيانات والخصوصية',
      'كشف التهديدات المتقدم',
      'الاستجابة للحوادث الأمنية',
      'تشفير البيانات',
      'إدارة هويات المستخدمين'
    ]
  },
  {
    id: 'ml-solutions',
    title: 'حلول التعلم الآلي',
    icon: <FiActivity />,
    description: 'تطوير نماذج وخوارزميات تعلم آلي مخصصة لحل مشكلات الأعمال المعقدة',
    features: [
      'أنظمة التوصية الذكية',
      'التنبؤ بسلوك العملاء',
      'التنبؤ بالمبيعات والطلب',
      'اكتشاف الغش والاحتيال',
      'تحسين العمليات التشغيلية',
      'أتمتة عمليات الأعمال'
    ]
  }
];

export default function ServicesPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-32 pb-20 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">خدماتنا</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              نقدم مجموعة متكاملة من خدمات الذكاء الاصطناعي المصممة خصيصًا لتلبية احتياجات عملك
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Services List Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {serviceDetails.map((service) => (
              <motion.div key={service.id} variants={fadeIn}>
                <Card 
                  title={service.title} 
                  icon={service.icon}
                  className="h-full"
                >
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Custom Solutions Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-80 lg:h-96 w-full"
            >
              <Image
                src="https://raw.githubusercontent.com/alanqoudif/new-nuqta-saas/main/public/custom-solutions.png"
                alt="حلول مخصصة"
                fill
                className="object-cover rounded-lg shadow-xl"
              />
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="section-title text-right">حلول مخصصة لاحتياجاتك</h2>
              <p className="text-gray-600 mb-6 text-lg">
                نحن نفهم أن كل عمل فريد من نوعه ويواجه تحديات مختلفة. لذلك نقدم حلولًا مخصصة تماماً لتلبية احتياجاتك الخاصة.
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                يعمل فريقنا معك عن كثب لفهم أهدافك واحتياجاتك، ثم تصميم وتنفيذ الحلول التي تحقق أقصى قيمة لعملك.
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                من تحليل البيانات إلى تطوير التطبيقات المخصصة وأتمتة العمليات، نحن هنا لمساعدتك في تحقيق النجاح من خلال تقنيات الذكاء الاصطناعي المتقدمة.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}