-- إضافة حقول جديدة لجدول الخدمات لتخزين تفاصيل إضافية
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- إضافة حقل لتخزين تفاصيل الخدمة (كاردات متعددة)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'details'
    ) THEN
        ALTER TABLE services ADD COLUMN details JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'تمت إضافة عمود details إلى جدول services';
    END IF;
END;
$$;

-- إضافة حقل لتخزين تعليمات استخدام الخدمة
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'usage_instructions'
    ) THEN
        ALTER TABLE services ADD COLUMN usage_instructions TEXT DEFAULT '';
        RAISE NOTICE 'تمت إضافة عمود usage_instructions إلى جدول services';
    END IF;
END;
$$;

-- إضافة حقل لتخزين مميزات الخدمة
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'features'
    ) THEN
        ALTER TABLE services ADD COLUMN features JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'تمت إضافة عمود features إلى جدول services';
    END IF;
END;
$$;

-- إعادة تحميل الـ schema cache
SELECT pg_notify('pgrst', 'reload schema');

COMMENT ON COLUMN services.details IS 'تفاصيل إضافية للخدمة على شكل كاردات متعددة';
COMMENT ON COLUMN services.usage_instructions IS 'تعليمات استخدام الخدمة';
COMMENT ON COLUMN services.features IS 'مميزات الخدمة'; 