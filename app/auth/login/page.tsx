'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiMail, FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { signIn, isLoading, error, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectedFrom') || '/dashboard';
  const success = searchParams.get('success');

  // إذا كان المستخدم مسجل دخوله بالفعل، قم بإعادة توجيهه إلى لوحة التحكم
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // عرض رسائل النجاح
  useEffect(() => {
    if (success === 'signup') {
      toast.success('تم إنشاء حسابك بنجاح، يرجى تسجيل الدخول');
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('يرجى إكمال جميع الحقول');
      return;
    }

    try {
      await signIn(email, password);
      // سيتم التعامل مع إعادة التوجيه في AuthContext
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-12">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-gray-900/10 to-gray-950"></div>
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
          <p className="text-gray-400 mt-2">تسجيل الدخول إلى حسابك</p>
        </div>

        {success === 'signup' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center"
          >
            <FiCheckCircle className="text-green-500 ml-3 text-xl" />
            <p className="text-green-400">
              تم إنشاء حسابك بنجاح، يرجى تسجيل الدخول
            </p>
          </motion.div>
        )}

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="بريدك@example.com"
              icon={<FiMail />}
              required
            />

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="label">
                  كلمة المرور
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<FiLock />}
                required
              />
            </div>

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
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              ليس لديك حساب؟{' '}
              <Link
                href="/auth/signup"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                إنشاء حساب
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