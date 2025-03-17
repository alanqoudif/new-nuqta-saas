'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiSearch, FiEye, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

interface SiteProject {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_published: boolean;
  published_at: string | null;
  site_url: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

export default function AdminSiteProjectsPage() {
  const [projects, setProjects] = useState<SiteProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<SiteProject | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'unpublished'>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ai_site_projects')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
      console.log('Site projects loaded:', data?.length);
    } catch (error) {
      console.error('Error fetching site projects:', error);
      toast.error('حدث خطأ في جلب مشاريع المواقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (project: SiteProject) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ai_site_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast.success('تم حذف المشروع بنجاح');
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('حدث خطأ في حذف المشروع');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  const getPublishBadge = (isPublished: boolean) => {
    if (isPublished) {
      return <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">منشور</span>;
    }
    return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">غير منشور</span>;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.profiles.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (publishFilter === 'all') return matchesSearch;
    if (publishFilter === 'published') return matchesSearch && project.is_published;
    if (publishFilter === 'unpublished') return matchesSearch && !project.is_published;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">مشاريع المواقع</h1>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="بحث عن مشروع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <select
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm"
                value={publishFilter}
                onChange={(e) => setPublishFilter(e.target.value as any)}
              >
                <option value="all">جميع المشاريع</option>
                <option value="published">المنشورة فقط</option>
                <option value="unpublished">غير المنشورة فقط</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-t-primary-500 border-gray-700 rounded-full animate-spin"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FiCode className="text-5xl mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-medium mb-2">لا توجد مشاريع</h3>
              <p className="text-gray-500">
                {searchTerm ? 'لا توجد مشاريع تطابق معايير البحث' : 'لم يتم إنشاء أي مشاريع بعد'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-right py-3 px-4">اسم المشروع</th>
                    <th className="text-right py-3 px-4">المستخدم</th>
                    <th className="text-right py-3 px-4">تاريخ الإنشاء</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {project.description || 'لا يوجد وصف'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{project.profiles.full_name || 'مستخدم'}</div>
                        <div className="text-sm text-gray-500">{project.profiles.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        {formatDate(project.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        {getPublishBadge(project.is_published)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2 space-x-reverse">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(project)}
                            icon={<FiEye />}
                          >
                            عرض
                          </Button>
                          {project.site_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(project.site_url!, '_blank')}
                              icon={<FiExternalLink />}
                            >
                              زيارة
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-400"
                            onClick={() => handleDeleteProject(project.id)}
                            icon={<FiTrash2 />}
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
      </motion.div>

      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-white"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">الوصف</h3>
                  <p>{selectedProject.description || 'لا يوجد وصف'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">المستخدم</h3>
                  <p>{selectedProject.profiles.full_name || 'مستخدم'} ({selectedProject.profiles.email})</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">تاريخ الإنشاء</h3>
                  <p>{formatDate(selectedProject.created_at)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">حالة النشر</h3>
                  <p>{getPublishBadge(selectedProject.is_published)}</p>
                  {selectedProject.is_published && selectedProject.published_at && (
                    <p className="text-sm text-gray-500 mt-1">
                      تم النشر في: {formatDate(selectedProject.published_at)}
                    </p>
                  )}
                </div>
                
                {selectedProject.site_url && (
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">رابط الموقع</h3>
                    <a
                      href={selectedProject.site_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:underline"
                    >
                      {selectedProject.site_url}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end space-x-4 space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  إغلاق
                </Button>
                {selectedProject.site_url && (
                  <Button
                    variant="gradient"
                    onClick={() => window.open(selectedProject.site_url!, '_blank')}
                  >
                    زيارة الموقع
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 