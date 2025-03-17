# كيفية إصلاح النشر على Vercel

## المشكلة

تواجه مشكلة في بناء المشروع على Vercel بسبب وجود ملفات في مجلد `app/admin` تتطلب مكتبات غير موجودة في المشروع. رسالة الخطأ الأساسية:

```
Module not found: Can't resolve 'react-hot-toast'
Module not found: Can't resolve 'react-quill'
Module not found: Can't resolve 'react-quill/dist/quill.snow.css'
```

## الحل الفوري

### 1. حذف مجلد admin بالكامل

مجلد `app/admin` بحاجة إلى حذف كامل من المستودع، وليس فقط إضافة ملف داخله للإشارة إلى ضرورة حذفه.

### 2. خيارات الحذف

#### الخيار 1: عبر واجهة GitHub

1. انتقل إلى: https://github.com/alanqoudif/new-nuqta-saas/tree/main/app/admin
2. احذف **جميع** الملفات والمجلدات الموجودة هناك واحداً تلو الآخر:
   - انقر على كل ملف
   - اضغط على أيقونة سلة المهملات
   - أكد الحذف بكتابة رسالة الالتزام

#### الخيار 2: من خلال نسخة محلية

```bash
git clone https://github.com/alanqoudif/new-nuqta-saas.git
cd new-nuqta-saas
git rm -rf app/admin
git commit -m "حذف مجلد admin لإصلاح مشكلة البناء"
git push origin main
```

#### الخيار 3: عبر إنشاء مستودع جديد

إذا لم تنجح الطرق السابقة:

1. إنشاء مستودع جديد على GitHub
2. نسخ جميع الملفات من المستودع الحالي إلى المستودع الجديد، **باستثناء** مجلد `app/admin`
3. تحديث إعدادات النشر في Vercel لاستخدام المستودع الجديد

## إعادة البناء في Vercel

بعد حذف المجلد:

1. اذهب إلى مشروعك في Vercel
2. انتقل إلى قسم "Deployments"
3. اضغط على "Redeploy" لآخر إصدار، أو اضغط على "Deploy" لإنشاء نشر جديد

## النشر اليدوي 

إذا استمرت المشكلة، يمكنك استخدام خيار النشر اليدوي:

1. قم ببناء المشروع محلياً:
   ```bash
   npm install
   npm run build
   ```
2. إذا نجح البناء المحلي، انسخ مجلد `.next` المُنتَج وارفعه إلى Vercel يدوياً باستخدام:
   ```bash
   # بعد تثبيت Vercel CLI
   vercel --prod
   ```