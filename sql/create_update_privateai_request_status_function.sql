-- إنشاء دالة لتحديث حالة طلب الذكاء الاصطناعي الخاص
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- حذف الدالة إذا كانت موجودة
DROP FUNCTION IF EXISTS update_privateai_request_status;

-- إنشاء دالة لتحديث حالة طلب الذكاء الاصطناعي الخاص
CREATE OR REPLACE FUNCTION update_privateai_request_status(
    p_request_id UUID,
    p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_role TEXT;
    v_current_user_id UUID;
    v_request_exists BOOLEAN;
BEGIN
    -- التحقق من أن المستخدم الحالي هو مسؤول
    v_current_user_id := auth.uid();
    
    SELECT role INTO v_admin_role
    FROM profiles
    WHERE id = v_current_user_id;
    
    IF v_admin_role != 'admin' THEN
        RAISE EXCEPTION 'ليس لديك صلاحية لتحديث حالة الطلبات';
    END IF;
    
    -- التحقق من أن الطلب موجود
    SELECT EXISTS (
        SELECT 1 
        FROM privateai_requests 
        WHERE id = p_request_id
    ) INTO v_request_exists;
    
    IF NOT v_request_exists THEN
        RAISE EXCEPTION 'الطلب غير موجود';
    END IF;
    
    -- التحقق من أن الحالة صحيحة
    IF p_status NOT IN ('pending', 'approved', 'rejected') THEN
        RAISE EXCEPTION 'الحالة غير صحيحة. يجب أن تكون pending أو approved أو rejected';
    END IF;
    
    -- تحديث حالة الطلب
    UPDATE privateai_requests
    SET 
        status = p_status,
        updated_at = NOW()
    WHERE id = p_request_id;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'حدث خطأ أثناء تحديث حالة الطلب: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- إضافة تعليق للدالة
COMMENT ON FUNCTION update_privateai_request_status IS 'دالة لتحديث حالة طلب الذكاء الاصطناعي الخاص بعد التحقق من صلاحيات المسؤول'; 