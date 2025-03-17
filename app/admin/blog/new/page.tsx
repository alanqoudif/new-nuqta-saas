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

export default function NewBlogPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    published: false,
    category: '',
    cover_image: ''
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');

  useEffect(() => {
    checkAdminPermissions();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // إنشاء slug تلقائي من العنوان
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\u0621-\u064A\s]/g, '') // الاحتفاظ بالأحرف العربية والإنجليزية والأرقام
        .replace(/\s+/g, '-'); // استبدال المسافات بشرطات
      
      setFormData(prev => ({
        ...prev,
        title: value,
        slug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
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
    setCoverImageFile(null);
    setCoverImagePreview('');
    setFormData(prev => ({
      ...prev,
      cover_image: ''
    }));
  };

  const uploadCoverImage = async (): Promise<string | null> => {
    if (!coverImageFile) return null;
    
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
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('يرجى ملء الحقول المطلوبة (العنوان والمحتوى)');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // رفع صورة الغلاف إذا كانت موجودة
      let coverImageUrl = null;
      if (coverImageFile) {
        coverImageUrl = await uploadCoverImage();
        if (!coverImageUrl) {
          toast.error('حدث خطأ أثناء رفع صورة الغلاف');
          setIsSubmitting(false);
          return;
        }
      }
      
      // إنشاء المقالة في قاعدة البيانات
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([
          {
            title: formData.title,
            slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
            excerpt: formData.excerpt,
            content: formData.content,
            published: formData.published,
            category: formData.category,
            cover_image: coverImageUrl,
            author_id: user?.id
          }
        ])
        .select();
        
      if (error) {
        console.error('Error creating blog post:', error);
        toast.error('حدث خطأ أثناء إنشاء المقالة');
        return;
      }
      
      toast.success('تم إنشاء المقالة بنجاح');
      router.push('/admin/blog');
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error('حدث خطأ أثناء إنشاء المقالة');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold">إضافة مقالة جديدة</h1>
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
                    value={formData.category}
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
                    نشر المقالة مباشرة
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
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ المقالة'}
            </Button>
          </div>
        </motion.div>
      </form>
    </div>
  );
} 