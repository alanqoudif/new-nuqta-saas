"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiTarget, FiEye, FiCheckCircle, FiUsers, FiTrendingUp, FiGlobe } from 'react-icons/fi';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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

// Team members
const teamMembers = [
  {
    name: 'أحمد محمد',
    role: 'المدير التنفيذي',
    image: 'https://raw.githubusercontent.com/alanqoudif/new-nuqta-saas/main/public/team-1.jpg',
    bio: 'خبير في مجال الذكاء الاصطناعي مع أكثر من 10 سنوات من الخبرة في قيادة مشاريع التقنية المتقدمة.'
  },
  {
    name: 'سارة العلي',
    role: 'مديرة البحث والتطوير',
    image: 'https://raw.githubusercontent.com/alanqoudif/new-nuqta-saas/main/public/team-2.jpg',
    bio: 'متخصصة في الرؤية الحاسوبية والتعلم العميق، قادت العديد من المشاريع البحثية الناجحة في مجال الذكاء الاصطناعي.'
  },
  {
    name: 'محمد العمري',
    role: 'كبير مهندسي البرمجيات',
    image: 'https://raw.githubusercontent.com/alanqoudif/new-nuqta-saas/main/public/team-3.jpg',
    bio: 'مطور برمجيات متمرس مع خبرة واسعة في تطوير تطبيقات الويب والهاتف المحمول المعتمدة على الذكاء الاصطناعي.'
  },
  {
    name: 'نورة الخالدي',
    role: 'مديرة تجربة المستخدم',
    image: 'https://raw.githubusercontent.com/alanqoudif/new-nuqta-saas/main/public/team-4.jpg',
    bio: 'مصممة واجهات مستخدم مبدعة تركز على إنشاء تجارب مستخدم سلسة وجذابة للتطبيقات التقنية المعقدة.'
  }
];

// Value propositions
const values = [
  {
    title: 'الابتكار',
    icon: <FiTarget className="text-primary-600 text-2xl" />,
    description: 'نسعى دائمًا لتطوير حلول مبتكرة تتجاوز التوقعات وتحدث تأثيرًا إيجابيًا حقيقيًا.'
  },
  {
    title: 'التميز',
    icon: <FiCheckCircle className="text-primary-600 text-2xl" />,
    description: 'نلتزم بأعلى معايير الجودة في كل ما نقوم به، ونسعى للتحسين المستمر في خدماتنا.'
  },
  {
    title: 'التعاون',
    icon: <FiUsers className="text-primary-600 text-2xl" />,
    description: 'نؤمن بقوة العمل الجماعي والشراكة مع عملائنا لتحقيق النتائج المرجوة.'
  },
  {
    title: 'النزاهة',
    icon: <FiEye className="text-primary-600 text-2xl" />,
    description: 'نعمل بشفافية ومصداقية في جميع تعاملاتنا ونحرص على بناء علاقات طويلة الأمد مع عملائنا.'
  },
  {
    title: 'النمو',
    icon: <FiTrendingUp className="text-primary-600 text-2xl" />,
    description: 'نتبنى ثقافة التعلم المستمر والتطور لمواكبة أحدث التقنيات وتقديم أفضل الحلول.'
  },
  {
    title: 'المسؤولية',
    icon: <FiGlobe className="text-primary-600 text-2xl" />,
    description: 'نلتزم بالمسؤولية الاجتماعية والبيئية ونسعى لاستخدام التكنولوجيا لخدمة المجتمع.'
  }
];

export default function AboutPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">من نحن</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              نقطة للذكاء الاصطناعي - شركة تقنية مبتكرة تقدم حلول ذكاء اصطناعي متقدمة لتطوير الأعمال
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="section-title text-right">قصتنا</h2>
              <p className="text-gray-600 mb-6 text-lg">
                تأسست نقطة للذكاء الاصطناعي في عام 2018 على يد مجموعة من الخبراء والمتخصصين في مجال الذكاء الاصطناعي والبيانات الضخمة، بهدف تقديم حلول تقنية متقدمة للشركات والمؤسسات في المنطقة العربية.
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                بدأنا رحلتنا بفريق صغير من المهندسين المتحمسين، وسرعان ما نمت الشركة لتصبح واحدة من الشركات الرائدة في مجال الذكاء الاصطناعي في المنطقة.
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                اليوم، نفتخر بفريقنا المكون من أكثر من 50 خبيرًا ومتخصصًا، ونعمل مع العديد من الشركات الرائدة في مختلف القطاعات لمساعدتهم على الاستفادة من قوة الذكاء الاصطناعي في تطوير أعمالهم.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-80 lg:h-96 w-full"
            >
              <Image
                src="https://raw.githubusercontent.com/alanqoudif/new-nuqta-saas/main/public/our-story.jpg"
                alt="قصة نقطة للذكاء الاصطناعي"
                fill
                className="object-cover rounded-lg shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Our Values Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="section-title">قيمنا</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                تعكس قيمنا الأساسية التزامنا تجاه عملائنا ومجتمعنا وبعضنا البعض
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <div className="flex items-center mb-4">
                    {value.icon}
                    <h3 className="text-xl font-semibold mr-3">{value.title}</h3>
                  </div>
                  <p className="text-gray-600">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="section-title">فريقنا</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                نفتخر بفريقنا المتنوع من الخبراء والمتخصصين الملتزمين بتقديم أفضل الحلول
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative h-64 w-full mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                <p className="text-primary-600 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Vision & Mission Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-xl shadow-md"
            >
              <div className="flex items-center mb-6">
                <FiEye className="text-primary-600 text-3xl ml-4" />
                <h2 className="text-2xl font-bold text-gray-900">رؤيتنا</h2>
              </div>
              <p className="text-gray-600 text-lg">
                أن نكون الشريك الأمثل للشركات والمؤسسات في رحلة التحول الرقمي، من خلال تقديم حلول ذكاء اصطناعي مبتكرة تساعدهم على النمو والتطور في عصر التكنولوجيا المتسارع.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-xl shadow-md"
            >
              <div className="flex items-center mb-6">
                <FiTarget className="text-primary-600 text-3xl ml-4" />
                <h2 className="text-2xl font-bold text-gray-900">مهمتنا</h2>
              </div>
              <p className="text-gray-600 text-lg">
                تمكين الشركات والمؤسسات من تحقيق أقصى استفادة من تقنيات الذكاء الاصطناعي من خلال تقديم حلول مبتكرة ومخصصة تساهم في تحسين الكفاءة وزيادة الإنتاجية وتعزيز النمو.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}