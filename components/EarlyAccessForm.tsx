"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { saveEarlyAccess } from '@/utils/supabase';

export default function EarlyAccessForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('يرجى إدخال بريد إلكتروني صالح');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const result = await saveEarlyAccess(email);
      
      if (result.success) {
        setSubmitStatus('success');
        setEmail('');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error saving early access email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4" dir="rtl">
      <div className="container mx-auto max-w-4xl">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">احصل على وصول مبكر</h2>
          <p className="text-lg text-blue-100">سجل الآن للحصول على وصول مبكر إلى منصتنا وكن أول من يجرب ميزاتنا المتقدمة.</p>
        </motion.div>
        
        <motion.div
          className="bg-white rounded-lg p-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {submitStatus === 'success' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              تم تسجيل بريدك الإلكتروني بنجاح! سنتواصل معك قريبًا.
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="early-access-email" className="block text-gray-700 font-medium mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                id="early-access-email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="example@example.com"
                disabled={isSubmitting}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <div className="md:self-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full md:w-auto bg-blue-600 text-white py-3 px-8 rounded-lg font-bold hover:bg-blue-700 transition duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'جاري التسجيل...' : 'التسجيل الآن'}
              </button>
            </div>
          </form>
          <p className="text-gray-600 mt-4 text-sm text-center">لن نقوم بمشاركة بريدك الإلكتروني مع أي جهة خارجية.</p>
        </motion.div>
      </div>
    </div>
  );
}