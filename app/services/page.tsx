'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiExternalLink, FiArrowLeft, FiX, FiInfo } from 'react-icons/fi';
import { ServicesService, Service } from '@/lib/services-service';
import DynamicIcon from '@/components/ui/DynamicIcon';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import QRCode from 'qrcode.react';

export default function PublicServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetails, setShowServiceDetails] = useState(false);

  // تحميل الخدمات
  useEffect(() => {
    const loadServices = async () => {
      setIsLoading(true);
      try {
        const activeServices = await ServicesService.getActiveServices();
        // ترتيب الخدمات حسب الترتيب المحدد
        const sortedServices = activeServices.sort((a, b) => a.display_order - b.display_order);
        setServices(sortedServices);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  // فتح تفاصيل الخدمة
  const openServiceDetails = (service: Service) => {
    setSelectedService(service);
    setShowServiceDetails(true);
  };

  // إغلاق تفاصيل الخدمة
  const closeServiceDetails = () => {
    setShowServiceDetails(false);
    setTimeout(() => setSelectedService(null), 300); // تأخير لإتاحة تأثير الانتقال
  };

  // إنشاء رابط كامل للخدمة (للرمز QR)
  const getFullServiceUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url;
    }
    // إذا كان الرابط داخلياً، أضف عنوان الموقع الكامل
    const baseUrl = window.location.origin;
    return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
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
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <header className="bg-gray-900 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/nuqtalogo.webp" 
                alt="نقطة للذكاء الاصطناعي" 
                width={40} 
                height={40} 
                className="h-auto ml-3"
              />
              <span className="text-2xl font-bold gradient-text">نقطة الذكاء</span>
            </Link>
            <Link href="/">
              <Button variant="secondary" className="flex items-center">
                <FiArrowLeft className="ml-2" /> العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">خدمات نقطة للذكاء الاصطناعي</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            مجموعة متكاملة من الخدمات المدعومة بالذكاء الاصطناعي لتلبية احتياجاتك المختلفة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
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
                  <div className={`p-3 bg-${service.color}-900/30 rounded-lg ml-4`}>
                    <DynamicIcon 
                      iconName={service.icon_name} 
                      className={`text-2xl text-${service.color}-500`} 
                    />
                  </div>
                  <h3 className="text-xl font-bold">{service.name}</h3>
                </div>
                
                <p className="text-gray-400 mb-6 flex-grow">
                  {service.description}
                </p>
                
                <div className="mt-auto flex justify-between items-center">
                  <Button 
                    variant="secondary" 
                    onClick={() => openServiceDetails(service)}
                    className="flex items-center"
                  >
                    <FiInfo className="ml-2" /> تفاصيل
                  </Button>
                  
                  {service.is_coming_soon ? (
                    <span className="inline-block px-3 py-1 bg-amber-900/30 text-amber-500 rounded-full text-sm">
                      قريباً
                    </span>
                  ) : (
                    <a 
                      href={service.url} 
                      target={service.url.startsWith('http') ? "_blank" : "_self"}
                      rel={service.url.startsWith('http') ? "noopener noreferrer" : ""}
                      className={`inline-flex items-center px-4 py-2 rounded-lg bg-${service.color}-600 hover:bg-${service.color}-700 text-white transition-colors`}
                    >
                      استخدم الخدمة
                      {service.url.startsWith('http') && <FiExternalLink className="mr-2" />}
                    </a>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl">لا توجد خدمات متاحة حالياً.</p>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} نقطة للذكاء الاصطناعي
          </p>
        </div>
      </footer>

      {/* نافذة تفاصيل الخدمة */}
      {selectedService && (
        <div 
          className={`fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
            showServiceDetails ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={closeServiceDetails}
        >
          <motion.div 
            className="bg-gray-900 rounded-xl w-full max-w-3xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: showServiceDetails ? 1 : 0.9, opacity: showServiceDetails ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-b from-${selectedService.color}-900/50 to-gray-900 opacity-50`}></div>
              <div className="relative p-6 flex justify-between items-start">
                <div className="flex items-center">
                  <div className={`p-4 bg-${selectedService.color}-900/30 rounded-lg ml-4`}>
                    <DynamicIcon 
                      iconName={selectedService.icon_name} 
                      className={`text-3xl text-${selectedService.color}-500`} 
                    />
                  </div>
                  <h2 className="text-2xl font-bold">{selectedService.name}</h2>
                </div>
                <button 
                  onClick={closeServiceDetails}
                  className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold mb-4">وصف الخدمة</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {selectedService.description}
                </p>

                <h3 className="text-xl font-bold mb-4">كيفية الاستخدام</h3>
                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>قم بالدخول إلى حسابك في منصة نقطة للذكاء الاصطناعي</li>
                    <li>انتقل إلى خدمة {selectedService.name} من لوحة التحكم</li>
                    <li>اتبع التعليمات الخاصة بالخدمة للبدء في استخدامها</li>
                    <li>استمتع بتجربة الذكاء الاصطناعي المتقدمة!</li>
                  </ol>
                </div>

                <div className="flex flex-wrap gap-4">
                  {selectedService.is_coming_soon ? (
                    <span className="inline-block px-4 py-2 bg-amber-900/30 text-amber-500 rounded-lg text-sm">
                      هذه الخدمة قادمة قريباً، ترقبوها!
                    </span>
                  ) : (
                    <a 
                      href={selectedService.url} 
                      target={selectedService.url.startsWith('http') ? "_blank" : "_self"}
                      rel={selectedService.url.startsWith('http') ? "noopener noreferrer" : ""}
                      className={`inline-flex items-center px-6 py-3 rounded-lg bg-${selectedService.color}-600 hover:bg-${selectedService.color}-700 text-white transition-colors`}
                    >
                      استخدم الخدمة الآن
                      {selectedService.url.startsWith('http') && <FiExternalLink className="mr-2" />}
                    </a>
                  )}
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="bg-white p-4 rounded-lg flex flex-col items-center">
                  <h3 className="text-lg font-bold mb-3 text-gray-900">امسح الرمز للوصول السريع</h3>
                  <QRCode 
                    value={getFullServiceUrl(selectedService.url)}
                    size={180}
                    level="H"
                    includeMargin={true}
                    className="mb-3"
                  />
                  <p className="text-sm text-gray-700 text-center">
                    امسح رمز QR باستخدام كاميرا هاتفك للوصول المباشر إلى الخدمة
                  </p>
                </div>

                <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-bold mb-3">مميزات الخدمة</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>سهولة الاستخدام والتكامل</li>
                    <li>دعم فني متواصل</li>
                    <li>تحديثات مستمرة</li>
                    <li>تخصيص حسب احتياجاتك</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 