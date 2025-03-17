-- إنشاء جدول للملفات الشخصية للمستخدمين
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء دالة لإضافة سجل جديد في جدول الملفات الشخصية عند إنشاء مستخدم جديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء مشغل لتنفيذ الدالة عند إنشاء مستخدم جديد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- إنشاء جدول لطلبات الذكاء الاصطناعي الخاص
CREATE TABLE IF NOT EXISTS public.privateai_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  use_case TEXT,
  requirements TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول لمشاريع بناء المواقع
CREATE TABLE IF NOT EXISTS public.site_builder_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  description TEXT,
  status TEXT DEFAULT 'draft',
  content JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء سياسات الأمان للجداول
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privateai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_builder_projects ENABLE ROW LEVEL SECURITY;

-- سياسة للمستخدمين العاديين: يمكنهم قراءة وتحديث ملفاتهم الشخصية فقط
CREATE POLICY "Users can view and update their own profiles"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- سياسة للمشرفين: يمكنهم قراءة جميع الملفات الشخصية
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- سياسة للمستخدمين العاديين: يمكنهم إنشاء وقراءة وتحديث طلباتهم الخاصة
CREATE POLICY "Users can manage their own requests"
  ON public.privateai_requests
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- سياسة للمشرفين: يمكنهم قراءة وتحديث جميع الطلبات
CREATE POLICY "Admins can manage all requests"
  ON public.privateai_requests
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- سياسة للمستخدمين العاديين: يمكنهم إدارة مشاريعهم الخاصة
CREATE POLICY "Users can manage their own projects"
  ON public.site_builder_projects
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- سياسة للمشرفين: يمكنهم قراءة جميع المشاريع
CREATE POLICY "Admins can view all projects"
  ON public.site_builder_projects
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- تحديث دور المستخدم ليكون مشرفًا (يجب تنفيذ هذا بعد إنشاء المستخدم)
-- استبدل 'admin@nuqta.ai' بالبريد الإلكتروني للمستخدم الذي تريد جعله مشرفًا
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@nuqta.ai'; 