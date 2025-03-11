-- إنشاء دالة لتحديث ملف المستخدم
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- حذف الدالة إذا كانت موجودة
DROP FUNCTION IF EXISTS update_user_profile;

-- إنشاء دالة لتحديث ملف المستخدم
CREATE OR REPLACE FUNCTION update_user_profile(
    p_user_id UUID,
    p_full_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_exists BOOLEAN;
BEGIN
    -- التحقق من وجود ملف المستخدم
    SELECT EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = p_user_id
    ) INTO profile_exists;
    
    -- إذا كان الملف موجوداً، قم بتحديثه
    IF profile_exists THEN
        UPDATE profiles
        SET 
            full_name = p_full_name,
            updated_at = NOW()
        WHERE id = p_user_id;
    -- إذا لم يكن الملف موجوداً، قم بإنشائه
    ELSE
        INSERT INTO profiles (
            id,
            full_name,
            role,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            p_full_name,
            'user',
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'حدث خطأ أثناء تحديث ملف المستخدم: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- إضافة تعليق للدالة
COMMENT ON FUNCTION update_user_profile IS 'دالة لتحديث ملف المستخدم أو إنشائه إذا لم يكن موجوداً'; 