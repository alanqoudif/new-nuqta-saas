-- التأكد من وجود جدول طلبات الذكاء الاصطناعي
CREATE TABLE IF NOT EXISTS public.privateai_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL,
    number_of_users INTEGER,
    domain_of_use TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- تفعيل أمان مستوى الصف (RLS)
ALTER TABLE public.privateai_requests ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان لجدول privateai_requests
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'privateai_requests' AND policyname = 'المستخدمون يمكنهم رؤية طلباتهم الخاصة فقط') THEN
        CREATE POLICY "المستخدمون يمكنهم رؤية طلباتهم الخاصة فقط"
            ON public.privateai_requests
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'privateai_requests' AND policyname = 'المستخدمون يمكنهم إنشاء طلباتهم الخاصة فقط') THEN
        CREATE POLICY "المستخدمون يمكنهم إنشاء طلباتهم الخاصة فقط"
            ON public.privateai_requests
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'privateai_requests' AND policyname = 'المستخدمون يمكنهم تحديث طلباتهم الخاصة فقط') THEN
        CREATE POLICY "المستخدمون يمكنهم تحديث طلباتهم الخاصة فقط"
            ON public.privateai_requests
            FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'privateai_requests' AND policyname = 'المشرفون يمكنهم رؤية جميع الطلبات') THEN
        CREATE POLICY "المشرفون يمكنهم رؤية جميع الطلبات"
            ON public.privateai_requests
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'privateai_requests' AND policyname = 'المشرفون يمكنهم تحديث جميع الطلبات') THEN
        CREATE POLICY "المشرفون يمكنهم تحديث جميع الطلبات"
            ON public.privateai_requests
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                )
            );
    END IF;
END $$;

-- حذف جدول المقالات إذا كان موجوداً
DROP TABLE IF EXISTS public.blog_posts;

-- إنشاء جدول المقالات
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    cover_image TEXT,
    category TEXT
);

-- تفعيل أمان مستوى الصف (RLS)
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان لجدول blog_posts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'المقالات المنشورة متاحة للجميع') THEN
        CREATE POLICY "المقالات المنشورة متاحة للجميع"
            ON public.blog_posts
            FOR SELECT
            USING (published = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'المشرفون يمكنهم رؤية جميع المقالات') THEN
        CREATE POLICY "المشرفون يمكنهم رؤية جميع المقالات"
            ON public.blog_posts
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'المشرفون فقط يمكنهم إنشاء المقالات') THEN
        CREATE POLICY "المشرفون فقط يمكنهم إنشاء المقالات"
            ON public.blog_posts
            FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'المشرفون فقط يمكنهم تحديث المقالات') THEN
        CREATE POLICY "المشرفون فقط يمكنهم تحديث المقالات"
            ON public.blog_posts
            FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'المشرفون فقط يمكنهم حذف المقالات') THEN
        CREATE POLICY "المشرفون فقط يمكنهم حذف المقالات"
            ON public.blog_posts
            FOR DELETE
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                )
            );
    END IF;
END $$; 