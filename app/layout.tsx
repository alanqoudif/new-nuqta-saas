import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'نقطة للذكاء الاصطناعي - حلول متقدمة لتطوير أعمالك',
  description: 'نقدم خدمات ذكاء اصطناعي متقدمة ومتكاملة تساعدك على تحسين أعمالك وزيادة إنتاجيتك',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}