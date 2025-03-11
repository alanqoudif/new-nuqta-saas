-- إنشاء دالة لإنشاء جدول طلبات الذكاء الاصطناعي الخاص إذا لم يكن موجوداً
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- حذف الدالة إذا كانت موجودة
DROP FUNCTION IF EXISTS create_privateai_requests_table_if_not_exists;

-- إنشاء دالة لإنشاء جدول طلبات الذكاء الاصطناعي الخاص إذا لم يكن موجوداً
CREATE OR REPLACE FUNCTION create_privateai_requests_table_if_not_exists()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_table_exists BOOLEAN;
BEGIN
    -- التحقق من وجود الجدول
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'privateai_requests'
    ) INTO v_table_exists;
    
    IF NOT v_table_exists THEN
        -- إنشاء الجدول إذا لم يكن موجوداً
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
        
        RAISE NOTICE 'تم إنشاء جدول privateai_requests';
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'جدول privateai_requests موجود بالفعل';
        RETURN TRUE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'حدث خطأ أثناء إنشاء جدول privateai_requests: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- إضافة تعليق للدالة
COMMENT ON FUNCTION create_privateai_requests_table_if_not_exists IS 'دالة لإنشاء جدول طلبات الذكاء الاصطناعي الخاص إذا لم يكن موجوداً'; 