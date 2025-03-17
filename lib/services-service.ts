import { supabase } from './supabase';

export interface Service {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  color: string;
  url: string;
  is_active: boolean;
  is_coming_soon: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  details?: ServiceDetail[];
  usage_instructions?: string;
  features?: string[];
}

// واجهة لتفاصيل الخدمة (الكاردات)
export interface ServiceDetail {
  title: string;
  description: string;
  icon_name?: string;
}

/**
 * خدمة للتعامل مع جدول الخدمات
 */
export const ServicesService = {
  /**
   * الحصول على جميع الخدمات النشطة
   */
  getActiveServices: async (): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Service[];
    } catch (error) {
      console.error('Error fetching active services:', error);
      throw error;
    }
  },

  /**
   * الحصول على جميع الخدمات (للمسؤولين)
   */
  getAllServices: async (): Promise<Service[]> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Service[];
    } catch (error) {
      console.error('Error fetching all services:', error);
      throw error;
    }
  },

  /**
   * الحصول على خدمة بواسطة المعرف
   */
  getServiceById: async (id: string): Promise<Service | null> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Service;
    } catch (error) {
      console.error('Error fetching service by ID:', error);
      throw error;
    }
  },

  /**
   * إنشاء خدمة جديدة
   */
  createService: async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([service])
        .select();

      if (error) throw error;
      return data[0] as Service;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  },

  /**
   * تحديث خدمة
   */
  updateService: async (id: string, service: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>): Promise<Service> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(service)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0] as Service;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  /**
   * تحديث تفاصيل الخدمة
   */
  updateServiceDetails: async (id: string, details: ServiceDetail[]): Promise<Service> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ details })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0] as Service;
    } catch (error) {
      console.error('Error updating service details:', error);
      throw error;
    }
  },

  /**
   * تحديث تعليمات استخدام الخدمة
   */
  updateServiceUsageInstructions: async (id: string, usage_instructions: string): Promise<Service> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ usage_instructions })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0] as Service;
    } catch (error) {
      console.error('Error updating service usage instructions:', error);
      throw error;
    }
  },

  /**
   * تحديث مميزات الخدمة
   */
  updateServiceFeatures: async (id: string, features: string[]): Promise<Service> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ features })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0] as Service;
    } catch (error) {
      console.error('Error updating service features:', error);
      throw error;
    }
  },

  /**
   * حذف خدمة
   */
  deleteService: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },

  /**
   * تغيير ترتيب عرض الخدمات
   */
  reorderServices: async (serviceIds: string[]): Promise<boolean> => {
    try {
      // استخدام المعاملات لضمان تحديث جميع الخدمات بنجاح
      const updates = serviceIds.map((id, index) => {
        return supabase
          .from('services')
          .update({ display_order: index + 1 })
          .eq('id', id);
      });

      await Promise.all(updates);
      return true;
    } catch (error) {
      console.error('Error reordering services:', error);
      throw error;
    }
  },

  /**
   * تفعيل أو تعطيل خدمة
   */
  toggleServiceActive: async (id: string, isActive: boolean): Promise<Service> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ is_active: isActive })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0] as Service;
    } catch (error) {
      console.error('Error toggling service active state:', error);
      throw error;
    }
  },

  /**
   * تغيير حالة "قادم قريباً" للخدمة
   */
  toggleServiceComingSoon: async (id: string, isComingSoon: boolean): Promise<Service> => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ is_coming_soon: isComingSoon })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0] as Service;
    } catch (error) {
      console.error('Error toggling service coming soon state:', error);
      throw error;
    }
  }
}; 