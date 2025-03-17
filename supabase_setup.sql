-- إنشاء جدول المقالات
CREATE TABLE IF NOT EXISTS blog_posts (
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
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'unread',
  notes TEXT
);

-- التأكد من وجود جدول طلبات الوصول المبكر
CREATE TABLE IF NOT EXISTS early_access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  job_title TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

-- التأكد من وجود جدول طلبات الذكاء الاصطناعي
CREATE TABLE IF NOT EXISTS ai_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- حذف الدالة إذا كانت موجودة لتجنب خطأ تغيير نوع الإرجاع
DROP FUNCTION IF EXISTS update_user_profile(UUID, TEXT);

-- إنشاء وظيفة لتحديث الملف الشخصي
CREATE OR REPLACE FUNCTION update_user_profile(
  p_user_id UUID,
  p_full_name TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    full_name = p_full_name,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO profiles (id, full_name, created_at, updated_at)
    VALUES (p_user_id, p_full_name, NOW(), NOW());
  END IF;
END;
$$ LANGUAGE plpgsql;

-- إنشاء سياسات الأمان للمقالات
CREATE POLICY "المقالات المنشورة متاحة للجميع" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "المشرفون يمكنهم إدارة جميع المقالات" ON blog_posts
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "المستخدمون يمكنهم إدارة مقالاتهم فقط" ON blog_posts
  USING (author_id = auth.uid());

-- تمكين RLS على الجداول
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لرسائل التواصل
CREATE POLICY "المشرفون فقط يمكنهم رؤية رسائل التواصل" ON contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- سياسات الأمان لطلبات الوصول المبكر
CREATE POLICY "المشرفون فقط يمكنهم رؤية طلبات الوصول المبكر" ON early_access_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- سياسات الأمان لطلبات الذكاء الاصطناعي
CREATE POLICY "المستخدمون يمكنهم رؤية طلباتهم فقط" ON ai_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "المشرفون يمكنهم رؤية جميع الطلبات" ON ai_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  ); 