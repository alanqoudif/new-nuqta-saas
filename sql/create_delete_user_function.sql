-- إنشاء دالة لحذف المستخدم
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- حذف الدالة إذا كانت موجودة
DROP FUNCTION IF EXISTS delete_user;

-- إنشاء دالة لحذف المستخدم
CREATE OR REPLACE FUNCTION delete_user(
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_role TEXT;
    v_current_user_id UUID;
BEGIN
    -- التحقق من أن المستخدم الحالي هو مسؤول
    v_current_user_id := auth.uid();
    
    SELECT role INTO v_admin_role
    FROM profiles
    WHERE id = v_current_user_id;
    
    IF v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'ليس لديك صلاحية لحذف المستخدمين';
    END IF;
    
    -- التحقق من أن المستخدم المراد حذفه ليس المستخدم الحالي
    IF p_user_id = v_current_user_id THEN
        RAISE EXCEPTION 'لا يمكنك حذف حسابك الخاص';
    END IF;
    
    -- حذف المستخدم من جدول profiles
    DELETE FROM profiles
    WHERE id = p_user_id;
    
    -- لا يمكننا حذف المستخدم من auth.users مباشرة من هنا
    -- يجب استخدام واجهة برمجة التطبيقات الخاصة بـ Supabase لذلك
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'حدث خطأ أثناء حذف المستخدم: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- إضافة تعليق للدالة
COMMENT ON FUNCTION delete_user IS 'دالة لحذف المستخدم بعد التحقق من صلاحيات المسؤول'; 