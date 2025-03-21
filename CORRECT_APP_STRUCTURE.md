# الهيكل الصحيح لمجلد التطبيق

هذه هي الصفحات التي يجب أن تبقى في مجلد `app`:

```
app/
├── about/
│   └── page.tsx       # صفحة من نحن
├── contact/
│   └── page.tsx       # صفحة اتصل بنا
├── services/
│   └── page.tsx       # صفحة الخدمات
├── favicon.ico
├── globals.css
├── layout.tsx         # التخطيط الرئيسي للتطبيق
└── page.tsx           # الصفحة الرئيسية
```

## ما يجب حذفه بالكامل:

```
app/admin/           # حذف هذا المجلد بالكامل مع كل محتوياته
```

## لحذف المجلد بشكل صحيح:

1. يمكنك استخدام واجهة GitHub لحذف جميع الملفات في مجلد `app/admin` ومجلداته الفرعية.
2. أو استخدام Git مباشرة:
   ```bash
   git rm -rf app/admin
   git commit -m "إزالة مجلد admin"
   git push
   ```

## التأكد من الحذف:

بعد عملية الحذف، يجب أن يختفي مجلد `admin` تمامًا من هيكل المشروع وليس فقط إضافة ملف داخله يشير إلى ضرورة حذفه.