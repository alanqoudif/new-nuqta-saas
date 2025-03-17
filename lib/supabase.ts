import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  // In development, throw an error. In production, it will fail gracefully
  if (process.env.NODE_ENV === 'development') {
    console.error('NEXT_PUBLIC_SUPABASE_URL is required but was not found in environment variables');
  }
}

// إنشاء عميل Supabase مع إعدادات محسنة لإدارة الجلسات
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'nuqta-auth-token',
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
    cookieOptions: {
      name: 'nuqta-auth-cookie',
      lifetime: 60 * 60 * 24 * 7, // 7 أيام
      domain: '',
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
});

// وظيفة مساعدة للحصول على عميل Supabase مع مفتاح الخدمة (للاستخدام في السيرفر فقط)
export const getServiceSupabase = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl || '', supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};