-- التحقق من وجود جدول social_media_settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'social_media_settings'
    ) THEN
        -- إنشاء جدول إعدادات وسائل التواصل الاجتماعي
        CREATE TABLE IF NOT EXISTS public.social_media_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          platform VARCHAR(50) NOT NULL,
          url TEXT NOT NULL,
          is_active BOOLEAN DEFAULT true,
          icon_name VARCHAR(50) NOT NULL,
          display_order INT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- إضافة بيانات افتراضية
        INSERT INTO public.social_media_settings (platform, url, is_active, icon_name, display_order)
        VALUES 
          ('GitHub', 'https://github.com/nuqta-ai', true, 'FiGithub', 1),
          ('Twitter', 'https://twitter.com/nuqta_ai', true, 'FiTwitter', 2),
          ('LinkedIn', 'https://linkedin.com/company/nuqtai', true, 'FiLinkedin', 3),
          ('Instagram', 'https://instagram.com/nuqtai', true, 'FiInstagram', 4),
          ('Email', 'mailto:info@nuqtai.com', true, 'FiMail', 5);

        -- إنشاء دالة لتحديث حقل updated_at تلقائيًا
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- إنشاء trigger لتحديث حقل updated_at تلقائيًا
        DROP TRIGGER IF EXISTS update_social_media_settings_updated_at ON public.social_media_settings;
        CREATE TRIGGER update_social_media_settings_updated_at
        BEFORE UPDATE ON public.social_media_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

        -- إنشاء RLS (Row Level Security) للجدول
        ALTER TABLE public.social_media_settings ENABLE ROW LEVEL SECURITY;

        -- إنشاء سياسة للقراءة (يمكن لأي شخص قراءة البيانات)
        CREATE POLICY "Allow public read access" ON public.social_media_settings
          FOR SELECT USING (true);

        -- إنشاء سياسة للكتابة (فقط المسؤولون يمكنهم التعديل)
        CREATE POLICY "Allow admin write access" ON public.social_media_settings
          FOR ALL USING (auth.uid() IN (
            SELECT id FROM public.profiles WHERE role = 'admin'
          ));
          
        RAISE NOTICE 'تم إنشاء جدول social_media_settings بنجاح';
    ELSE
        -- التحقق من وجود بيانات في الجدول
        IF NOT EXISTS (SELECT 1 FROM public.social_media_settings LIMIT 1) THEN
            -- إضافة بيانات افتراضية إذا كان الجدول فارغًا
            INSERT INTO public.social_media_settings (platform, url, is_active, icon_name, display_order)
            VALUES 
              ('GitHub', 'https://github.com/nuqta-ai', true, 'FiGithub', 1),
              ('Twitter', 'https://twitter.com/nuqta_ai', true, 'FiTwitter', 2),
              ('LinkedIn', 'https://linkedin.com/company/nuqtai', true, 'FiLinkedin', 3),
              ('Instagram', 'https://instagram.com/nuqtai', true, 'FiInstagram', 4),
              ('Email', 'mailto:info@nuqtai.com', true, 'FiMail', 5);
              
            RAISE NOTICE 'تم إضافة بيانات افتراضية إلى جدول social_media_settings';
        ELSE
            RAISE NOTICE 'جدول social_media_settings موجود بالفعل ويحتوي على بيانات';
        END IF;
        
        -- التأكد من وجود سياسات RLS
        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'social_media_settings' 
            AND policyname = 'Allow public read access'
        ) THEN
            -- إنشاء سياسة للقراءة (يمكن لأي شخص قراءة البيانات)
            CREATE POLICY "Allow public read access" ON public.social_media_settings
              FOR SELECT USING (true);
              
            RAISE NOTICE 'تم إنشاء سياسة القراءة العامة';
        END IF;
        
        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'social_media_settings' 
            AND policyname = 'Allow admin write access'
        ) THEN
            -- إنشاء سياسة للكتابة (فقط المسؤولون يمكنهم التعديل)
            CREATE POLICY "Allow admin write access" ON public.social_media_settings
              FOR ALL USING (auth.uid() IN (
                SELECT id FROM public.profiles WHERE role = 'admin'
              ));
              
            RAISE NOTICE 'تم إنشاء سياسة الكتابة للمسؤولين';
        END IF;
    END IF;
END
$$; 