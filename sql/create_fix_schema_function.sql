-- إنشاء دالة لإصلاح هيكل جدول طلبات الذكاء الاصطناعي الخاص
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- حذف الدالة إذا كانت موجودة
DROP FUNCTION IF EXISTS fix_privateai_requests_schema();

-- إنشاء دالة يمكن استدعاؤها من التطبيق لإصلاح هيكل الجدول
CREATE OR REPLACE FUNCTION fix_privateai_requests_schema()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- 1. التحقق من وجود الجدول وإنشائه إذا لم يكن موجودًا
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'privateai_requests') THEN
        CREATE TABLE privateai_requests (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            usage_type TEXT,
            number_of_users INTEGER,
            domain_of_use TEXT,
            description TEXT,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'تم إنشاء جدول privateai_requests بنجاح';
    END IF;
    
    -- 2. التحقق من وجود الأعمدة المطلوبة وإضافتها إذا لم تكن موجودة
    
    -- التحقق من عمود domain_of_use
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'privateai_requests' 
        AND column_name = 'domain_of_use'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE privateai_requests ADD COLUMN domain_of_use TEXT;
        RAISE NOTICE 'تمت إضافة عمود domain_of_use إلى جدول privateai_requests';
    END IF;
    
    -- التحقق من عمود description
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'privateai_requests' 
        AND column_name = 'description'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE privateai_requests ADD COLUMN description TEXT;
        RAISE NOTICE 'تمت إضافة عمود description إلى جدول privateai_requests';
    END IF;
    
    -- التحقق من عمود usage_type
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'privateai_requests' 
        AND column_name = 'usage_type'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE privateai_requests ADD COLUMN usage_type TEXT;
        RAISE NOTICE 'تمت إضافة عمود usage_type إلى جدول privateai_requests';
    END IF;
    
    -- التحقق من عمود number_of_users
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'privateai_requests' 
        AND column_name = 'number_of_users'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE privateai_requests ADD COLUMN number_of_users INTEGER;
        RAISE NOTICE 'تمت إضافة عمود number_of_users إلى جدول privateai_requests';
    END IF;
    
    -- 3. إعادة تحميل الـ schema cache
    PERFORM pg_notify('pgrst', 'reload schema');
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'حدث خطأ أثناء إصلاح هيكل الجدول: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- إضافة تعليق للدالة
COMMENT ON FUNCTION fix_privateai_requests_schema() IS 'دالة لإصلاح هيكل جدول طلبات الذكاء الاصطناعي الخاص'; 