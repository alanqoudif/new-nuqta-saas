/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // تجاهل مجلد الإدارة أثناء البناء
  webpack: (config, { isServer }) => {
    // تجاهل مسارات معينة عند البناء
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/app/admin/**']
    };
    
    return config;
  },
  
  // استبعاد مسارات معينة من البناء
  async rewrites() {
    return {
      fallback: [
        // تحويل أي طلب لمجلد الإدارة إلى صفحة 404
        {
          source: '/admin/:path*',
          destination: '/404',
        }
      ]
    };
  },
  
  // تخطي التحقق من الأخطاء لملفات معينة
  onDemandEntries: {
    // منع التحقق من صحة هذه المسارات
    ignore: [/app\/admin\/.*/]
  }
};

module.exports = nextConfig;