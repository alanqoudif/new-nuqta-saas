-- إضافة حقل الوصف إلى جدول طلبات الذكاء الاصطناعي الخاص
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- التحقق من وجود الحقل قبل إضافته
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'privateai_requests' 
        AND column_name = 'description'
    ) THEN
        -- إضافة حقل الوصف
        ALTER TABLE privateai_requests ADD COLUMN description TEXT;
        
        -- طباعة رسالة تأكيد
        RAISE NOTICE 'تمت إضافة حقل الوصف (description) إلى جدول privateai_requests بنجاح';
    ELSE
        -- طباعة رسالة إذا كان الحقل موجودًا بالفعل
        RAISE NOTICE 'حقل الوصف (description) موجود بالفعل في جدول privateai_requests';
    END IF;
END $$; 