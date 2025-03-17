"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4" dir="rtl">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-gray-900/10 to-gray-950"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center z-10 max-w-md"
      >
        <div className="mb-8">
          <h1 className="text-9xl font-bold gradient-text">404</h1>
          <p className="text-2xl font-bold mt-4 mb-2">الصفحة غير موجودة</p>
          <p className="text-gray-400">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/">
            <Button variant="gradient" icon={<FiHome />}>
              العودة للرئيسية
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            icon={<FiArrowLeft />}
          >
            الرجوع للخلف
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 