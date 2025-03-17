'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiUser, FiKey, FiGlobe, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function SettingsPage() {
  const { user, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    language: 'ar',
    theme: 'dark',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      console.log('Updating profile for user:', user?.id, 'with name:', formData.name);
      
      if (!user) {
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }
      
      // تبسيط عملية التحديث
      console.log('Starting profile update process...');
      
      // 1. تحديث بيانات المستخدم في auth.users
      console.log('Updating user metadata...');
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: formData.name,
          name: formData.name
        }
      });

      if (authError) {
        console.error('Error updating auth user:', authError);
        throw authError;
      }
      
      console.log('Auth user updated successfully:', authData);

      // 2. تحديث بيانات المستخدم في جدول profiles
      console.log('Updating profile in database...');
      
      // محاولة استخدام RPC لتحديث الملف الشخصي
      try {
        const { error: rpcError } = await supabase.rpc('update_user_profile', {
          p_user_id: user.id,
          p_full_name: formData.name
        });
        
        if (rpcError) {
          console.error('Error updating profile via RPC:', rpcError);
          // إذا فشلت الطريقة الأولى، نستخدم الطريقة التقليدية
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              full_name: formData.name,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Error updating profile via traditional method:', updateError);
            throw updateError;
          }
        }
      } catch (profileError) {
        console.error('Error in profile update:', profileError);
        
        // محاولة إنشاء الملف الشخصي إذا لم يكن موجوداً
        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: formData.name,
              email: user.email,
              role: user.role || 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw insertError;
          }
        } catch (insertError) {
          console.error('Error in profile creation:', insertError);
          throw insertError;
        }
      }
      
      console.log('Profile updated successfully');
      
      // تحديث حالة المستخدم في السياق
      await refreshSession();
      
      setSuccess('تم تحديث الملف الشخصي بنجاح');
      
      // إعادة تحميل الصفحة بعد ثانيتين
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // التحقق من إدخال كلمة المرور الحالية
    if (!formData.currentPassword) {
      setError('يرجى إدخال كلمة المرور الحالية');
      return;
    }

    // التحقق من تطابق كلمة المرور الجديدة
    if (formData.newPassword !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    // التحقق من طول كلمة المرور الجديدة
    if (formData.newPassword.length < 6) {
      setError('يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Changing password for user:', user?.email);
      
      if (!user || !user.email) {
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }
      
      // التحقق من كلمة المرور الحالية عن طريق محاولة تسجيل الدخول
      try {
        console.log('Verifying current password...');
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: formData.currentPassword
        });

        if (signInError) {
          console.error('Error verifying current password:', signInError);
          throw new Error('كلمة المرور الحالية غير صحيحة');
        }
        
        console.log('Current password verified successfully');
      } catch (signInError) {
        console.error('Error during password verification:', signInError);
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }

      // تغيير كلمة المرور
      console.log('Updating password...');
      try {
        const { data, error } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (error) {
          console.error('Error updating password:', error);
          throw error;
        }
        
        console.log('Password updated successfully:', data);
      } catch (updateError) {
        console.error('Error during password update:', updateError);
        throw new Error('حدث خطأ أثناء تحديث كلمة المرور. يرجى المحاولة مرة أخرى لاحقاً.');
      }
      
      // محاولة إعادة تسجيل الدخول بكلمة المرور الجديدة
      try {
        console.log('Attempting to sign in with new password...');
        const { error: reSignInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: formData.newPassword
        });
        
        if (reSignInError) {
          console.error('Error signing in with new password:', reSignInError);
          // لا نرمي خطأ هنا لأن كلمة المرور قد تم تغييرها بالفعل
        } else {
          console.log('Successfully signed in with new password');
        }
      } catch (reSignInError) {
        console.error('Error during re-sign in:', reSignInError);
        // لا نرمي خطأ هنا لأن كلمة المرور قد تم تغييرها بالفعل
      }
      
      setSuccess('تم تغيير كلمة المرور بنجاح');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      console.error('Error changing password:', error);
      setError(error.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          language: formData.language,
          theme: formData.theme
        }
      });

      if (error) throw error;
      setSuccess('تم تحديث التفضيلات بنجاح');
    } catch (error: any) {
      setError(error.message || 'حدث خطأ أثناء تحديث التفضيلات');
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
          <FiSettings className="ml-3 text-secondary-500" /> الإعدادات
        </h1>
        <p className="text-gray-400">
          إدارة حسابك وتفضيلاتك
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <FiUser className="ml-3" />
                <span>الملف الشخصي</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'security'
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <FiKey className="ml-3" />
                <span>الأمان</span>
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'preferences'
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <FiGlobe className="ml-3" />
                <span>التفضيلات</span>
              </button>
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <Card className="p-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm mb-6">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-500 text-sm mb-6">
                {success}
              </div>
            )}

            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate}>
                <h2 className="text-xl font-bold mb-6">الملف الشخصي</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      الاسم
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white opacity-70"
                    />
                    <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                  </div>
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="gradient"
                      disabled={isLoading}
                    >
                      {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handlePasswordChange}>
                <h2 className="text-xl font-bold mb-6">تغيير كلمة المرور</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      كلمة المرور الحالية
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      تأكيد كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                    />
                  </div>
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="gradient"
                      disabled={isLoading}
                    >
                      {isLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'preferences' && (
              <form onSubmit={handlePreferencesUpdate}>
                <h2 className="text-xl font-bold mb-6">التفضيلات</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-1">
                      اللغة
                    </label>
                    <select
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">الإنجليزية</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-300 mb-1">
                      المظهر
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={formData.theme === 'light'}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.theme === 'light' ? 'bg-primary-600' : 'bg-gray-700'
                        }`}>
                          <FiSun className={formData.theme === 'light' ? 'text-white' : 'text-gray-400'} />
                        </div>
                        <span className="text-sm">فاتح</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={formData.theme === 'dark'}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.theme === 'dark' ? 'bg-primary-600' : 'bg-gray-700'
                        }`}>
                          <FiMoon className={formData.theme === 'dark' ? 'text-white' : 'text-gray-400'} />
                        </div>
                        <span className="text-sm">داكن</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="gradient"
                      disabled={isLoading}
                    >
                      {isLoading ? 'جاري التغيير...' : 'تغيير التفضيلات'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}