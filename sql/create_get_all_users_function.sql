-- إنشاء دالة لجلب جميع المستخدمين
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- حذف الدالة إذا كانت موجودة
DROP FUNCTION IF EXISTS get_all_users;

-- إنشاء دالة لجلب جميع المستخدمين
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS SETOF json
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
        RAISE EXCEPTION 'ليس لديك صلاحية لجلب قائمة المستخدمين';
    END IF;
    
    -- جلب المستخدمين من جدول auth.users وجدول profiles
    RETURN QUERY
    SELECT 
        json_build_object(
            'id', au.id,
            'email', au.email,
            'full_name', p.full_name,
            'role', p.role,
            'created_at', p.created_at,
            'avatar_url', p.avatar_url,
            'last_sign_in_at', au.last_sign_in_at,
            'confirmed_at', au.confirmed_at,
            'user_metadata', au.raw_user_meta_data
        )
    FROM auth.users au
    JOIN profiles p ON au.id = p.id
    ORDER BY p.created_at DESC;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'حدث خطأ أثناء جلب المستخدمين: %', SQLERRM;
        RETURN;
END;
$$;

-- إضافة تعليق للدالة
COMMENT ON FUNCTION get_all_users IS 'دالة لجلب جميع المستخدمين بعد التحقق من صلاحيات المسؤول'; 