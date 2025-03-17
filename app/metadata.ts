import { Metadata } from 'next';

// البيانات الوصفية الأساسية للموقع
export const siteConfig = {
  name: 'نقطة للذكاء الاصطناعي',
  description: 'تقدم نقطة للذكاء الاصطناعي خدمات متقدمة في مجال الذكاء الاصطناعي، بما في ذلك الذكاء الاصطناعي الخاص، وبناء مواقع الويب باستخدام الذكاء الاصطناعي، وروبوتات المحادثة لتطبيق واتساب.',
  url: 'https://nuqta.ai',
  ogImage: '/nuqtalogo.webp',
  links: {
    twitter: 'https://twitter.com/nuqtaai',
    github: 'https://github.com/nuqtaai',
  },
  keywords: [
    'الذكاء الاصطناعي',
    'نقطة',
    'الذكاء الاصطناعي الخاص',
    'بناء مواقع الويب',
    'روبوتات المحادثة',
    'واتساب',
    'خدمات الذكاء الاصطناعي',
    'تطوير الأعمال',
    'تقنية',
    'برمجة',
  ],
};

// دالة لإنشاء البيانات الوصفية لكل صفحة
export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  icons = [
    { url: '/nuqtalogo.webp', type: 'image/webp' },
    { url: '/favicon.ico' }
  ],
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: { url: string; type?: string }[];
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 800,
          height: 600,
          alt: title,
        },
      ],
      locale: 'ar_SA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    icons,
    metadataBase: new URL(siteConfig.url),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
} 