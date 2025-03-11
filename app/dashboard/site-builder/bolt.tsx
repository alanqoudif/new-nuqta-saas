"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function BoltIntegration() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // يمكن إضافة منطق هنا للتحقق من المستخدم أو تهيئة الإطار
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center">
          <Link href="/dashboard/site-builder">
            <Button variant="ghost" icon={<FiArrowLeft />} className="ml-2">
              العودة إلى المشاريع
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-white">منشئ المواقع المتقدم</h1>
        </div>
        <div>
          <span className="text-sm text-gray-400">
            {user?.email}
          </span>
        </div>
      </div>

      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">جاري تحميل منشئ المواقع المتقدم...</p>
            </div>
          </div>
        ) : (
          <iframe
            src="https://bolt.diy"
            className="w-full h-full border-0"
            title="منشئ المواقع المتقدم"
          />
        )}
      </div>
    </div>
  );
} 