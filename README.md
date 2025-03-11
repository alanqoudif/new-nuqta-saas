# نقطة للذكاء الاصطناعي - دليل المستخدم والمطور

## مقدمة

هذا المشروع هو منصة لإدارة خدمات الذكاء الاصطناعي، بما في ذلك طلبات الذكاء الاصطناعي الخاص وإدارة المستخدمين.

## متطلبات النظام

- Node.js (الإصدار 16 أو أحدث)
- قاعدة بيانات Supabase
- متصفح حديث

## تثبيت وتشغيل المشروع

1. قم بتثبيت الاعتمادات:
   ```bash
   npm install
   ```

2. قم بتشغيل المشروع في وضع التطوير:
   ```bash
   npm run dev
   ```

3. قم بفتح المتصفح على العنوان:
   ```
   http://localhost:3000
   ```

## إعداد قاعدة البيانات

يجب تنفيذ ملفات SQL التالية في SQL Editor في Supabase بالترتيب:

1. `sql/fix_privateai_requests_table.sql` - لإصلاح جدول طلبات الذكاء الاصطناعي الخاص
2. `sql/create_fix_schema_function.sql` - لإنشاء دالة إصلاح هيكل الجدول
3. `sql/create_get_all_users_function.sql` - لإنشاء دالة جلب جميع المستخدمين
4. `sql/create_privateai_request_function.sql` - لإنشاء دالة إنشاء طلب ذكاء اصطناعي خاص
5. `sql/create_update_user_profile_function.sql` - لإنشاء دالة تحديث ملف المستخدم

### نصائح لتنفيذ ملفات SQL

- قم بتنفيذ كل ملف على حدة في SQL Editor
- تأكد من تنفيذ الملفات بالترتيب المذكور أعلاه
- إذا واجهت خطأ في تنفيذ أحد الملفات، قم بتقسيمه إلى أجزاء أصغر وتنفيذها واحداً تلو الآخر

## الميزات الرئيسية

1. **لوحة التحكم**: عرض معلومات المستخدم والخدمات المتاحة
2. **طلب الذكاء الاصطناعي الخاص**: تقديم طلب للحصول على خدمة الذكاء الاصطناعي الخاص
3. **إعدادات المستخدم**: تحديث معلومات الملف الشخصي وتغيير كلمة المرور
4. **لوحة الإدارة**: إدارة المستخدمين وطلبات الذكاء الاصطناعي الخاص (للمسؤولين فقط)

## حل المشاكل الشائعة

### مشكلة: خطأ في هيكل جدول privateai_requests

إذا ظهر خطأ مثل "Could not find the 'domain_of_use' column of 'privateai_requests' in the schema cache"، قم بتنفيذ ملف `sql/fix_privateai_requests_table.sql` في SQL Editor في Supabase.

### مشكلة: عدم ظهور المستخدمين في لوحة الإدارة

قم بتنفيذ ملف `sql/create_get_all_users_function.sql` في SQL Editor في Supabase.

### مشكلة: عدم حفظ التغييرات في إعدادات المستخدم

قم بتنفيذ ملف `sql/create_update_user_profile_function.sql` في SQL Editor في Supabase.

### مشكلة: خطأ في تنفيذ ملفات SQL

إذا واجهت خطأ مثل "syntax error at or near BEGIN"، قم بتقسيم الملف إلى أجزاء أصغر وتنفيذها واحداً تلو الآخر.

## الأمان

- تأكد من تعيين الصلاحيات المناسبة في Supabase
- استخدم دائماً وظائف RPC مع SECURITY DEFINER للعمليات الحساسة
- تحقق من صلاحيات المستخدم قبل السماح بالوصول إلى لوحة الإدارة

## المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. قم بعمل fork للمشروع
2. قم بإنشاء فرع جديد للميزة التي تريد إضافتها
3. قم بإرسال طلب سحب (Pull Request)

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.
