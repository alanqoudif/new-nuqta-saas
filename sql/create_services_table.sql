-- إنشاء جدول الخدمات
-- يجب تنفيذ هذا الملف في SQL Editor في Supabase

-- التحقق من وجود الجدول
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'services'
    ) THEN
        -- إنشاء جدول الخدمات
        CREATE TABLE services (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            icon_name TEXT NOT NULL, -- اسم الأيقونة من مكتبة react-icons/fi
            color TEXT NOT NULL, -- لون الخدمة (مثل primary, secondary, accent, indigo, etc.)
            url TEXT NOT NULL, -- الرابط الذي سيتم توجيه المستخدم إليه
            is_active BOOLEAN DEFAULT true, -- هل الخدمة نشطة أم لا
            is_coming_soon BOOLEAN DEFAULT false, -- هل الخدمة قادمة قريباً
            display_order INTEGER NOT NULL, -- ترتيب العرض
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- إضافة تعليق للجدول
        COMMENT ON TABLE services IS 'جدول لتخزين الخدمات المتاحة في المنصة';

        -- إنشاء سياسة RLS للقراءة (للجميع)
        CREATE POLICY "يمكن للجميع قراءة الخدمات النشطة"
        ON services FOR SELECT
        USING (is_active = true);

        -- إنشاء سياسة RLS للإدارة (للمسؤولين فقط)
        CREATE POLICY "المسؤولون يمكنهم إدارة الخدمات"
        ON services FOR ALL
        USING (
            EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
        );

        -- تفعيل أمان مستوى الصف
        ALTER TABLE services ENABLE ROW LEVEL SECURITY;

        -- إنشاء مؤشر على حالة النشاط
        CREATE INDEX services_is_active_idx ON services (is_active);

        -- إنشاء مؤشر على ترتيب العرض
        CREATE INDEX services_display_order_idx ON services (display_order);

        -- إضافة بعض الخدمات الافتراضية
        INSERT INTO services (name, description, icon_name, color, url, is_active, is_coming_soon, display_order)
        VALUES 
        ('الذكاء الاصطناعي الخاص', 'قم بتنفيذ نماذج الذكاء الاصطناعي المتقدمة في بنيتك التحتية الخاصة مع خصوصية كاملة والتحكم في البيانات.', 'FiServer', 'primary', '/dashboard/private-ai-request', true, false, 1),
        ('منشئ المواقع الذكي', 'أنشئ مواقع ويب مذهلة في دقائق باستخدام الذكاء الاصطناعي.', 'FiCode', 'secondary', '/dashboard/site-builder', true, false, 2),
        ('روبوت واتساب', 'دمج روبوتات ذكية في واتساب لخدمة العملاء الآلية.', 'FiMessageSquare', 'indigo', 'https://whats.nuqtai.com/', true, false, 3);

        -- إنشاء دالة لتحديث حقل updated_at
        CREATE OR REPLACE FUNCTION update_services_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- إنشاء محفز لتحديث حقل updated_at
        CREATE TRIGGER update_services_updated_at
        BEFORE UPDATE ON services
        FOR EACH ROW
        EXECUTE FUNCTION update_services_updated_at();

        RAISE NOTICE 'تم إنشاء جدول services بنجاح';
    END IF;
END $$; 