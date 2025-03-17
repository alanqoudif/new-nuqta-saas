-- إنشاء مستخدم مسؤول مباشرة في قاعدة البيانات Supabase
-- يجب تنفيذ هذا الملف في محرر SQL في لوحة تحكم Supabase

-- 1. إنشاء مستخدم جديد في جدول auth.users
-- ملاحظة: كلمة المرور هنا هي 'Admin1234#' مشفرة بـ bcrypt
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
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@nuqta.ai',
  crypt('Admin1234#', gen_salt('bf')), -- استخدام وظيفة crypt لتشفير كلمة المرور
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"مدير النظام"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO NOTHING;

-- 2. إنشاء سجل في جدول profiles للمستخدم الجديد
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  'admin',
  created_at,
  updated_at
FROM auth.users
WHERE email = 'admin@nuqta.ai'
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    updated_at = NOW();

-- 3. التحقق من إنشاء المستخدم
SELECT u.id, u.email, p.role
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@nuqta.ai'; 