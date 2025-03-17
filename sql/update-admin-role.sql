-- تحديث دور المستخدم إلى مسؤول في جدول profiles
-- يجب تنفيذ هذا الملف في محرر SQL في لوحة تحكم Supabase

-- 1. البحث عن المستخدم بالبريد الإلكتروني في جدول auth.users
SELECT id, email FROM auth.users WHERE email = 'admin@nuqta.ai';

-- 2. تحديث دور المستخدم إلى مسؤول في جدول profiles
-- استبدل [USER_ID] بمعرف المستخدم الذي حصلت عليه من الاستعلام السابق
UPDATE public.profiles
SET role = 'admin'
WHERE id = '[USER_ID]';

-- 3. التحقق من التحديث
SELECT id, email, role FROM public.profiles WHERE id = '[USER_ID]';

-- ملاحظة: إذا لم يكن لديك مستخدم بالفعل، فيجب عليك أولاً إنشاء مستخدم من خلال واجهة التسجيل
-- ثم استخدام معرفه في هذا الاستعلام لتحديث دوره إلى مسؤول 