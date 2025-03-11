-- إنشاء دالة لإصلاح هيكل جدول privateai_requests
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- حذف الدالة إذا كانت موجودة
DROP FUNCTION IF EXISTS fix_privateai_requests_schema;

-- إنشاء دالة لإصلاح هيكل جدول privateai_requests
CREATE OR REPLACE FUNCTION fix_privateai_requests_schema()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_role TEXT;
    v_current_user_id UUID;
    v_column_exists BOOLEAN;
    v_table_exists BOOLEAN;
BEGIN
    -- التحقق من أن المستخدم الحالي هو مسؤول
    v_current_user_id := auth.uid();
    
    -- التحقق من وجود الجدول
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'privateai_requests'
    ) INTO v_table_exists;
    
    IF NOT v_table_exists THEN
        -- إنشاء الجدول إذا لم يكن موجودًا
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
        
        -- إنشاء سياسة RLS للقراءة (للمسؤولين فقط)
        CREATE POLICY "المسؤولون يمكنهم قراءة طلبات الذكاء الاصطناعي الخاص"
        ON privateai_requests FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
        );

        -- إنشاء سياسة RLS للإدراج (للجميع)
        CREATE POLICY "يمكن للجميع إرسال طلبات الذكاء الاصطناعي الخاص"
        ON privateai_requests FOR INSERT
        WITH CHECK (auth.uid() = user_id);

        -- تفعيل أمان مستوى الصف
        ALTER TABLE privateai_requests ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'تم إنشاء جدول privateai_requests';
    ELSE
        RAISE NOTICE 'جدول privateai_requests موجود بالفعل';
    END IF;
    
    -- التحقق من وجود عمود usage_type
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'privateai_requests'
        AND column_name = 'usage_type'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE privateai_requests
        ADD COLUMN usage_type TEXT;
        
        RAISE NOTICE 'تمت إضافة عمود usage_type';
    END IF;
    
    -- التحقق من وجود عمود number_of_users
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'privateai_requests'
        AND column_name = 'number_of_users'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE privateai_requests
        ADD COLUMN number_of_users INTEGER DEFAULT 1;
        
        RAISE NOTICE 'تمت إضافة عمود number_of_users';
    END IF;
    
    -- التحقق من وجود عمود domain_of_use
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'privateai_requests'
        AND column_name = 'domain_of_use'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE privateai_requests
        ADD COLUMN domain_of_use TEXT;
        
        RAISE NOTICE 'تمت إضافة عمود domain_of_use';
    END IF;
    
    -- التحقق من وجود عمود description
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'privateai_requests'
        AND column_name = 'description'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE privateai_requests
        ADD COLUMN description TEXT;
        
        RAISE NOTICE 'تمت إضافة عمود description';
    END IF;
    
    -- التحقق من وجود عمود status
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'privateai_requests'
        AND column_name = 'status'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE privateai_requests
        ADD COLUMN status TEXT DEFAULT 'pending';
        
        RAISE NOTICE 'تمت إضافة عمود status';
    END IF;
    
    -- التحقق من وجود عمود updated_at
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'privateai_requests'
        AND column_name = 'updated_at'
    ) INTO v_column_exists;
    
    IF NOT v_column_exists THEN
        ALTER TABLE privateai_requests
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        -- تحديث قيم العمود الجديد بناءً على created_at
        UPDATE privateai_requests
        SET updated_at = created_at
        WHERE updated_at IS NULL;
        
        RAISE NOTICE 'تمت إضافة عمود updated_at';
    END IF;
    
    -- إضافة قيود على عمود status
    BEGIN
        ALTER TABLE privateai_requests
        ADD CONSTRAINT privateai_requests_status_check
        CHECK (status IN ('pending', 'approved', 'rejected'));
        
        RAISE NOTICE 'تمت إضافة قيود على عمود status';
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'قيود عمود status موجودة بالفعل';
    END;
    
    -- إعادة تحديث قيم status غير الصالحة
    UPDATE privateai_requests
    SET status = 'pending'
    WHERE status IS NULL OR status NOT IN ('pending', 'approved', 'rejected');
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'حدث خطأ أثناء إصلاح هيكل الجدول: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- إضافة تعليق للدالة
COMMENT ON FUNCTION fix_privateai_requests_schema IS 'دالة لإصلاح هيكل جدول privateai_requests وإضافة الأعمدة المفقودة';