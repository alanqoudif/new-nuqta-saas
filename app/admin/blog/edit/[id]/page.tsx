'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiImage, FiX, FiArrowRight } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

// استيراد محرر النصوص بشكل ديناميكي لتجنب أخطاء التحميل على جانب الخادم
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

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
}

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BlogPost | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');

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
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', params.id)
        .single();
        
      if (error) {
        console.error('Error fetching blog post:', error);
        toast.error('حدث خطأ أثناء جلب بيانات المقالة');
        router.push('/admin/blog');
        return;
      }
      
      if (!data) {
        toast.error('لم يتم العثور على المقالة');
        router.push('/admin/blog');
        return;
      }
      
      setFormData(data);
      
      if (data.cover_image) {
        setCoverImagePreview(data.cover_image);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      toast.error('حدث خطأ أثناء جلب بيانات المقالة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;
    
    // إنشاء slug تلقائي من العنوان
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\u0621-\u064A\s]/g, '') // الاحتفاظ بالأحرف العربية والإنجليزية والأرقام
        .replace(/\s+/g, '-'); // استبدال المسافات بشرطات
      
      setFormData({
        ...formData,
        title: value,
        slug
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleContentChange = (content: string) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      content
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }
    
    // التحقق من حجم الملف (أقل من 2 ميجابايت)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
      return;
    }
    
    setCoverImageFile(file);
    
    // إنشاء معاينة للصورة
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeCoverImage = () => {
    if (!formData) return;
    
    setCoverImageFile(null);
    setCoverImagePreview('');
    setFormData({
      ...formData,
      cover_image: ''
    });
  };

  const uploadCoverImage = async (): Promise<string | null> => {
    if (!coverImageFile) return formData?.cover_image || null;
    
    try {
      // إنشاء اسم فريد للملف
      const fileExt = coverImageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `blog-covers/${fileName}`;
      
      // رفع الملف إلى التخزين
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, coverImageFile);
        
      if (uploadError) {
        console.error('Error uploading cover image:', uploadError);
        throw uploadError;
      }
      
      // الحصول على رابط عام للصورة
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error in cover image upload process:', error);
      return formData?.cover_image || null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData) return;
    
    if (!formData.title || !formData.content) {
      toast.error('يرجى ملء الحقول المطلوبة (العنوان والمحتوى)');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // رفع صورة الغلاف إذا كانت موجودة
      let coverImageUrl = formData.cover_image;
      if (coverImageFile) {
        const newImageUrl = await uploadCoverImage();
        if (newImageUrl) {
          coverImageUrl = newImageUrl;
        }
      }
      
      // تحديث المقالة في قاعدة البيانات
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          published: formData.published,
          category: formData.category,
          cover_image: coverImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);
        
      if (error) {
        console.error('Error updating blog post:', error);
        toast.error('حدث خطأ أثناء تحديث المقالة');
        return;
      }
      
      toast.success('تم تحديث المقالة بنجاح');
      router.push('/admin/blog');
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error('حدث خطأ أثناء تحديث المقالة');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!formData) {
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
        <h1 className="text-2xl font-bold">تعديل المقالة</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    العنوان <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="عنوان المقالة"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-1">
                    الرابط المختصر
                  </label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="رابط-المقالة"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    سيتم إنشاؤه تلقائيًا من العنوان إذا تركته فارغًا
                  </p>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                    التصنيف
                  </label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    placeholder="تصنيف المقالة"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-300 mb-1">
                    ملخص المقالة
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="ملخص قصير للمقالة"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    صورة الغلاف
                  </label>
                  {coverImagePreview ? (
                    <div className="relative">
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                      <FiImage className="mx-auto text-3xl text-gray-500 mb-2" />
                      <p className="text-sm text-gray-400 mb-2">اسحب وأفلت الصورة هنا أو انقر للاختيار</p>
                      <input
                        type="file"
                        id="cover_image"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('cover_image')?.click()}
                      >
                        اختر صورة
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={formData.published}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-700 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="published" className="mr-2 text-sm font-medium text-gray-300">
                    نشر المقالة
                  </label>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              محتوى المقالة <span className="text-red-500">*</span>
            </label>
            <div className="min-h-[400px] bg-white rounded-lg">
              {typeof window !== 'undefined' && (
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="اكتب محتوى المقالة هنا..."
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'align': [] }],
                      [{ 'color': [] }, { 'background': [] }],
                      ['link', 'image', 'video'],
                      ['clean']
                    ],
                  }}
                  className="h-[350px]"
                />
              )}
            </div>
          </Card>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="gradient"
              icon={<FiSave />}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </motion.div>
      </form>
    </div>
  );
} 