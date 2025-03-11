-- إنشاء مستخدم أدمن يدويًا في Supabase
-- يجب تنفيذ هذا الكود في SQL Editor في Supabase

-- 1. إنشاء مستخدم في auth.users
-- ملاحظة: يجب تغيير البريد الإلكتروني وكلمة المرور
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
VALUES (
  gen_random_uuid(),
  'admin@nuqta.ai', -- قم بتغيير البريد الإلكتروني
  crypt('Admin1234#', gen_salt('bf')), -- قم بتغيير كلمة المرور
  now(),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"مدير النظام"}'
);

-- 2. إنشاء ملف profile برول أدمن
INSERT INTO public.profiles (
  id,
  email,
  role,
  full_name,
  created_at,
  updated_at
)
VALUES (
  (SELECT id FROM auth.users WHERE email='admin@nuqta.ai'), -- يجب أن يكون نفس البريد الإلكتروني المستخدم أعلاه
  'admin@nuqta.ai', -- يجب أن يكون نفس البريد الإلكتروني المستخدم أعلاه
  'admin',
  'مدير النظام',
  now(),
  now()
);

-- 3. إضافة constraint فريد على حقل email في جدول profiles (إذا لم يكن موجودًا)
-- ALTER TABLE profiles ADD CONSTRAINT unique_email UNIQUE (email);

-- 4. للتحقق من إنشاء المستخدم
-- SELECT * FROM auth.users WHERE email='admin@nuqta.ai';
-- SELECT * FROM public.profiles WHERE email='admin@nuqta.ai'; 