-- إنشاء جدول طلبات الذكاء الاصطناعي الخاص
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- التحقق من وجود الجدول
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'privateai_requests'
    ) THEN
        -- إنشاء جدول طلبات الذكاء الاصطناعي الخاص
        CREATE TABLE privateai_requests (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            usage_type TEXT,
            number_of_users INTEGER DEFAULT 1,
            domain_of_use TEXT,
            description TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- إضافة تعليق للجدول
        COMMENT ON TABLE privateai_requests IS 'جدول لتخزين طلبات الذكاء الاصطناعي الخاص';

        -- إنشاء سياسة RLS للقراءة (للمسؤولين فقط)
        CREATE POLICY "المسؤولون يمكنهم قراءة طلبات الذكاء الاصطناعي الخاص"
        ON privateai_requests FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
        );

        -- إنشاء سياسة RLS للإدراج (للمستخدمين المسجلين)
        CREATE POLICY "المستخدمون المسجلون يمكنهم إرسال طلبات الذكاء الاصطناعي الخاص"
        ON privateai_requests FOR INSERT
        WITH CHECK (auth.uid() = user_id);

        -- إنشاء سياسة RLS للتحديث (للمسؤولين فقط)
        CREATE POLICY "المسؤولون يمكنهم تحديث طلبات الذكاء الاصطناعي الخاص"
        ON privateai_requests FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
        );

        -- تفعيل أمان مستوى الصف
        ALTER TABLE privateai_requests ENABLE ROW LEVEL SECURITY;

        -- إنشاء مؤشر على حالة الطلب
        CREATE INDEX privateai_requests_status_idx ON privateai_requests (status);

        -- إنشاء مؤشر على معرف المستخدم
        CREATE INDEX privateai_requests_user_id_idx ON privateai_requests (user_id);

        RAISE NOTICE 'تم إنشاء جدول privateai_requests بنجاح';
    ELSE
        RAISE NOTICE 'جدول privateai_requests موجود بالفعل';
    END IF;
END $$; 