import { supabase } from './supabase';

interface BoltProject {
  id: string;
  name: string;
  description: string;
  data: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * خدمة للتعامل مع bolt.diy
 */
export const BoltService = {
  /**
   * إنشاء مشروع جديد
   */
  createProject: async (userId: string, name: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('site_builder_projects')
        .insert({
          user_id: userId,
          name,
          description,
          data: {},
        })
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (error) {
      console.error('Error creating bolt project:', error);
      throw error;
    }
  },

  /**
   * الحصول على مشروع بواسطة المعرف
   */
  getProjectById: async (projectId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('site_builder_projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data as BoltProject;
    } catch (error) {
      console.error('Error fetching bolt project:', error);
      throw error;
    }
  },

  /**
   * الحصول على جميع مشاريع المستخدم
   */
  getUserProjects: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('site_builder_projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as BoltProject[];
    } catch (error) {
      console.error('Error fetching user bolt projects:', error);
      throw error;
    }
  },

  /**
   * تحديث بيانات المشروع
   */
  updateProjectData: async (projectId: string, userId: string, projectData: any) => {
    try {
      const { error } = await supabase
        .from('site_builder_projects')
        .update({
          data: projectData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating bolt project data:', error);
      throw error;
    }
  },

  /**
   * حذف مشروع
   */
  deleteProject: async (projectId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('site_builder_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting bolt project:', error);
      throw error;
    }
  },

  /**
   * نشر موقع
   */
  publishWebsite: async (projectId: string, userId: string) => {
    try {
      // هنا يمكن إضافة منطق نشر الموقع
      // مثل تحديث حالة المشروع أو إرسال البيانات إلى خدمة استضافة
      
      const { error } = await supabase
        .from('site_builder_projects')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error publishing bolt website:', error);
      throw error;
    }
  },
}; 