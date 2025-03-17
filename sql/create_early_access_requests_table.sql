-- إنشاء جدول طلبات الوصول المبكر
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- التحقق من وجود الجدول
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'early_access_requests'
    ) THEN
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
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- إضافة تعليق للجدول
        COMMENT ON TABLE early_access_requests IS 'جدول لتخزين طلبات الوصول المبكر للخدمات';

        -- إنشاء سياسة RLS للقراءة (للمسؤولين فقط)
        CREATE POLICY "المسؤولون يمكنهم قراءة طلبات الوصول المبكر"
        ON early_access_requests FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
        );

        -- إنشاء سياسة RLS للإدراج (للجميع)
        CREATE POLICY "يمكن للجميع إرسال طلبات الوصول المبكر"
        ON early_access_requests FOR INSERT
        WITH CHECK (true);

        -- تفعيل أمان مستوى الصف
        ALTER TABLE early_access_requests ENABLE ROW LEVEL SECURITY;

        -- إنشاء مؤشر على البريد الإلكتروني
        CREATE INDEX early_access_requests_email_idx ON early_access_requests (email);

        -- إنشاء مؤشر على حالة الطلب
        CREATE INDEX early_access_requests_status_idx ON early_access_requests (status);

        RAISE NOTICE 'تم إنشاء جدول early_access_requests بنجاح';
    ELSE
        RAISE NOTICE 'جدول early_access_requests موجود بالفعل';
    END IF;
END $$; 