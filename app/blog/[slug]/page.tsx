"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiTag, FiArrowRight, FiShare2 } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { toast } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import Container from '../../../components/ui/Container';

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
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // تأكد من أن slug موجود قبل جلب البيانات
    if (!slug) {
      setError('لم يتم العثور على المقال');
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        console.log(`Fetching blog post with slug: ${slug}`);
        
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            *,
            profiles:author_id (
              full_name,
              avatar_url
            )
          `)
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Error fetching post:', error);
          setError('حدث خطأ أثناء جلب المقال');
          setLoading(false);
          return;
        }
        
        if (!data) {
          console.log('Blog post not found');
          setError('لم يتم العثور على المقال');
          setLoading(false);
          return;
        }
        
        console.log('Blog post fetched successfully:', data);
        setPost(data);
        setLoading(false);
        
        // جلب المقالات ذات الصلة (نفس التصنيف)
        if (data.category) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('published', true)
            .eq('category', data.category)
            .neq('id', data.id)
            .limit(3);
          
          if (!relatedError && relatedData) {
            setRelatedPosts(relatedData);
          }
        }
      } catch (err) {
        console.error('Error in fetchPost:', err);
        setError('حدث خطأ أثناء جلب المقال');
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]); // تأكد من أن الدالة تعتمد فقط على slug

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      })
      .catch((error) => console.error('Error sharing:', error));
    } else {
      // نسخ الرابط إلى الحافظة
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ الرابط إلى الحافظة');
    }
  };

  if (loading) {
    return (
      <Container className="py-20">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin"></div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-20">
        <div className="text-center min-h-[50vh] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">{error}</h1>
          <Button onClick={() => router.push('/blog')}>العودة إلى المدونة</Button>
        </div>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="py-20">
        <div className="text-center min-h-[50vh] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">لم يتم العثور على المقال</h1>
          <Button onClick={() => router.push('/blog')}>العودة إلى المدونة</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {post.cover_image && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img 
              src={post.cover_image} 
              alt={post.title} 
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}
        
        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-8">
          <div className="flex items-center">
            <FiCalendar className="ml-2" />
            <span>{formatDate(post.created_at)}</span>
          </div>
          
          {post.profiles?.full_name && (
            <div className="flex items-center">
              <FiUser className="ml-2" />
              <span>{post.profiles.full_name}</span>
            </div>
          )}
          
          {post.category && (
            <div className="flex items-center">
              <FiTag className="ml-2" />
              <span>{post.category}</span>
            </div>
          )}
        </div>
        
        {post.excerpt && (
          <div className="bg-gray-800/50 p-4 rounded-lg mb-8 text-lg text-gray-300">
            {post.excerpt}
          </div>
        )}
        
        <div 
          className="prose prose-lg prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        <div className="mt-12 pt-8 border-t border-gray-800">
          <Button onClick={() => router.push('/blog')}>
            العودة إلى المدونة
          </Button>
        </div>
      </motion.div>
      
      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">مقالات ذات صلة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Card key={relatedPost.id} className="h-full flex flex-col">
                {relatedPost.cover_image && (
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <div className="relative h-40 mb-4 overflow-hidden rounded-t-lg">
                      <img 
                        src={relatedPost.cover_image} 
                        alt={relatedPost.title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </Link>
                )}
                
                <div className="flex-1 p-4">
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <h3 className="text-lg font-bold mb-2 hover:text-primary-500 transition-colors">
                      {relatedPost.title}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                  
                  <Link href={`/blog/${relatedPost.slug}`} className="mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      قراءة المزيد
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
} 