const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// تحميل متغيرات البيئة من ملف .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`تحميل المتغيرات البيئية من ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn(`ملف .env.local غير موجود في ${envPath}`);
  dotenv.config();
}

// التحقق من وجود المتغيرات البيئية المطلوبة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('خطأ: المتغيرات البيئية NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY مطلوبة');
  process.exit(1);
}

// إنشاء عميل Supabase باستخدام مفتاح الخدمة
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// بيانات المستخدم المسؤول
const adminEmail = 'admin@nuqta.ai';
const adminPassword = 'Admin1234#';
const adminName = 'مدير النظام';

/**
 * وظيفة لإنشاء مستخدم مسؤول أو تحديث دور مستخدم موجود
 */
async function createAdminUser() {
  try {
    console.log(`البدء في إنشاء/تحديث المستخدم المسؤول: ${adminEmail}`);

    // التحقق مما إذا كان المستخدم موجودًا بالفعل في جدول profiles
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', adminEmail)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      throw new Error(`خطأ في البحث عن المستخدم: ${profileError.message}`);
    }

    if (existingProfile) {
      console.log(`المستخدم موجود بالفعل بالمعرف: ${existingProfile.id}`);
      
      // تحديث دور المستخدم إلى مسؤول
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', existingProfile.id);

      if (updateError) {
        throw new Error(`خطأ في تحديث دور المستخدم: ${updateError.message}`);
      }

      console.log(`تم تحديث دور المستخدم ${adminEmail} إلى مسؤول بنجاح`);
      return;
    }

    // إنشاء مستخدم جديد باستخدام Supabase Admin API
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // تأكيد البريد الإلكتروني تلقائيًا
      user_metadata: {
        full_name: adminName,
      },
    });

    if (createError) {
      throw new Error(`خطأ في إنشاء المستخدم: ${createError.message}`);
    }

    if (!newUser || !newUser.user) {
      throw new Error('فشل إنشاء المستخدم: لم يتم إرجاع بيانات المستخدم');
    }

    console.log(`تم إنشاء المستخدم بنجاح بالمعرف: ${newUser.user.id}`);

    // تحديث جدول profiles لتعيين دور المستخدم كمسؤول
    const { error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        email: adminEmail,
        full_name: adminName,
        role: 'admin',
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      throw new Error(`خطأ في تحديث ملف المستخدم: ${insertError.message}`);
    }

    console.log(`تم إنشاء المستخدم المسؤول بنجاح: ${adminEmail}`);
    console.log('يمكنك الآن تسجيل الدخول باستخدام:');
    console.log(`البريد الإلكتروني: ${adminEmail}`);
    console.log(`كلمة المرور: ${adminPassword}`);

  } catch (error) {
    console.error('خطأ:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// تنفيذ الوظيفة
createAdminUser()
  .then(() => {
    console.log('اكتملت العملية بنجاح');
    process.exit(0);
  })
  .catch((error) => {
    console.error('فشلت العملية:', error);
    process.exit(1);
  }); 