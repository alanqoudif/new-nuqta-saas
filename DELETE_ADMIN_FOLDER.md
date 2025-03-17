# تعليمات حذف مجلد الإدارة

## المشكلة
فشل بناء المشروع في Vercel بسبب وجود مجلد `app/admin` الذي يحاول استيراد مكتبات غير موجودة في المشروع مثل:
- react-hot-toast
- react-quill

## الحل المطلوب
يجب حذف مجلد `app/admin` بالكامل من المستودع.

## خطوات الحذف عبر GitHub مباشرة

1. افتح المستودع على GitHub: https://github.com/alanqoudif/new-nuqta-saas
2. انتقل إلى مجلد `app`
3. انقر على مجلد `admin`
4. لحذف المجلد بالكامل في GitHub:
   - انقر على أول ملف في المجلد
   - اضغط على أيقونة سلة المهملات (Delete this file)
   - اكتب رسالة الالتزام مثل "حذف ملفات الإدارة لإصلاح مشكلة البناء"
   - كرر هذه العملية مع كل ملف داخل المجلد `admin` وكل مجلداته الفرعية

## خطوات الحذف عبر أوامر Git

إذا كنت تفضل استخدام سطر الأوامر:

```bash
git clone https://github.com/alanqoudif/new-nuqta-saas.git
cd new-nuqta-saas
git rm -rf app/admin
git commit -m "حذف مجلد الإدارة لإصلاح مشكلة البناء"
git push origin main
```

## بعد الحذف

بعد حذف مجلد `admin` بالكامل، سيعمل بناء المشروع في Vercel بنجاح.