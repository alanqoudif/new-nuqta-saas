import { supabase } from './supabase';

export interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  is_active: boolean;
  icon_name: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * خدمة للتعامل مع إعدادات وسائل التواصل الاجتماعي
 */
export const SocialMediaService = {
  /**
   * الحصول على جميع وسائل التواصل الاجتماعي النشطة
   */
  getActiveSocialMedia: async (): Promise<SocialMedia[]> => {
    try {
      console.log('Fetching active social media...');
      const { data, error } = await supabase
        .from('social_media_settings')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Active social media fetched:', data);
      return data as SocialMedia[];
    } catch (error) {
      console.error('Error fetching active social media:', error);
      return []; // إرجاع مصفوفة فارغة بدلاً من رمي الخطأ
    }
  },

  /**
   * الحصول على جميع وسائل التواصل الاجتماعي (للمسؤولين)
   */
  getAllSocialMedia: async (): Promise<SocialMedia[]> => {
    try {
      console.log('Fetching all social media...');
      const { data, error } = await supabase
        .from('social_media_settings')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('All social media fetched:', data);
      return data as SocialMedia[];
    } catch (error) {
      console.error('Error fetching all social media:', error);
      return []; // إرجاع مصفوفة فارغة بدلاً من رمي الخطأ
    }
  },

  /**
   * الحصول على وسيلة تواصل اجتماعي بواسطة المعرف
   */
  getSocialMediaById: async (id: string): Promise<SocialMedia | null> => {
    try {
      const { data, error } = await supabase
        .from('social_media_settings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as SocialMedia;
    } catch (error) {
      console.error('Error fetching social media by ID:', error);
      return null; // إرجاع null بدلاً من رمي الخطأ
    }
  },

  /**
   * إنشاء وسيلة تواصل اجتماعي جديدة
   */
  createSocialMedia: async (socialMedia: Omit<SocialMedia, 'id' | 'created_at' | 'updated_at'>): Promise<SocialMedia | null> => {
    try {
      const { data, error } = await supabase
        .from('social_media_settings')
        .insert([socialMedia])
        .select();

      if (error) throw error;
      return data[0] as SocialMedia;
    } catch (error) {
      console.error('Error creating social media:', error);
      return null; // إرجاع null بدلاً من رمي الخطأ
    }
  },

  /**
   * تحديث وسيلة تواصل اجتماعي
   */
  updateSocialMedia: async (id: string, socialMedia: Partial<Omit<SocialMedia, 'id' | 'created_at' | 'updated_at'>>): Promise<SocialMedia | null> => {
    try {
      const { data, error } = await supabase
        .from('social_media_settings')
        .update(socialMedia)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0] as SocialMedia;
    } catch (error) {
      console.error('Error updating social media:', error);
      return null; // إرجاع null بدلاً من رمي الخطأ
    }
  },

  /**
   * حذف وسيلة تواصل اجتماعي
   */
  deleteSocialMedia: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('social_media_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting social media:', error);
      return false; // إرجاع false بدلاً من رمي الخطأ
    }
  },

  /**
   * تغيير ترتيب عرض وسائل التواصل الاجتماعي
   */
  reorderSocialMedia: async (socialMediaIds: string[]): Promise<boolean> => {
    try {
      // استخدام المعاملات لضمان تحديث جميع وسائل التواصل الاجتماعي بنجاح
      const updates = socialMediaIds.map((id, index) => {
        return supabase
          .from('social_media_settings')
          .update({ display_order: index + 1 })
          .eq('id', id);
      });

      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error('Error reordering social media:', error);
      return false; // إرجاع false بدلاً من رمي الخطأ
    }
  },

  /**
   * تفعيل أو تعطيل وسيلة تواصل اجتماعي
   */
  toggleSocialMediaActive: async (id: string, isActive: boolean): Promise<SocialMedia | null> => {
    try {
      const { data, error } = await supabase
        .from('social_media_settings')
        .update({ is_active: isActive })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0] as SocialMedia;
    } catch (error) {
      console.error('Error toggling social media active state:', error);
      return null; // إرجاع null بدلاً من رمي الخطأ
    }
  }
}; 