-- حذف جميع الجداول والوظائف المتكررة

-- حذف الوظائف
DROP FUNCTION IF EXISTS update_user_profile(UUID, TEXT);
DROP FUNCTION IF EXISTS update_privateai_request_status(UUID, TEXT);
DROP FUNCTION IF EXISTS create_private_ai_request(UUID, TEXT, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS fetch_all_users();

-- حذف السياسات
DROP POLICY IF EXISTS "المقالات المنشورة متاحة للجميع" ON blog_posts;
DROP POLICY IF EXISTS "المشرفون يمكنهم إدارة جميع المقالات" ON blog_posts;
DROP POLICY IF EXISTS "المستخدمون يمكنهم إدارة مقالاتهم فقط" ON blog_posts;
DROP POLICY IF EXISTS "المشرفون فقط يمكنهم رؤية رسائل التواصل" ON contact_messages;
DROP POLICY IF EXISTS "المشرفون فقط يمكنهم رؤية طلبات الوصول المبكر" ON early_access_requests;
DROP POLICY IF EXISTS "المستخدمون يمكنهم رؤية طلباتهم فقط" ON ai_requests;
DROP POLICY IF EXISTS "المشرفون يمكنهم رؤية جميع الطلبات" ON ai_requests;
DROP POLICY IF EXISTS "المستخدمون يمكنهم رؤية طلباتهم فقط" ON privateai_requests;
DROP POLICY IF EXISTS "المشرفون يمكنهم رؤية جميع الطلبات" ON privateai_requests;

-- حذف الجداول
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS early_access_requests;
DROP TABLE IF EXISTS ai_requests;
DROP TABLE IF EXISTS privateai_requests;
DROP TABLE IF EXISTS site_projects;

-- التأكد من وجود امتداد uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- إنشاء جدول المقالات
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  cover_image TEXT,
  category TEXT
);

-- إنشاء جدول رسائل التواصل
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'unread'
);

-- إنشاء جدول طلبات الوصول المبكر
CREATE TABLE early_access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,
  service_name TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول طلبات الذكاء الاصطناعي
CREATE TABLE ai_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  number_of_users INTEGER,
  domain_of_use TEXT,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء وظيفة لتحديث الملف الشخصي
CREATE OR REPLACE FUNCTION update_user_profile(
  p_user_id UUID,
  p_full_name TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET 
    full_name = p_full_name,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, full_name, created_at, updated_at)
    VALUES (p_user_id, p_full_name, NOW(), NOW());
  END IF;
END;
$$ LANGUAGE plpgsql;

-- تمكين RLS على الجداول
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان للمقالات
CREATE POLICY "المقالات المنشورة متاحة للجميع" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "المشرفون يمكنهم إدارة جميع المقالات" ON blog_posts
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "المستخدمون يمكنهم إدارة مقالاتهم فقط" ON blog_posts
  USING (author_id = auth.uid());

-- سياسات الأمان لرسائل التواصل
CREATE POLICY "المشرفون فقط يمكنهم رؤية رسائل التواصل" ON contact_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- سياسات الأمان لطلبات الوصول المبكر
CREATE POLICY "المشرفون فقط يمكنهم رؤية طلبات الوصول المبكر" ON early_access_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- سياسات الأمان لطلبات الذكاء الاصطناعي
CREATE POLICY "المستخدمون يمكنهم رؤية طلباتهم فقط" ON ai_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "المشرفون يمكنهم رؤية جميع الطلبات" ON ai_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  ); 