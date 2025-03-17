"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiServer, FiCode, FiMessageSquare, FiArrowRight, FiUser, FiDatabase, FiLayers } from 'react-icons/fi';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// Animation variants
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

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="absolute inset-0 opacity-20 bg-[url('/nuqta-pattern.png')] bg-repeat"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              حلول <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600">الذكاء الاصطناعي</span> المتقدمة لتطوير أعمالك
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200">
              نقدم خدمات ذكاء اصطناعي متكاملة تساعدك على تحسين أعمالك وزيادة إنتاجيتك
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                href="/services" 
                variant="secondary" 
                size="lg"
                icon={<FiArrowRight className="mr-2" />}
              >
                استكشف خدماتنا
              </Button>
              <Button 
                href="/contact" 
                variant="outline" 
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20"
              >
                تواصل معنا
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-64 md:h-96 w-full"
          >
            <Image
              src="https://raw.githubusercontent.com/alanqoudif/new-nuqta-saas/main/public/hero-image.png"
              alt="الذكاء الاصطناعي"
              fill
              priority
              className="object-contain"
            />
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>
      
      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">خدماتنا</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نقدم مجموعة متنوعة من الخدمات المبتكرة المعتمدة على الذكاء الاصطناعي
            </p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeIn}>
              <Card 
                title="معالجة اللغة الطبيعية" 
                icon={<FiMessageSquare />}
                className="h-full"
              >
                <p className="text-gray-600">
                  حلول متقدمة لفهم وتحليل النصوص واستخراج البيانات والمعلومات منها بكفاءة عالية
                </p>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card 
                title="تطوير التطبيقات الذكية" 
                icon={<FiCode />}
                className="h-full"
              >
                <p className="text-gray-600">
                  تصميم وتطوير تطبيقات مدعومة بالذكاء الاصطناعي تناسب احتياجات عملك الخاصة
                </p>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card 
                title="تحليل البيانات الضخمة" 
                icon={<FiDatabase />}
                className="h-full"
              >
                <p className="text-gray-600">
                  استخراج الرؤى القيمة من بياناتك باستخدام خوارزميات متقدمة واتخاذ قرارات مدعومة بالبيانات
                </p>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card 
                title="الحوسبة السحابية" 
                icon={<FiServer />}
                className="h-full"
              >
                <p className="text-gray-600">
                  بنية تحتية متكاملة وحلول سحابية مرنة تدعم تطبيقات الذكاء الاصطناعي الخاصة بك
                </p>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card 
                title="الرؤية الحاسوبية" 
                icon={<FiLayers />}
                className="h-full"
              >
                <p className="text-gray-600">
                  حلول متطورة لتحليل الصور والفيديو واستخراج معلومات قيمة منها بدقة عالية
                </p>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card 
                title="الاستشارات التقنية" 
                icon={<FiUser />}
                className="h-full"
              >
                <p className="text-gray-600">
                  خدمات استشارية متخصصة لمساعدتك على اختيار أفضل التقنيات والحلول لأعمالك
                </p>
              </Card>
            </motion.div>
          </motion.div>
          
          <div className="text-center mt-12">
            <Button href="/services" icon={<FiArrowRight className="mr-2" />}>
              عرض جميع الخدمات
            </Button>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-16 md:py-24 bg-gray-50" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="section-title text-right">من نحن</h2>
              <p className="text-gray-600 mb-6 text-lg">
                نقطة للذكاء الاصطناعي هي شركة تقنية متخصصة في تقديم حلول مبتكرة معتمدة على الذكاء الاصطناعي للشركات والمؤسسات.
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                فريقنا مكون من خبراء ومتخصصين في مجالات الذكاء الاصطناعي والبيانات الضخمة وتطوير البرمجيات، نعمل معًا لتقديم حلول متكاملة تساعد عملائنا على تحقيق أهدافهم وتطوير أعمالهم.
              </p>
              <p className="text-gray-600 mb-8 text-lg">
                نؤمن بأن تقنيات الذكاء الاصطناعي يمكنها إحداث تغيير إيجابي في كيفية عمل الشركات وتفاعلها مع عملائها، ونسعى لجعل هذه التقنيات في متناول الجميع.
              </p>
              <Button href="/about">تعرف علينا أكثر</Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-80 lg:h-96 w-full"
            >
              <Image
                src="https://raw.githubusercontent.com/alanqoudif/new-nuqta-saas/main/public/about-image.png"
                alt="فريق نقطة للذكاء الاصطناعي"
                fill
                className="object-cover rounded-lg shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">جاهز لتطوير أعمالك مع الذكاء الاصطناعي؟</h2>
            <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto">
              تواصل معنا اليوم لمناقشة كيف يمكننا مساعدتك في تحقيق أهدافك باستخدام أحدث تقنيات الذكاء الاصطناعي
            </p>
            <Button 
              href="/contact" 
              variant="secondary"
              size="lg"
              className="bg-white text-primary-700 hover:bg-gray-100"
            >
              تواصل معنا الآن
            </Button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}