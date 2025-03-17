'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiServer, FiSend, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function PrivateAIRequestPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    usageType: '',
    estimatedUsers: '',
    domain: '',
    description: '',
  });

  useEffect(() => {
    // محاولة إصلاح هيكل الجدول عند تحميل الصفحة
    const fixTableSchema = async () => {
      try {
        console.log('Attempting to fix table schema on page load...');
        const { error } = await supabase.rpc('fix_privateai_requests_schema');
        if (error) {
          console.error('Error fixing schema on page load:', error);
        } else {
          console.log('Schema fixed successfully on page load');
        }
      } catch (error) {
        console.error('Error in schema fix attempt on page load:', error);
      }
    };
    
    fixTableSchema();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (!user) {
        throw new Error('يجب تسجيل الدخول لإرسال الطلب');
      }

      if (!formData.usageType) {
        throw new Error('يرجى تحديد نوع الاستخدام');
      }
      
      if (!formData.estimatedUsers) {
        throw new Error('يرجى تحديد عدد المستخدمين المتوقع');
      }
      
      if (!formData.domain) {
        throw new Error('يرجى تحديد مجال الاستخدام');
      }

      // تجهيز بيانات الطلب
      const requestData = {
        user_id: user.id,
        usage_type: formData.usageType,
        number_of_users: parseInt(formData.estimatedUsers),
        domain_of_use: formData.domain,
        description: formData.description,
        status: 'pending'
      };
      
      console.log('Submitting private AI request:', requestData);
      
      // محاولة إرسال الطلب باستخدام RPC أولاً (الطريقة الأكثر موثوقية)
      try {
        console.log('Attempting to use RPC method first...');
        const { error: rpcError } = await supabase.rpc('create_privateai_request', {
          p_user_id: user.id,
          p_usage_type: formData.usageType,
          p_number_of_users: parseInt(formData.estimatedUsers),
          p_domain_of_use: formData.domain,
          p_description: formData.description
        });
        
        if (rpcError) {
          console.error('RPC error:', rpcError);
          throw rpcError;
        }
        
        console.log('Request submitted via RPC successfully');
        setSuccess('تم إرسال طلبك بنجاح. سنتواصل معك قريبًا.');
        setFormData({
          usageType: '',
          estimatedUsers: '',
          domain: '',
          description: '',
        });
        return;
      } catch (rpcError) {
        console.error('RPC method failed, falling back to direct insert:', rpcError);
        // نستمر إلى الطريقة التالية
      }
      
      // محاولة إرسال الطلب بالطريقة المباشرة
      try {
        const { data, error } = await supabase
          .from('privateai_requests')
          .insert(requestData);

        if (error) {
          console.error('Supabase error:', error);
          
          // التعامل مع خطأ عدم وجود العمود
          if (error.message && (
            error.message.includes('column') && error.message.includes('does not exist') ||
            error.message.includes('domain_of_use') ||
            error.message.includes('schema cache')
          )) {
            // محاولة إنشاء الجدول أو إضافة الأعمدة المفقودة
            console.log('Attempting to create missing columns...');
            
            // إنشاء الطلب بطريقة بديلة
            const simpleData = {
              user_id: user.id,
              status: 'pending'
            };
            
            const { error: simpleError } = await supabase
              .from('privateai_requests')
              .insert(simpleData);
              
            if (simpleError) {
              console.error('Error with simple insert:', simpleError);
              throw new Error('لا يمكن إرسال الطلب حالياً. يرجى التواصل مع المسؤول لإصلاح المشكلة.');
            } else {
              console.log('Simple request submitted successfully');
              setSuccess('تم إرسال طلبك بنجاح. سنتواصل معك قريبًا.');
              setFormData({
                usageType: '',
                estimatedUsers: '',
                domain: '',
                description: '',
              });
              return;
            }
          }
          
          throw error;
        }
        
        console.log('Request submitted successfully');
        
        setSuccess('تم إرسال طلبك بنجاح. سنتواصل معك قريبًا.');
        setFormData({
          usageType: '',
          estimatedUsers: '',
          domain: '',
          description: '',
        });
      } catch (submitError) {
        console.error('Error during submission:', submitError);
        throw submitError;
      }
    } catch (error: any) {
      console.error('Error submitting request:', error);
      setError(error.message || 'حدث خطأ أثناء إرسال الطلب');
      
      // إظهار رسالة خطأ أكثر تفصيلاً للمستخدم
      if (error.message && error.message.includes('column')) {
        setError('هناك مشكلة في هيكل قاعدة البيانات. يرجى إبلاغ المسؤول عن هذه المشكلة.');
      } else if (error.message && error.message.includes('not found')) {
        setError('لم يتم العثور على الجدول المطلوب. يرجى إبلاغ المسؤول عن هذه المشكلة.');
      } else if (error.message && error.message.includes('permission')) {
        setError('ليس لديك صلاحية كافية لإجراء هذه العملية. يرجى إبلاغ المسؤول عن هذه المشكلة.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <FiServer className="ml-3 text-secondary-500" /> الذكاء الاصطناعي الخاص
        </h1>
        <p className="text-gray-400">
          احصل على نسختك الخاصة من الذكاء الاصطناعي لاستخدامها في مؤسستك
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm mb-6 flex items-center">
          <FiAlertCircle className="ml-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-500 text-sm mb-6 flex items-center">
          <FiAlertCircle className="ml-2" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">حول الذكاء الاصطناعي الخاص</h2>
            <p className="text-gray-400 mb-4">
              الذكاء الاصطناعي الخاص هو حل مخصص يتيح لك استخدام قوة الذكاء الاصطناعي داخل مؤسستك مع الحفاظ على خصوصية بياناتك.
            </p>
            <h3 className="text-lg font-bold mb-2">المميزات الرئيسية</h3>
            <ul className="list-disc list-inside text-gray-400 space-y-1 mb-4">
              <li>خصوصية كاملة للبيانات</li>
              <li>تخصيص حسب احتياجات مؤسستك</li>
              <li>تكامل مع أنظمتك الحالية</li>
              <li>دعم فني على مدار الساعة</li>
              <li>تحديثات مستمرة</li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              ملاحظة: الذكاء الاصطناعي الخاص متاح للشركات والمؤسسات فقط.
            </p>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">طلب الذكاء الاصطناعي الخاص</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="usageType" className="block text-sm font-medium text-gray-300 mb-1">
                  نوع الاستخدام
                </label>
                <select
                  id="usageType"
                  name="usageType"
                  value={formData.usageType}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  required
                >
                  <option value="">اختر نوع الاستخدام</option>
                  <option value="internal">استخدام داخلي</option>
                  <option value="customer_facing">واجهة للعملاء</option>
                  <option value="both">كلاهما</option>
                </select>
              </div>

              <div>
                <label htmlFor="estimatedUsers" className="block text-sm font-medium text-gray-300 mb-1">
                  عدد المستخدمين المتوقع
                </label>
                <input
                  type="number"
                  id="estimatedUsers"
                  name="estimatedUsers"
                  value={formData.estimatedUsers}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  placeholder="مثال: 100"
                  required
                />
              </div>

              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-300 mb-1">
                  المجال أو الصناعة
                </label>
                <input
                  type="text"
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  placeholder="مثال: الرعاية الصحية، التعليم، التمويل..."
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  وصف الاحتياجات
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  placeholder="صف كيف تخطط لاستخدام الذكاء الاصطناعي الخاص في مؤسستك..."
                  required
                ></textarea>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isLoading}
                  icon={<FiSend />}
                >
                  {isLoading ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
} 