-- إصلاح جدول طلبات الذكاء الاصطناعي الخاص
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- 1. التحقق من وجود الجدول وإنشائه إذا لم يكن موجودًا
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'privateai_requests') THEN
        CREATE TABLE privateai_requests (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            usage_type TEXT NOT NULL,
            number_of_users INTEGER NOT NULL,
            domain_of_use TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'تم إنشاء جدول privateai_requests بنجاح';
    ELSE
        RAISE NOTICE 'جدول privateai_requests موجود بالفعل';
    END IF;
END;
$$;

-- 2. التحقق من وجود الأعمدة المطلوبة وإضافتها إذا لم تكن موجودة
DO $$
BEGIN
    -- التحقق من عمود domain_of_use
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'privateai_requests' 
        AND column_name = 'domain_of_use'
    ) THEN
        ALTER TABLE privateai_requests ADD COLUMN domain_of_use TEXT;
        RAISE NOTICE 'تمت إضافة عمود domain_of_use إلى جدول privateai_requests';
    END IF;
END;
$$;

DO $$
BEGIN
    -- التحقق من عمود description
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'privateai_requests' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE privateai_requests ADD COLUMN description TEXT;
        RAISE NOTICE 'تمت إضافة عمود description إلى جدول privateai_requests';
    END IF;
END;
$$;

DO $$
BEGIN
    -- التحقق من عمود usage_type
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'privateai_requests' 
        AND column_name = 'usage_type'
    ) THEN
        ALTER TABLE privateai_requests ADD COLUMN usage_type TEXT;
        RAISE NOTICE 'تمت إضافة عمود usage_type إلى جدول privateai_requests';
    END IF;
END;
$$;

DO $$
BEGIN
    -- التحقق من عمود number_of_users
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'privateai_requests' 
        AND column_name = 'number_of_users'
    ) THEN
        ALTER TABLE privateai_requests ADD COLUMN number_of_users INTEGER;
        RAISE NOTICE 'تمت إضافة عمود number_of_users إلى جدول privateai_requests';
    END IF;
END;
$$;

-- 3. إضافة trigger لتحديث حقل updated_at إذا لم يكن موجودًا
DO $$
BEGIN
    -- التحقق من وجود الدالة
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_proc 
        WHERE proname = 'update_updated_at_column'
    ) THEN
        -- إنشاء الدالة
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        RAISE NOTICE 'تم إنشاء دالة update_updated_at_column بنجاح';
    END IF;
END;
$$;

DO $$
BEGIN
    -- التحقق من وجود الـ trigger
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'update_privateai_requests_updated_at'
    ) THEN
        -- إنشاء الـ trigger
        CREATE TRIGGER update_privateai_requests_updated_at
        BEFORE UPDATE ON privateai_requests
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        
        RAISE NOTICE 'تم إنشاء trigger update_privateai_requests_updated_at بنجاح';
    END IF;
END;
$$;

-- 4. إعادة تحميل الـ schema cache
SELECT pg_reload_conf();
NOTIFY pgrst, 'reload schema'; 