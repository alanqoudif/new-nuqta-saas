-- إنشاء دالة لإنشاء طلب ذكاء اصطناعي خاص
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- حذف الدالة إذا كانت موجودة
DROP FUNCTION IF EXISTS create_privateai_request;

-- إنشاء دالة لإنشاء طلب ذكاء اصطناعي خاص
CREATE OR REPLACE FUNCTION create_privateai_request(
    p_user_id UUID,
    p_usage_type TEXT,
    p_number_of_users INTEGER,
    p_domain_of_use TEXT,
    p_description TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_user_id UUID;
BEGIN
    -- التحقق من أن المستخدم الحالي هو نفسه المستخدم المحدد
    v_current_user_id := auth.uid();
    
    IF v_current_user_id != p_user_id THEN
        RAISE EXCEPTION 'ليس لديك صلاحية لإنشاء طلب باسم مستخدم آخر';
    END IF;
    
    -- إدراج الطلب في جدول privateai_requests
    INSERT INTO privateai_requests (
        user_id,
        usage_type,
        number_of_users,
        domain_of_use,
        description,
        status,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_usage_type,
        p_number_of_users,
        p_domain_of_use,
        p_description,
        'pending',
        NOW(),
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'حدث خطأ أثناء إنشاء طلب الذكاء الاصطناعي الخاص: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- إضافة تعليق للدالة
COMMENT ON FUNCTION create_privateai_request IS 'دالة لإنشاء طلب ذكاء اصطناعي خاص بعد التحقق من صلاحيات المستخدم'; 