-- إضافة عمود updated_at إلى جدول privateai_requests إذا لم يكن موجودًا بالفعل
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- التحقق من وجود العمود
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- التحقق من وجود العمود
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'privateai_requests'
        AND column_name = 'updated_at'
    ) INTO column_exists;

    -- إضافة العمود إذا لم يكن موجودًا
    IF NOT column_exists THEN
        ALTER TABLE privateai_requests
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        -- تحديث قيم العمود الجديد بناءً على created_at
        UPDATE privateai_requests
        SET updated_at = created_at
        WHERE updated_at IS NULL;
        
        RAISE NOTICE 'تمت إضافة عمود updated_at إلى جدول privateai_requests';
    ELSE
        RAISE NOTICE 'عمود updated_at موجود بالفعل في جدول privateai_requests';
    END IF;
END $$; 