'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit, FiArrowRight, FiCalendar, FiUser, FiTag, FiEye } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  cover_image?: string;
  category?: string;
  author_name?: string;
}

export default function ViewBlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    checkAdminPermissions();
    fetchPost();
  }, []);

  const checkAdminPermissions = async () => {
    try {
      if (!user) {
        toast.error('يجب تسجيل الدخول للوصول إلى هذه الصفحة');
        router.push('/auth/login');
        return;
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error || !profile || profile.role !== 'admin') {
        toast.error('ليس لديك صلاحية للوصول إلى هذه الصفحة');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin permissions:', error);
      toast.error('حدث خطأ أثناء التحقق من الصلاحيات');
    }
  };

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      
      // جلب المقالة مع اسم المؤلف
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', params.id)
        .single();
        
      if (postError) {
        console.error('Error fetching blog post:', postError);
        toast.error('حدث خطأ أثناء جلب بيانات المقالة');
        router.push('/admin/blog');
        return;
      }
      
      if (!postData) {
        toast.error('لم يتم العثور على المقالة');
        router.push('/admin/blog');
        return;
      }
      
      // جلب معلومات المؤلف
      const { data: authorData, error: authorError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', postData.author_id)
        .single();
        
      if (!authorError && authorData) {
        postData.author_name = authorData.full_name;
      }
      
      setPost(postData);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      toast.error('حدث خطأ أثناء جلب بيانات المقالة');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPublishStatusBadge = () => {
    if (!post) return null;
    
    return post.published ? (
      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">منشورة</span>
    ) : (
      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">مسودة</span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">لم يتم العثور على المقالة</p>
        <Button
          variant="outline"
          size="sm"
          icon={<FiArrowRight />}
          onClick={() => router.push('/admin/blog')}
          className="mt-4"
        >
          العودة إلى المدونة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          icon={<FiArrowRight />}
          onClick={() => router.push('/admin/blog')}
        >
          العودة إلى المدونة
        </Button>
        <div className="flex items-center gap-2">
          {getPublishStatusBadge()}
          <Button
            variant="primary"
            size="sm"
            icon={<FiEdit />}
            onClick={() => router.push(`/admin/blog/edit/${post.id}`)}
          >
            تعديل المقالة
          </Button>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {post.cover_image && (
          <div className="mb-6">
            <img 
              src={post.cover_image} 
              alt={post.title} 
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}
        
        <Card className="mb-6">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-400">
            <div className="flex items-center">
              <FiCalendar className="ml-1" />
              <span>تاريخ النشر: {formatDate(post.created_at)}</span>
            </div>
            
            {post.author_name && (
              <div className="flex items-center">
                <FiUser className="ml-1" />
                <span>الكاتب: {post.author_name}</span>
              </div>
            )}
            
            {post.category && (
              <div className="flex items-center">
                <FiTag className="ml-1" />
                <span>التصنيف: {post.category}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <FiEye className="ml-1" />
              <span>الرابط: <Link href={`/blog/${post.slug}`} className="text-primary-500 hover:underline" target="_blank">/blog/{post.slug}</Link></span>
            </div>
          </div>
          
          {post.excerpt && (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border-r-4 border-primary-500">
              <p className="text-gray-300">{post.excerpt}</p>
            </div>
          )}
        </Card>
        
        <Card>
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Card>
      </motion.div>
    </div>
  );
} 