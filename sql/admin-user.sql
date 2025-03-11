-- إنشاء حساب أدمن في جدول auth.users
-- ملاحظة: يجب تنفيذ هذا الأمر في SQL Editor في Supabase

-- 1. إنشاء المستخدم في جدول auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@nuqta.ai',
  crypt('Admin1234#', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "مدير النظام"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- 2. تحديث دور المستخدم في جدول profiles
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@nuqta.ai';

-- 3. التحقق من إنشاء المستخدم
SELECT id, email, role FROM public.profiles WHERE email = 'admin@nuqta.ai'; 