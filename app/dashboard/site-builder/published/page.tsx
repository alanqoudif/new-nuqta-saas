'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiGlobe, FiExternalLink, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface PublishedSite {
  id: string;
  name: string;
  description: string;
  created_at: string;
  published_at: string;
  site_url: string;
  user_id: string;
}

export default function PublishedSitesPage() {
  const { user } = useAuth();
  const [sites, setSites] = useState<PublishedSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPublishedSites();
    }
  }, [user]);

  const fetchPublishedSites = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('site_builder_projects')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Error fetching published sites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الموقع؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('site_builder_projects')
        .update({ is_published: false })
        .eq('id', siteId);

      if (error) throw error;

      setSites(sites.filter(site => site.id !== siteId));
    } catch (error) {
      console.error('Error unpublishing site:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
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
          <FiGlobe className="ml-3 text-secondary-500" /> المواقع المنشورة
        </h1>
        <p className="text-gray-400">
          استعرض وإدارة مواقع الويب التي قمت بنشرها.
        </p>
      </motion.div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">مواقعك المنشورة</h2>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/dashboard/site-builder'}
            icon={<FiGlobe />}
          >
            العودة إلى منشئ المواقع
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : sites.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">لا توجد مواقع منشورة بعد</div>
            <Button
              variant="primary"
              onClick={() => window.location.href = '/dashboard/site-builder'}
              icon={<FiGlobe />}
            >
              إنشاء موقع جديد
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map(site => (
              <Card key={site.id} className="p-6 flex flex-col">
                <h3 className="text-xl font-bold mb-2">{site.name}</h3>
                <p className="text-gray-400 mb-2 text-sm flex-grow">
                  {site.description || 'بدون وصف'}
                </p>
                <p className="text-gray-500 text-xs mb-4">
                  تم النشر في {formatDate(site.published_at)}
                </p>
                <div className="flex flex-col space-y-2 mt-auto">
                  <a
                    href={site.site_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    زيارة الموقع <FiExternalLink className="mr-2" />
                  </a>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onClick={() => window.location.href = `/dashboard/site-builder/editor?project=${site.id}`}
                      icon={<FiEdit />}
                    >
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSite(site.id)}
                      icon={<FiTrash2 />}
                    >
                      إلغاء النشر
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12">
        <Card gradient className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-grow">
              <h2 className="text-xl font-bold mb-2">مشاركة مواقعك</h2>
              <p className="text-gray-300">
                يمكنك مشاركة مواقعك المنشورة مع أي شخص عبر الرابط المباشر. كما يمكنك ربط نطاق مخصص بموقعك.
              </p>
            </div>
            <a
              href="https://docs.nuqta.ai/site-builder/custom-domains"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              إعداد نطاق مخصص <FiExternalLink className="mr-2" />
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
} 