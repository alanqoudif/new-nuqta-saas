'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiUsers, FiServer, FiCode, FiActivity, FiArrowRight } from 'react-icons/fi';
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
}

export default function AdminDashboardPage() {
  const { user, refreshSession } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRequests: 0,
    pendingRequests: 0,
    totalProjects: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionChecking, setIsSessionChecking] = useState(true);

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

  useEffect(() => {
    const fetchStats = async () => {
      if (isSessionChecking || !user || user.role !== 'admin') {
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Fetching admin stats...');

        // الحصول على إجمالي المستخدمين
        const { count: totalUsers, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        // الحصول على إجمالي طلبات PrivateAI
        const { count: totalRequests, error: requestsError } = await supabase
          .from('privateai_requests')
          .select('*', { count: 'exact', head: true });

        if (requestsError) throw requestsError;

        // الحصول على الطلبات المعلقة
        const { count: pendingRequests, error: pendingError } = await supabase
          .from('privateai_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (pendingError) throw pendingError;

        // الحصول على إجمالي مشاريع المواقع
        const { count: totalProjects, error: projectsError } = await supabase
          .from('ai_site_projects')
          .select('*', { count: 'exact', head: true });

        if (projectsError) throw projectsError;

        setStats({
          totalUsers: totalUsers || 0,
          totalRequests: totalRequests || 0,
          pendingRequests: pendingRequests || 0,
          totalProjects: totalProjects || 0,
        });
        
        console.log('Admin stats loaded successfully');
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('حدث خطأ في جلب الإحصائيات');
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
                  
                  <Link href="/admin/privateai-requests">
                    <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="flex items-center">
                        <div className="p-2 bg-secondary-900/30 rounded-lg ml-4">
                          <FiServer className="text-xl text-secondary-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">طلبات PrivateAI</h4>
                          <p className="text-sm text-gray-400">مراجعة والموافقة على الطلبات المعلقة</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/admin/site-projects">
                    <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="flex items-center">
                        <div className="p-2 bg-indigo-900/30 rounded-lg ml-4">
                          <FiCode className="text-xl text-indigo-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">إدارة مشاريع المواقع</h4>
                          <p className="text-sm text-gray-400">عرض وإدارة مشاريع منشئ المواقع</p>
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
                  <h3 className="text-xl font-bold">النشاط الأخير</h3>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center text-gray-500 py-8">
                      <FiActivity className="text-4xl mx-auto mb-2 opacity-50" />
                      <p>سيتم عرض النشاط الأخير هنا قريبًا</p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
} 