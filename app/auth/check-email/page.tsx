'use client';

import React from 'react';
import Link from 'next/link';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function CheckEmailPage() {
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
        </div>

        <Card className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
              <FiMail className="text-primary-400 text-3xl" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">تحقق من بريدك الإلكتروني</h2>
          
          <p className="text-gray-400 mb-6">
            لقد أرسلنا رابط تأكيد إلى عنوان بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك واتباع التعليمات لإكمال العملية.
          </p>
          
          <div className="space-y-4">
            <Link href="/auth/login">
              <Button variant="gradient" fullWidth>
                العودة إلى تسجيل الدخول
              </Button>
            </Link>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="mr-2" /> العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 