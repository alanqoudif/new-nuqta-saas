'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiLoader, FiGlobe, FiSave, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function SiteEditorPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('project');
  const [isLoading, setIsLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBoltReady, setIsBoltReady] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!projectId) {
      router.push('/dashboard/site-builder');
      return;
    }

    const fetchProjectDetails = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('ai_site_projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error('المشروع غير موجود');
        }

        // التحقق من أن المشروع ينتمي للمستخدم الحالي
        if (data.user_id !== user?.id) {
          throw new Error('ليس لديك صلاحية للوصول إلى هذا المشروع');
        }

        setProjectName(data.name);
        
        // إذا كان هناك بيانات محفوظة للمشروع، قم بتحميلها
        if (data.data) {
          // سنقوم بتحميل البيانات عندما يكون bolt.diy جاهزًا
          setTimeout(() => {
            if (iframeRef.current && iframeRef.current.contentWindow && isBoltReady) {
              iframeRef.current.contentWindow.postMessage({
                type: 'LOAD_PROJECT',
                projectData: data.data,
                projectId: projectId
              }, window.location.origin);
            }
          }, 2000);
        }
      } catch (error: any) {
        console.error('Error fetching project:', error);
        setError(error.message || 'حدث خطأ أثناء تحميل المشروع');
        setTimeout(() => {
          router.push('/dashboard/site-builder');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProjectDetails();
    }
  }, [projectId, user, router, isBoltReady]);

  // إعداد مستمع الرسائل من bolt.diy
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // التحقق من مصدر الرسالة
      if (event.origin !== window.location.origin) return;

      const { type, projectData, response, error: messageError } = event.data;

      switch (type) {
        case 'BOLT_READY':
          console.log('Bolt.diy جاهز');
          setIsBoltReady(true);
          break;

        case 'GENERATION_STARTED':
          console.log('بدأ إنشاء الموقع');
          setIsGenerating(true);
          break;

        case 'GENERATION_COMPLETE':
          console.log('اكتمل إنشاء الموقع');
          setIsGenerating(false);
          setSuccessMessage('تم إنشاء الموقع بنجاح');
          setTimeout(() => setSuccessMessage(null), 3000);
          if (response) {
            saveProjectData(response);
          }
          break;

        case 'GENERATION_ERROR':
          console.error('خطأ في إنشاء الموقع:', messageError);
          setIsGenerating(false);
          setError(messageError || 'حدث خطأ أثناء إنشاء الموقع');
          setTimeout(() => setError(null), 3000);
          break;

        case 'SAVE_PROJECT_DATA':
          console.log('حفظ بيانات المشروع');
          if (projectData) {
            saveProjectData(projectData);
          }
          break;

        case 'SAVE_PROJECT_SUCCESS':
          setIsSaving(false);
          setSuccessMessage('تم حفظ المشروع بنجاح');
          setTimeout(() => setSuccessMessage(null), 3000);
          break;

        case 'SAVE_PROJECT_ERROR':
          console.error('خطأ في حفظ المشروع:', messageError);
          setIsSaving(false);
          setError(messageError || 'حدث خطأ أثناء حفظ المشروع');
          setTimeout(() => setError(null), 3000);
          break;

        case 'LOAD_PROJECT_SUCCESS':
          console.log('تم تحميل المشروع بنجاح');
          break;

        case 'LOAD_PROJECT_ERROR':
          console.error('خطأ في تحميل المشروع:', messageError);
          setError(messageError || 'حدث خطأ أثناء تحميل المشروع');
          setTimeout(() => setError(null), 3000);
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [projectId]);

  // هذه الدالة ستُستدعى عندما يكون bolt.diy جاهزًا
  const handleBoltReady = () => {
    console.log('تم تحميل iframe');
  };

  // دالة لإرسال الوصف إلى bolt.diy
  const handleGenerateWebsite = () => {
    if (!prompt.trim()) {
      setError('الرجاء إدخال وصف للموقع');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);
    
    // إرسال الوصف إلى bolt.diy عبر postMessage
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'GENERATE_WEBSITE',
        prompt: prompt,
        projectId: projectId
      }, window.location.origin);
    } else {
      console.error('لا يمكن الوصول إلى نافذة bolt.diy');
      setIsGenerating(false);
      setError('لا يمكن الوصول إلى محرر المواقع');
      setTimeout(() => setError(null), 3000);
    }
  };

  // دالة لحفظ المشروع
  const handleSaveProject = () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SAVE_PROJECT',
        projectId: projectId
      }, window.location.origin);
    } else {
      console.error('لا يمكن الوصول إلى نافذة bolt.diy');
      setIsSaving(false);
      setError('لا يمكن الوصول إلى محرر المواقع');
      setTimeout(() => setError(null), 3000);
    }
  };

  // حفظ بيانات المشروع في Supabase
  const saveProjectData = async (projectData: any) => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('ai_site_projects')
        .update({
          data: projectData,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setSuccessMessage('تم حفظ المشروع بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving project data:', error);
      setError(error.message || 'حدث خطأ أثناء حفظ المشروع');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // دالة لنشر الموقع
  const handlePublishWebsite = async () => {
    try {
      const { error } = await supabase
        .from('ai_site_projects')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
          site_url: `https://nuqta.ai/sites/${projectId}`
        })
        .eq('id', projectId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setSuccessMessage('تم نشر الموقع بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error publishing website:', error);
      setError(error.message || 'حدث خطأ أثناء نشر الموقع');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <FiLoader className="animate-spin text-4xl text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">جاري تحميل المحرر...</h2>
          <p className="text-gray-400 mt-2">يتم تجهيز بيئة التصميم الخاصة بك</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-950 p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-bold mb-2">خطأ</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <p className="text-gray-500 text-sm mb-4">جاري التوجيه إلى لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-950" dir="rtl">
      {/* الشريط العلوي */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/dashboard/site-builder')}
            icon={<FiArrowLeft />}
          >
            العودة
          </Button>
          <h1 className="mr-4 text-lg font-bold truncate">{projectName}</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            size="sm"
            icon={<FiSave />}
            onClick={handleSaveProject}
            disabled={isSaving || !isBoltReady}
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
          <Button 
            variant="gradient" 
            size="sm"
            icon={<FiGlobe />}
            onClick={handlePublishWebsite}
          >
            نشر الموقع
          </Button>
        </div>
      </div>

      {/* رسائل النجاح والخطأ */}
      {(error || successMessage) && (
        <div className="absolute top-16 left-0 right-0 z-50 flex justify-center">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm flex items-center">
              <FiAlertCircle className="ml-2" />
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-500 text-sm flex items-center">
              <FiAlertCircle className="ml-2" />
              {successMessage}
            </div>
          )}
        </div>
      )}

      {/* واجهة إنشاء الموقع */}
      <div className="flex flex-col md:flex-row h-full">
        {/* الشريط الجانبي للإدخال */}
        <div className="w-full md:w-1/3 bg-gray-900 p-4 border-l border-gray-800">
          <h2 className="text-xl font-bold mb-4">إنشاء موقع جديد</h2>
          <p className="text-gray-400 mb-4">
            صف الموقع الذي تريد إنشاءه وسيقوم الذكاء الاصطناعي بإنشائه لك.
          </p>
          
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
              وصف الموقع
            </label>
            <textarea
              id="prompt"
              rows={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
              placeholder="مثال: أريد موقعًا لمتجر إلكتروني لبيع الملابس، يحتوي على صفحة رئيسية وصفحة منتجات وصفحة تواصل..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>
          </div>
          
          <Button
            variant="gradient"
            fullWidth
            onClick={handleGenerateWebsite}
            disabled={isGenerating || !prompt.trim() || !isBoltReady}
          >
            {isGenerating ? (
              <>
                <FiLoader className="animate-spin ml-2" /> جاري الإنشاء...
              </>
            ) : !isBoltReady ? (
              <>
                <FiLoader className="animate-spin ml-2" /> جاري تحميل المحرر...
              </>
            ) : (
              'إنشاء الموقع'
            )}
          </Button>
        </div>

        {/* محتوى bolt.diy */}
        <div className="flex-grow relative">
          <iframe
            ref={iframeRef}
            src="/bolt.diy/index.html"
            className="absolute inset-0 w-full h-full border-none"
            onLoad={handleBoltReady}
          />
        </div>
      </div>
    </div>
  );
} 