'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit, FiSearch, FiPlus, FiEye, FiTrash, FiCalendar } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_id: string;
  author_name?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  cover_image?: string;
  category?: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    checkAdminPermissions();
  }, []);

  const checkAdminPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('يجب تسجيل الدخول للوصول إلى هذه الصفحة');
        window.location.href = '/auth/login';
        return;
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error || !profile || profile.role !== 'admin') {
        toast.error('ليس لديك صلاحية للوصول إلى هذه الصفحة');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error checking admin permissions:', error);
      toast.error('حدث خطأ أثناء التحقق من الصلاحيات');
    }
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      // التحقق من وجود جدول blog_posts
      try {
        // محاولة جلب المقالات
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching blog posts:', error);
          
          // إذا كان الخطأ بسبب عدم وجود الجدول
          if (error.code === '42P01') { // relation does not exist
            setError('جدول المقالات غير موجود في قاعدة البيانات. يرجى إنشاء الجدول أولاً.');
            setPosts([]);
            return;
          }
          
          throw error;
        }
        
        // جلب معلومات المؤلفين
        const authorIds = [...new Set(data.map(post => post.author_id))];
        
        if (authorIds.length > 0) {
          const { data: authorsData, error: authorsError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', authorIds);
            
          if (!authorsError && authorsData) {
            const authorsMap = new Map(authorsData.map(author => [author.id, author.full_name]));
            
            const postsWithAuthors = data.map(post => ({
              ...post,
              author_name: authorsMap.get(post.author_id) || 'غير معروف'
            }));
            
            setPosts(postsWithAuthors);
          } else {
            setPosts(data);
          }
        } else {
          setPosts(data || []);
        }
      } catch (error: any) {
        console.error('Error in fetchPosts:', error);
        setError('حدث خطأ أثناء جلب المقالات. يرجى التحقق من وجود جدول blog_posts في قاعدة البيانات.');
        setPosts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = (post: BlogPost) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postToDelete.id);
        
      if (error) {
        console.error('Error deleting blog post:', error);
        toast.error('حدث خطأ أثناء حذف المقالة');
        return;
      }
      
      toast.success('تم حذف المقالة بنجاح');
      setPosts(posts.filter(post => post.id !== postToDelete.id));
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('حدث خطأ أثناء حذف المقالة');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDeletePost = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getPublishStatusBadge = (published: boolean) => {
    return published 
      ? <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">منشور</span>
      : <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">مسودة</span>;
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      (post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.author_name && post.author_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (publishFilter === 'all') return matchesSearch;
    if (publishFilter === 'published') return matchesSearch && post.published;
    return matchesSearch && !post.published;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المدونة</h1>
        <Link href="/admin/blog/new">
          <Button variant="gradient" icon={<FiPlus />}>
            إضافة مقالة جديدة
          </Button>
        </Link>
      </div>
      
      {error && (
        <Card className="bg-red-500/10 border border-red-500/50 p-4">
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-gray-400 mt-2">
            يرجى التأكد من إنشاء جدول blog_posts في قاعدة البيانات Supabase باستخدام الأمر SQL المناسب.
            يمكنك استخدام ملف supabase_setup.sql الذي تم إنشاؤه لهذا الغرض.
          </p>
        </Card>
      )}
      
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="w-full md:w-1/2">
            <Input
              placeholder="ابحث في المقالات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={publishFilter === 'all' ? "primary" : "outline"}
              size="sm"
              onClick={() => setPublishFilter('all')}
            >
              الكل
            </Button>
            <Button
              variant={publishFilter === 'published' ? "primary" : "outline"}
              size="sm"
              onClick={() => setPublishFilter('published')}
            >
              منشورة
            </Button>
            <Button
              variant={publishFilter === 'draft' ? "primary" : "outline"}
              size="sm"
              onClick={() => setPublishFilter('draft')}
            >
              مسودة
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">لا توجد مقالات متاحة</p>
            <Link href="/admin/blog/new">
              <Button variant="outline" size="sm" className="mt-4">
                إضافة مقالة جديدة
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-3 px-4 text-right">العنوان</th>
                  <th className="py-3 px-4 text-right">الكاتب</th>
                  <th className="py-3 px-4 text-right">التاريخ</th>
                  <th className="py-3 px-4 text-right">الحالة</th>
                  <th className="py-3 px-4 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {post.cover_image && (
                          <div className="w-10 h-10 rounded bg-gray-800 overflow-hidden ml-3">
                            <img 
                              src={post.cover_image} 
                              alt={post.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-sm text-gray-400 truncate max-w-xs">{post.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{post.author_name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FiCalendar className="text-gray-500 ml-2" />
                        {formatDate(post.created_at)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getPublishStatusBadge(post.published)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2 space-x-reverse">
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<FiEye />}
                            className="hover:bg-gray-800"
                          >
                            عرض
                          </Button>
                        </Link>
                        <Link href={`/admin/blog/edit/${post.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<FiEdit />}
                            className="hover:bg-gray-800"
                          >
                            تعديل
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<FiTrash />}
                          className="hover:bg-gray-800 text-red-500"
                          onClick={() => handleDeletePost(post)}
                        >
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal for deleting post */}
      {showDeleteModal && postToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4">تأكيد الحذف</h2>
            <p className="mb-6">
              هل أنت متأكد من رغبتك في حذف المقالة "{postToDelete.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end space-x-4 space-x-reverse">
              <Button
                variant="outline"
                onClick={cancelDeletePost}
              >
                إلغاء
              </Button>
              <Button
                variant="gradient"
                className="bg-red-600 hover:bg-red-700"
                onClick={confirmDeletePost}
              >
                تأكيد الحذف
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 