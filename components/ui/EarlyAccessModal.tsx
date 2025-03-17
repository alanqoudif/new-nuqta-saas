"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';
import Button from './Button';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface EarlyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName?: string;
}

const EarlyAccessModal: React.FC<EarlyAccessModalProps> = ({ isOpen, onClose, serviceName = 'الخدمة' }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // حفظ البيانات في جدول early_access_requests
      const { error } = await supabase
        .from('early_access_requests')
        .insert([
          {
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            company_name: formData.companyName,
            service_name: serviceName,
            notes: formData.notes,
            status: 'pending'
          }
        ]);

      if (error) {
        console.error('Error submitting early access request:', error);
        toast.error('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
        setIsSubmitting(false);
        return;
      }

      // إظهار رسالة النجاح
      setIsSuccess(true);
      toast.success('تم إرسال طلب الوصول المبكر بنجاح!');
      
      // إعادة تعيين النموذج بعد 3 ثوانٍ
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          companyName: '',
          notes: ''
        });
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <FiX size={24} />
              </button>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-1 text-center">طلب وصول مبكر</h2>
                <p className="text-gray-400 text-center mb-6">
                  {`سجل اهتمامك للحصول على وصول مبكر إلى ${serviceName}`}
                </p>

                {isSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheck className="text-green-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">تم إرسال طلبك بنجاح!</h3>
                    <p className="text-gray-400">
                      سنتواصل معك قريبًا بخصوص طلب الوصول المبكر.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                        الاسم الكامل <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                        البريد الإلكتروني <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="example@company.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                        رقم الهاتف <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+966 5XXXXXXXX"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-1">
                        اسم الشركة
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="اسم شركتك (اختياري)"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
                        ملاحظات إضافية
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="أي معلومات إضافية ترغب في مشاركتها معنا"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      variant="gradient"
                      fullWidth
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EarlyAccessModal; 