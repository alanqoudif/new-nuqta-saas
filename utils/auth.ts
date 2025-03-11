import { supabase } from '@/lib/supabase';
import { User } from '@/types';

/**
 * التحقق من وجود جلسة نشطة
 * @returns {Promise<boolean>} حالة المصادقة
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

/**
 * الحصول على معلومات المستخدم الحالي
 * @returns {Promise<User | null>} معلومات المستخدم أو null إذا لم يكن هناك مستخدم
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }
    
    // الحصول على ملف المستخدم مع دوره
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }
    
    const user: User = {
      id: session.user.id,
      email: session.user.email || '',
      role: profile?.role || 'user',
      full_name: profile?.full_name || session.user.user_metadata?.full_name,
      avatar_url: profile?.avatar_url,
    };
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * تسجيل الخروج
 * @returns {Promise<boolean>} نجاح العملية
 */
export const signOut = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

/**
 * تحديث ملف المستخدم
 * @param userId معرف المستخدم
 * @param data البيانات المراد تحديثها
 * @returns {Promise<boolean>} نجاح العملية
 */
export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

/**
 * إنشاء ملف مستخدم جديد
 * @param user بيانات المستخدم
 * @returns {Promise<boolean>} نجاح العملية
 */
export const createUserProfile = async (user: User): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role || 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
}; 