-- تعطيل التحقق من البريد الإلكتروني في Supabase
-- يجب تنفيذ هذا الأمر في SQL Editor في Supabase

-- 1. تحديث جميع المستخدمين الحاليين لتأكيد بريدهم الإلكتروني
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. إنشاء دالة لتأكيد البريد الإلكتروني تلقائيًا للمستخدمين الجدد
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. إنشاء مشغل لتنفيذ الدالة عند إنشاء مستخدم جديد
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;
CREATE TRIGGER auto_confirm_email_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_confirm_email(); 