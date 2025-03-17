"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiTag, FiArrowLeft } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

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

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      // جلب المقالات المنشورة فقط
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
        
      if (postsError) {
        console.error('Error fetching blog posts:', postsError);
        toast.error('حدث خطأ أثناء جلب المقالات');
        return;
      }
      
      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setIsLoading(false);
        return;
      }
      
      // جلب معلومات المؤلفين
      const authorIds = [...new Set(postsData.map(post => post.author_id))];
      const { data: authorsData, error: authorsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', authorIds);
        
      if (!authorsError && authorsData) {
        const authorsMap = new Map(authorsData.map(author => [author.id, author.full_name]));
        
        const postsWithAuthors = postsData.map(post => ({
          ...post,
          author_name: authorsMap.get(post.author_id) || 'غير معروف'
        }));
        
        setPosts(postsWithAuthors);
        
        // استخراج التصنيفات الفريدة
        const uniqueCategories = [...new Set(postsWithAuthors
          .filter(post => post.category)
          .map(post => post.category as string)
        )];
        
        setCategories(uniqueCategories);
      } else {
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('حدث خطأ أثناء جلب المقالات');
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">مدونة نقطة</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          آخر المقالات والأخبار حول الذكاء الاصطناعي والتقنيات الحديثة
        </p>
      </motion.div>
      
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/2">
            <Input
              placeholder="ابحث في المقالات..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "primary" : "outline"}
              size="sm"
              onClick={() => handleCategorySelect(null)}
            >
              الكل
            </Button>
            
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "primary" : "outline"}
                size="sm"
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">لا توجد مقالات متاحة حاليًا</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col">
                {post.cover_image && (
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative h-48 mb-4 overflow-hidden rounded-t-lg">
                      <img 
                        src={post.cover_image} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </Link>
                )}
                
                <div className="flex-1 p-4">
                  {post.category && (
                    <span className="inline-block bg-primary-500 bg-opacity-20 text-primary-400 text-xs px-2 py-1 rounded mb-2">
                      {post.category}
                    </span>
                  )}
                  
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-bold mb-2 hover:text-primary-500 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <FiCalendar className="ml-1" />
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                      
                      {post.author_name && (
                        <div className="flex items-center">
                          <FiUser className="ml-1" />
                          <span>{post.author_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/blog/${post.slug}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        icon={<FiArrowLeft />}
                      >
                        قراءة المزيد
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 