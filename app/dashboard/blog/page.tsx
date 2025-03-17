"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/utils/date';
import { FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

// تعريف نوع البيانات للمقالة
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  author: string;
  created_at: string;
  published: boolean;
}

export default function BlogAdminPage() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // التحقق من صلاحيات المستخدم
    if (profile) {
      setIsAdmin(profile.role === 'admin');
    }
  }, [profile]);

  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        toast.error('حدث خطأ أثناء تحميل المقالات');
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin) {
      fetchBlogPosts();
    }
  }, [isAdmin]);

  const handleDeletePost = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المقالة؟')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== id));
      toast.success('تم حذف المقالة بنجاح');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('حدث خطأ أثناء حذف المقالة');
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setPosts(posts.map(post => 
        post.id === id ? { ...post, published: !currentStatus } : post
      ));
      
      toast.success(`تم ${!currentStatus ? 'نشر' : 'إلغاء نشر'} المقالة بنجاح`);
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المقالة');
    }
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500">غير مصرح</h2>
          <p className="text-gray-300 mb-6">عذرًا، ليس لديك صلاحية الوصول إلى هذه الصفحة.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">إدارة المدونة</h1>
          <Link href="/dashboard/blog/new">
            <Button variant="primary">
              <FiPlus className="ml-2" /> إضافة مقالة جديدة
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-400">جاري تحميل المقالات...</p>
          </div>
        ) : posts.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-right py-3 px-4">العنوان</th>
                    <th className="text-right py-3 px-4">الكاتب</th>
                    <th className="text-right py-3 px-4">تاريخ النشر</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-3 px-4">
                        <Link href={`/blog/${post.slug}`} className="text-primary-400 hover:underline">
                          {post.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{post.author}</td>
                      <td className="py-3 px-4">{formatDate(post.created_at)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${post.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {post.published ? 'منشور' : 'مسودة'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTogglePublish(post.id, post.published)}
                          >
                            {post.published ? 'إلغاء النشر' : 'نشر'}
                          </Button>
                          <Link href={`/dashboard/blog/edit/${post.id}`}>
                            <Button variant="outline" size="sm">
                              <FiEdit />
                            </Button>
                          </Link>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="text-center py-20 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-xl font-bold mb-4">لا توجد مقالات بعد</h3>
            <p className="text-gray-400 mb-8">
              ابدأ بإضافة مقالة جديدة لمدونتك.
            </p>
            <Link href="/dashboard/blog/new">
              <Button variant="primary">
                <FiPlus className="ml-2" /> إضافة مقالة جديدة
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 