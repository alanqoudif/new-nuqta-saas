'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiUser, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { signUp, isLoading, error, user } = useAuth();
  const router = useRouter();

  // إذا كان المستخدم مسجل دخوله بالفعل، قم بإعادة توجيهه إلى لوحة التحكم
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password || !confirmPassword) {
      setFormError('يرجى إكمال جميع الحقول المطلوبة');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 8) {
      setFormError('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل');
      return;
    }

    try {
      await signUp(email, password, fullName);
      // سيتم التعامل مع إعادة التوجيه في AuthContext
      // إذا تم تعطيل التحقق من البريد الإلكتروني، سيتم توجيه المستخدم إلى صفحة تسجيل الدخول
      router.push('/auth/login?success=signup');
    } catch (error) {
      console.error('خطأ في التسجيل:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary-900/20 via-gray-900/10 to-gray-950"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold gradient-text">نقطة للذكاء الاصطناعي</h1>
          </Link>
          <p className="text-gray-400 mt-2">إنشاء حساب جديد</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="الاسم الكامل (اختياري)"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="اسمك"
              icon={<FiUser />}
            />

            <Input
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="بريدك@example.com"
              icon={<FiMail />}
              required
            />

            <Input
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<FiLock />}
              required
            />

            <Input
              label="تأكيد كلمة المرور"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              icon={<FiLock />}
              required
            />

            {(formError || error) && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm">
                {formError || error}
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              لديك حساب بالفعل؟{' '}
              <Link
                href="/auth/login"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="ml-2" /> العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 