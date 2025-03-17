"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiServer, FiCode, FiMessageSquare, FiArrowRight, FiUser, FiExternalLink } from 'react-icons/fi';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EarlyAccessModal from '@/components/ui/EarlyAccessModal';
import ExternalServiceModal from '@/components/ui/ExternalServiceModal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

// أضف هذا النمط لإخفاء العنصر غير المرغوب فيه
const hideUnwantedElement = {
  '.nuqta-logo-footer': {
    display: 'none !important'
  }
};

// التأثيرات الحركية
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
  const { user } = useAuth();
  const [sessionStatus, setSessionStatus] = useState<string>('checking');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isEarlyAccessModalOpen, setIsEarlyAccessModalOpen] = useState(false);
  const [isExternalServiceModalOpen, setIsExternalServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [externalServiceUrl, setExternalServiceUrl] = useState<string>('');
  
  // إضافة حالة لنموذج الاتصال
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // التحقق من حالة الجلسة عند تحميل الصفحة
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSessionStatus(session ? 'active' : 'none');
        setUserEmail(session?.user?.email || null);
        
        console.log('Home page session check:', session ? 'Active' : 'None', 'User:', session?.user?.email || 'None');
      } catch (error) {
        console.error('Error checking session in Home page:', error);
        setSessionStatus('error');
      }
    };
    
    checkSession();
  }, []);

  // تحديد ما إذا كان يجب عرض أزرار المصادقة
  const isAuthenticated = user || sessionStatus === 'active';
  
  // معلومات المستخدم للعرض
  const displayName = user?.full_name || userEmail || 'المستخدم';

  // تحديث حالة النموذج
  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // إرسال نموذج الاتصال
  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // إرسال البيانات إلى Supabase
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: contactForm.name,
            email: contactForm.email,
            subject: contactForm.subject,
            message: contactForm.message,
            created_at: new Date().toISOString()
          }
        ]);
        
      if (error) throw error;
      
      toast.success('تم إرسال رسالتك بنجاح!');
      
      // إعادة تعيين النموذج
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // فتح نموذج الوصول المبكر
  const openEarlyAccessModal = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsEarlyAccessModalOpen(true);
  };

  // فتح نافذة الخدمة الخارجية
  const openExternalServiceModal = (serviceName: string, serviceUrl: string) => {
    setSelectedService(serviceName);
    setExternalServiceUrl(serviceUrl);
    setIsExternalServiceModalOpen(true);
  };

  // توجيه المستخدم إلى الخدمة الخارجية
  const handleExternalServiceConfirm = () => {
    window.open(externalServiceUrl, '_blank');
    setIsExternalServiceModalOpen(false);
  };

  const services = [
    {
      id: 'privateai',
      icon: <FiServer className="text-4xl text-primary-500" />,
      title: 'الذكاء الاصطناعي الخاص',
      description: 'قم بتنفيذ نماذج ذكاء اصطناعي متقدمة في بنيتك التحتية الخاصة مع خصوصية كاملة والتحكم في البيانات.',
      comingSoon: true,
      href: '#',
      isExternal: false,
      onClick: () => openEarlyAccessModal('الذكاء الاصطناعي الخاص')
    },
    {
      id: 'site-builder',
      icon: <FiCode className="text-4xl text-secondary-500" />,
      title: 'بناء المواقع بالذكاء الاصطناعي',
      description: 'أنشئ مواقع ويب مذهلة في دقائق باستخدام الذكاء الاصطناعي. فقط صف ما تحتاجه.',
      comingSoon: true,
      href: '#',
      isExternal: false,
      onClick: () => openEarlyAccessModal('بناء المواقع بالذكاء الاصطناعي')
    },
    {
      id: 'whatsapp-chatbot',
      icon: <FiMessageSquare className="text-4xl text-accent-500" />,
      title: 'روبوت واتساب',
      description: 'دمج روبوتات محادثة ذكية في واتساب لخدمة العملاء الآلية والمخصصة.',
      comingSoon: true,
      href: 'https://wa.me/966500000000',
      isExternal: true,
      onClick: () => openExternalServiceModal('روبوت واتساب', 'https://wa.me/966500000000')
    }
  ];

  return (
    <>
      <style jsx global>{`
        .nuqta-logo-footer, 
        img[alt="نقطة للذكاء الاصطناعي"] + .nuqta-logo-footer,
        img[src*="nuqtalogo"] + .nuqta-logo-footer,
        img[src*="nuqta"] + .nuqta-logo-footer,
        .footer-logo-text {
          display: none !important;
        }
      `}</style>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 z-0"></div>
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#5d5d5d_1px,transparent_1px)] [background-size:16px_16px] z-0"></div>
          
          <div className="container-custom relative z-10 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex justify-center mb-6">
                <Image 
                  src="/nuqtalogo.webp" 
                  alt="نقطة للذكاء الاصطناعي" 
                  width={150} 
                  height={150} 
                  className="h-auto"
                />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
                حلول الذكاء الاصطناعي المتقدمة لتطوير أعمالك
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                نقدم خدمات ذكاء اصطناعي متكاملة تساعدك على تحسين أعمالك وزيادة إنتاجيتك
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                      <FiUser className="text-primary-400 mr-2" />
                      <span>مرحباً، {displayName}</span>
                    </div>
                    <Link href="/dashboard">
                      <Button variant="gradient" size="lg">
                        لوحة التحكم
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="gradient" 
                      size="lg"
                      onClick={() => openEarlyAccessModal('خدمات نقطة للذكاء الاصطناعي')}
                    >
                      الوصول المبكر
                    </Button>
                    <Link href="/auth/login">
                      <Button variant="outline" size="lg">
                        تسجيل الدخول
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-16 relative"
            >
              <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-gray-700 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 z-0"></div>
                <img 
                  src="/images/dashboard-preview.png" 
                  alt="نقطة للذكاء الاصطناعي" 
                  className="w-full h-auto relative z-10"
                />
              </div>
            </motion.div>
          </div>
          
          <div className="absolute bottom-10 left-0 right-0 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <a href="#services" className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
                </svg>
              </a>
            </motion.div>
          </div>
        </section>

        {/* Dashboard Access Section - يظهر فقط للمستخدمين المسجلين */}
        {isAuthenticated && (
          <section className="py-16 bg-gray-900">
            <div className="container-custom">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="bg-gradient-to-r from-primary-900/50 to-secondary-900/50 rounded-xl p-8 border border-gray-800"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <motion.h2 variants={fadeIn} className="text-2xl font-bold mb-2">
                      مرحباً بك، {displayName}
                    </motion.h2>
                    <motion.p variants={fadeIn} className="text-gray-300">
                      يمكنك الوصول إلى لوحة التحكم الخاصة بك والاستفادة من جميع خدماتنا.
                    </motion.p>
                  </div>
                  <motion.div variants={fadeIn}>
                    <Link href="/dashboard">
                      <Button variant="gradient" size="lg">
                        الذهاب إلى لوحة التحكم <FiArrowRight className="mr-2" />
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Services Section */}
        <section id="services" className="section bg-gray-950 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent"></div>
          <div className="container-custom relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4 gradient-text"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                خدماتنا
              </motion.h2>
              <motion.p 
                className="text-gray-400 text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                اكتشف كيف يمكن لحلول الذكاء الاصطناعي لدينا تحويل عملك وتحسين إنتاجيتك.
              </motion.p>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {services.map((service) => (
                <motion.div key={service.id} variants={fadeIn}>
                  <Card gradient className="h-full p-6 flex flex-col">
                    <div className="mb-4">{service.icon}</div>
                    <h3 className="text-xl font-bold mb-2 flex items-center">
                      {service.title}
                      {service.comingSoon && (
                        <span className="mr-2 text-xs font-medium bg-primary-500/20 text-primary-300 px-2 py-1 rounded-full">
                          قريبًا
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-400 mb-6 flex-grow">{service.description}</p>
                    <button 
                      onClick={service.onClick}
                      className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      {service.isExternal ? (
                        <>الانتقال إلى الخدمة <FiExternalLink className="mr-2" /></>
                      ) : (
                        <>طلب وصول مبكر <FiArrowRight className="mr-2" /></>
                      )}
                    </button>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="section bg-gray-950 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-secondary-900/20 via-transparent to-transparent"></div>
          <div className="container-custom relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                  عن نقطة للذكاء الاصطناعي
                </h2>
                <p className="text-gray-300 mb-6">
                  في نقطة للذكاء الاصطناعي، نؤمن بأن الذكاء الاصطناعي يجب أن يكون متاحًا للجميع. مهمتنا هي تسهيل الوصول إلى تقنيات الذكاء الاصطناعي المتقدمة، مما يتيح للشركات من جميع الأحجام الاستفادة من إمكاناتها.
                </p>
                <p className="text-gray-300 mb-6">
                  يعمل فريقنا من خبراء الذكاء الاصطناعي وتطوير البرمجيات باستمرار على إنشاء حلول مبتكرة تحل المشكلات الحقيقية وتخلق قيمة لعملائنا.
                </p>
                <div className="flex flex-wrap gap-4 mt-8">
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <h3 className="text-2xl font-bold text-primary-400 mb-1">+100</h3>
                    <p className="text-gray-400 text-sm">عميل راضٍ</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <h3 className="text-2xl font-bold text-secondary-400 mb-1">+3</h3>
                    <p className="text-gray-400 text-sm">خدمات ذكاء اصطناعي</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <h3 className="text-2xl font-bold text-accent-400 mb-1">24/7</h3>
                    <p className="text-gray-400 text-sm">دعم فني</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative h-[400px] rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-accent-500/20 rounded-xl backdrop-blur-sm border border-gray-800/50 shadow-2xl"></div>
                  
                  {/* عناصر زخرفية */}
                  <motion.div 
                    className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary-500/10 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-secondary-500/10 rounded-full"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
                  />
                  <motion.div 
                    className="absolute top-1/2 right-1/3 w-24 h-24 bg-accent-500/10 rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.5 }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* قسم الدعوة للعمل */}
        <section className="section bg-gray-950 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent-900/20 via-transparent to-transparent"></div>
          <div className="container-custom relative z-10">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                هل أنت مستعد لتحويل عملك باستخدام الذكاء الاصطناعي؟
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                انضم إلى نقطة للذكاء الاصطناعي اليوم واكتشف كيف يمكن لحلولنا مساعدتك في تحقيق أهدافك.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  variant="gradient" 
                  size="lg"
                  onClick={() => openEarlyAccessModal('خدمات نقطة للذكاء الاصطناعي')}
                >
                  طلب وصول مبكر
                </Button>
                <Link href="/#contact">
                  <Button variant="outline" size="lg">
                    تواصل مع المبيعات
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section id="contact" className="section bg-gray-950">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4 gradient-text"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                اتصل بنا
              </motion.h2>
              <motion.p 
                className="text-gray-400 text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                هل لديك أسئلة أو تحتاج إلى مزيد من المعلومات؟ نحن هنا للمساعدة.
              </motion.p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-6 h-full">
                  <h3 className="text-xl font-bold mb-4">معلومات الاتصال</h3>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      <strong className="text-white">البريد الإلكتروني:</strong>{' '}
                      <a href="mailto:info@nuqtai.com" className="text-primary-400 hover:text-primary-300 transition-colors">
                        info@nuqtai.com
                      </a>
                    </p>
                    <p>
                      <strong className="text-white">الهاتف:</strong> +968 77442969
                    </p>
                    <p>
                      <strong className="text-white">العنوان:</strong> مسقط الخوير
                    </p>
                    <p>
                      <strong className="text-white">ساعات العمل:</strong> الاثنين إلى الجمعة، 9:00 صباحًا - 6:00 مساءً
                    </p>
                  </div>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-6 h-full">
                  <h3 className="text-xl font-bold mb-4">أرسل لنا رسالة</h3>
                  <form className="space-y-4" onSubmit={handleContactFormSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="label">الاسم</label>
                        <input 
                          type="text" 
                          id="name" 
                          className="input w-full" 
                          placeholder="اسمك" 
                          value={contactForm.name}
                          onChange={handleContactFormChange}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="label">البريد الإلكتروني</label>
                        <input 
                          type="email" 
                          id="email" 
                          className="input w-full" 
                          placeholder="بريدك@example.com" 
                          value={contactForm.email}
                          onChange={handleContactFormChange}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="label">الموضوع</label>
                      <input 
                        type="text" 
                        id="subject" 
                        className="input w-full" 
                        placeholder="موضوع الرسالة" 
                        value={contactForm.subject}
                        onChange={handleContactFormChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="label">الرسالة</label>
                      <textarea 
                        id="message" 
                        rows={4} 
                        className="input w-full" 
                        placeholder="رسالتك..." 
                        value={contactForm.message}
                        onChange={handleContactFormChange}
                        required
                      ></textarea>
                    </div>
                    <Button 
                      variant="gradient" 
                      type="submit" 
                      fullWidth
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                    </Button>
                  </form>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* نموذج الوصول المبكر */}
      <EarlyAccessModal 
        isOpen={isEarlyAccessModalOpen} 
        onClose={() => setIsEarlyAccessModalOpen(false)} 
        serviceName={selectedService}
      />
      
      <ExternalServiceModal
        isOpen={isExternalServiceModalOpen}
        onClose={() => setIsExternalServiceModalOpen(false)}
        serviceName={selectedService}
        serviceUrl={externalServiceUrl}
        onConfirm={handleExternalServiceConfirm}
      />
    </>
  );
} 