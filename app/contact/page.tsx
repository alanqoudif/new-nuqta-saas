"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    // Simulate form submission
    try {
      // In a real application, you would send the form data to your backend/API here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitError('حدث خطأ أثناء إرسال النموذج. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">اتصل بنا</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              نحن هنا للإجابة على استفساراتك ومساعدتك في العثور على الحلول المناسبة لاحتياجاتك
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Contact Info & Form Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-8 gradient-text">معلومات التواصل</h2>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-3 bg-primary-50 rounded-full">
                    <FiMail className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="mr-4">
                    <h3 className="text-xl font-semibold mb-1">البريد الإلكتروني</h3>
                    <a href="mailto:info@nuqta.ai" className="text-gray-600 hover:text-primary-600 transition-colors">
                      info@nuqta.ai
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-3 bg-primary-50 rounded-full">
                    <FiPhone className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="mr-4">
                    <h3 className="text-xl font-semibold mb-1">الهاتف</h3>
                    <a href="tel:+9661234567890" className="text-gray-600 hover:text-primary-600 transition-colors">
                      +966 12 345 6789
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-3 bg-primary-50 rounded-full">
                    <FiMapPin className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="mr-4">
                    <h3 className="text-xl font-semibold mb-1">العنوان</h3>
                    <address className="not-italic text-gray-600">
                      طريق الملك فهد، حي العليا<br />
                      الرياض، المملكة العربية السعودية
                    </address>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4">ساعات العمل</h3>
                <p className="text-gray-600 mb-2">الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً</p>
                <p className="text-gray-600">الجمعة - السبت: مغلق</p>
              </div>
            </motion.div>
            
            {/* Contact Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-8 gradient-text">أرسل لنا رسالة</h2>
              
              {submitSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">تم إرسال رسالتك بنجاح!</h3>
                  <p className="text-green-700">سنقوم بالرد عليك في أقرب وقت ممكن. شكراً لتواصلك معنا.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-2">الاسم</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">البريد الإلكتروني</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">رقم الهاتف (اختياري)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">الموضوع</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        required
                      >
                        <option value="">اختر موضوعاً</option>
                        <option value="استفسار عام">استفسار عام</option>
                        <option value="طلب عرض سعر">طلب عرض سعر</option>
                        <option value="خدمة العملاء">خدمة العملاء</option>
                        <option value="تقني">دعم تقني</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">الرسالة</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      required
                    ></textarea>
                  </div>
                  
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3">
                      {submitError}
                    </div>
                  )}
                  
                  <div>
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      size="lg"
                      disabled={isSubmitting}
                      icon={<FiSend />}
                    >
                      {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold mb-4 gradient-text">موقعنا</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              يمكنك زيارتنا في مقر الشركة في الرياض للتحدث معنا شخصيًا
            </p>
          </motion.div>
          
          <div className="rounded-xl overflow-hidden shadow-lg h-96 w-full">
            {/* For simplicity, using an iframe for Google Maps - In a real app, consider using a proper Maps component */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.6859924805266!2d46.67121501576599!3d24.69022815489158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sKing%20Fahd%20Rd%2C%20Riyadh%20Saudi%20Arabia!5e0!3m2!1sen!2sus!4v1629283381647!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              title="موقع الشركة"
            ></iframe>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}