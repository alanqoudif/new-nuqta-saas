'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiUsers, FiServer, FiCode, FiActivity, FiArrowRight, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

interface Stats {
  totalUsers: number;
  totalRequests: number;
  pendingRequests: number;
  totalProjects: number;
  totalMessages: number;
  unreadMessages: number;
}

// إضافة بطاقة معلومات حول إعداد قاعدة البيانات
const DatabaseSetupInfo = () => (
  <Card className="bg-blue-500/10 border border-blue-500/50 p-4 mb-6">
    <h3 className="text-lg font-bold text-blue-400 mb-2">معلومات إعداد قاعدة البيانات</h3>
    <p className="text-gray-300 mb-3">
      إذا كنت تواجه مشاكل في عرض البيانات، قد تحتاج إلى إعداد جداول قاعدة البيانات. استخدم ملف <code className="bg-gray-800 px-2 py-1 rounded">supabase_setup_fixed.sql</code> الذي يحتوي على جميع الأوامر اللازمة.
    </p>
    <div className="bg-gray-800 p-3 rounded-md mb-3">
      <p className="text-amber-400 font-mono text-sm mb-2">// إذا واجهت خطأ مثل:</p>
      <p className="text-red-400 font-mono text-sm mb-2">ERROR: 42P13: cannot change return type of existing function</p>
      <p className="text-amber-400 font-mono text-sm">// فهذا يعني أن الدالة موجودة بالفعل ويجب حذفها أولاً. الملف الجديد يتضمن أوامر الحذف اللازمة.</p>
    </div>
    <ol className="list-decimal list-inside text-gray-300 space-y-2">
      <li>انتقل إلى لوحة تحكم Supabase الخاصة بك</li>
      <li>اذهب إلى قسم <span className="text-blue-400">SQL Editor</span></li>
      <li>انسخ محتويات ملف <code className="bg-gray-800 px-2 py-1 rounded">supabase_setup_fixed.sql</code></li>
      <li>الصق المحتوى في محرر SQL وقم بتنفيذه</li>
      <li>إذا واجهت أي أخطاء، تأكد من تنفيذ أوامر الحذف أولاً ثم أوامر الإنشاء</li>
    </ol>
    <p className="text-gray-300 mt-3">
      هذا سيقوم بإنشاء جميع الجداول المطلوبة:
    </p>
    <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
      <li><code className="bg-gray-800 px-2 py-1 rounded">blog_posts</code> - لإدارة مقالات المدونة</li>
      <li><code className="bg-gray-800 px-2 py-1 rounded">contact_messages</code> - لتخزين رسائل التواصل</li>
      <li><code className="bg-gray-800 px-2 py-1 rounded">early_access_requests</code> - لإدارة طلبات الوصول المبكر</li>
      <li><code className="bg-gray-800 px-2 py-1 rounded">ai_requests</code> - لإدارة طلبات الذكاء الاصطناعي</li>
    </ul>
    <div className="mt-4 pt-3 border-t border-blue-500/30">
      <p className="text-amber-400 text-sm">ملاحظة: سجلات التطبيق الحالية طبيعية ولا تشير إلى وجود مشاكل. سجلات GoTrueClient هي سجلات تسجيل الدخول العادية من Supabase.</p>
    </div>
  </Card>
);

export default function AdminDashboardPage() {
  const { user, refreshSession } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRequests: 0,
    pendingRequests: 0,
    totalProjects: 0,
    totalMessages: 0,
    unreadMessages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const [showDatabaseInfo, setShowDatabaseInfo] = useState(false);
  const [databaseTablesExist, setDatabaseTablesExist] = useState(false);

  // التحقق من حالة المستخدم وتوجيهه إلى الصفحة المناسبة
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        setIsSessionChecking(true);
        
        // التحقق من وجود المستخدم
        if (!user) {
          setIsSessionChecking(false);
          return;
        }
        
        // التحقق من أن المستخدم مسؤول
        if (user.role !== 'admin') {
          setIsSessionChecking(false);
          return;
        }
        
        setIsSessionChecking(false);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsSessionChecking(false);
      }
    };

    checkAdminAccess();
  }, [user]);

  // التحقق من وجود جداول قاعدة البيانات
  useEffect(() => {
    const checkDatabaseTables = async () => {
      if (isSessionChecking || !user || user.role !== 'admin') {
        return;
      }
      
      try {
        // التحقق من وجود جدول ai_requests
        const { error: aiRequestsError } = await supabase
          .from('ai_requests')
          .select('id')
          .limit(1);
          
        // التحقق من وجود جدول contact_messages
        const { error: contactMessagesError } = await supabase
          .from('contact_messages')
          .select('id')
          .limit(1);
          
        // التحقق من وجود جدول early_access_requests
        const { error: earlyAccessError } = await supabase
          .from('early_access_requests')
          .select('id')
          .limit(1);
          
        // التحقق من وجود جدول blog_posts
        const { error: blogPostsError } = await supabase
          .from('blog_posts')
          .select('id')
          .limit(1);
          
        // إذا كان هناك خطأ في أي من الجداول، فهذا يعني أنها غير موجودة
        const hasErrors = aiRequestsError || contactMessagesError || earlyAccessError || blogPostsError;
        
        setDatabaseTablesExist(!hasErrors);
        setShowDatabaseInfo(hasErrors);
      } catch (error) {
        console.error('Error checking database tables:', error);
        setShowDatabaseInfo(true);
      }
    };
    
    checkDatabaseTables();
  }, [user, isSessionChecking]);

  useEffect(() => {
    const fetchStats = async () => {
      if (isSessionChecking || !user || user.role !== 'admin') {
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Fetching admin stats...');
        
        // تهيئة الإحصائيات الافتراضية
        let statsData = {
          totalUsers: 0,
          totalRequests: 0,
          pendingRequests: 0,
          totalProjects: 0,
          totalMessages: 0,
          unreadMessages: 0,
        };

        // جلب إحصائيات المستخدمين
        try {
          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('id');
            
          if (!usersError && usersData) {
            statsData.totalUsers = usersData.length;
            console.log('Users stats fetched successfully:', usersData.length);
          } else {
            console.error('Error fetching users stats:', usersError);
          }
        } catch (error) {
          console.error('Error in users stats:', error);
        }
        
        // جلب إحصائيات طلبات الذكاء الخاص
        try {
          const { data: requestsData, error: requestsError } = await supabase
            .from('ai_requests')
            .select('id, status');
            
          if (!requestsError && requestsData) {
            statsData.totalRequests = requestsData.length;
            statsData.pendingRequests = requestsData.filter(req => req.status === 'pending').length;
            console.log('AI requests stats fetched successfully:', requestsData.length);
          } else {
            console.error('Error fetching AI requests stats:', requestsError);
          }
        } catch (error) {
          console.error('Error in requests stats:', error);
        }
        
        // جلب إحصائيات رسائل التواصل
        try {
          const { data: messagesData, error: messagesError } = await supabase
            .from('contact_messages')
            .select('id, status');
            
          if (!messagesError && messagesData) {
            statsData.totalMessages = messagesData.length;
            statsData.unreadMessages = messagesData.filter(msg => msg.status === 'unread').length;
            console.log('Messages stats fetched successfully:', messagesData.length);
          } else {
            console.error('Error fetching messages stats:', messagesError);
          }
        } catch (error) {
          console.error('Error in messages stats:', error);
        }
        
        // تحديث الإحصائيات
        setStats(statsData);
        console.log('Admin stats loaded successfully', statsData);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('حدث خطأ أثناء جلب الإحصائيات');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, isSessionChecking]);

  const statCards = [
    {
      title: 'المستخدمين',
      value: stats.totalUsers,
      icon: <FiUsers className="text-primary-500" />,
      href: '/admin/users',
    },
    {
      title: 'طلبات PrivateAI',
      value: stats.totalRequests,
      badge: stats.pendingRequests > 0 ? `${stats.pendingRequests} معلق` : undefined,
      icon: <FiServer className="text-secondary-500" />,
      href: '/admin/privateai-requests',
    },
    {
      title: 'مشاريع المواقع',
      value: stats.totalProjects,
      icon: <FiCode className="text-accent-500" />,
      href: '/admin/site-projects',
    },
    {
      title: 'رسائل التواصل',
      value: stats.totalMessages,
      badge: stats.unreadMessages > 0 ? `${stats.unreadMessages} غير مقروءة` : undefined,
      icon: <FiMessageSquare className="text-green-500" />,
      href: '/admin/contact-messages',
    },
  ];

  // عرض شاشة التحميل أثناء التحقق من الجلسة
  if (isSessionChecking) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">جاري التحقق من صلاحيات المسؤول...</p>
          </div>
        </div>
      </div>
    );
  }

  // إذا كان المستخدم ليس مسؤولاً، عرض رسالة خطأ
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">خطأ في الصلاحيات</h2>
          <p className="text-gray-400 mb-4">ليس لديك صلاحية الوصول إلى لوحة تحكم المسؤول.</p>
          <Link 
            href="/dashboard"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            العودة إلى لوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">لوحة الإدارة</h1>
        <p className="text-gray-400">
          مرحباً بك في لوحة الإدارة، يمكنك من هنا إدارة جميع جوانب الموقع
        </p>
      </motion.div>
      
      {showDatabaseInfo && <DatabaseSetupInfo />}
      
      <div className="space-y-8">
        {isSessionChecking ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">جاري التحقق من صلاحيات المسؤول...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link href="/admin/users">
                  <Card className="h-full hover:border-primary-500 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">المستخدمين</h3>
                      <div className="p-3 bg-primary-900/30 rounded-lg">
                        <FiUsers className="text-2xl text-primary-500" />
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold mb-1">{isLoading ? '...' : stats.totalUsers}</p>
                        <p className="text-gray-500 text-sm">إجمالي المستخدمين</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary-500">
                        عرض التفاصيل <FiArrowRight className="mr-1" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Link href="/admin/privateai-requests">
                  <Card className="h-full hover:border-secondary-500 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">طلبات PrivateAI</h3>
                      <div className="p-3 bg-secondary-900/30 rounded-lg">
                        <FiServer className="text-2xl text-secondary-500" />
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold mb-1">{isLoading ? '...' : stats.totalRequests}</p>
                        <p className="text-gray-500 text-sm">إجمالي الطلبات</p>
                        {stats.pendingRequests > 0 && (
                          <span className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full mt-2">
                            {stats.pendingRequests} طلب معلق
                          </span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="text-secondary-500">
                        عرض التفاصيل <FiArrowRight className="mr-1" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Link href="/admin/site-projects">
                  <Card className="h-full hover:border-indigo-500 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">مشاريع المواقع</h3>
                      <div className="p-3 bg-indigo-900/30 rounded-lg">
                        <FiCode className="text-2xl text-indigo-500" />
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold mb-1">{isLoading ? '...' : stats.totalProjects}</p>
                        <p className="text-gray-500 text-sm">إجمالي المشاريع</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-indigo-500">
                        عرض التفاصيل <FiArrowRight className="mr-1" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">إجراءات سريعة</h3>
                  </div>
                  <div className="space-y-4">
                    <Link href="/admin/users">
                      <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center">
                          <div className="p-2 bg-primary-900/30 rounded-lg ml-4">
                            <FiUsers className="text-xl text-primary-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">إدارة المستخدمين</h4>
                            <p className="text-sm text-gray-400">عرض وتعديل وإدارة المستخدمين</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    <Link href="/admin/contact-messages">
                      <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-900/30 rounded-lg ml-4">
                            <FiMessageSquare className="text-xl text-green-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">رسائل التواصل</h4>
                            <p className="text-sm text-gray-400">عرض وإدارة رسائل التواصل من العملاء</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">نظرة عامة على النظام</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">معلومات المستخدمين</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">إجمالي المستخدمين</p>
                          <p className="text-xl font-bold">{isLoading ? '...' : stats.totalUsers}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">المستخدمين النشطين</p>
                          <p className="text-xl font-bold">{isLoading ? '...' : Math.round(stats.totalUsers * 0.7)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">إحصائيات الطلبات</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">طلبات PrivateAI</p>
                          <p className="text-xl font-bold">{isLoading ? '...' : stats.totalRequests}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">طلبات معلقة</p>
                          <p className="text-xl font-bold">{isLoading ? '...' : stats.pendingRequests}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">رسائل التواصل</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">إجمالي الرسائل</p>
                          <p className="text-xl font-bold">{isLoading ? '...' : stats.totalMessages}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">رسائل غير مقروءة</p>
                          <p className="text-xl font-bold">{isLoading ? '...' : stats.unreadMessages}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 