/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/bolt.diy',
        destination: '/bolt.diy/index.html',
      },
      {
        source: '/bolt.diy/:path*',
        destination: '/bolt.diy/:path*',
      },
      {
        source: '/bolt.diy/assets/:path*',
        destination: '/bolt.diy/assets/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/bolt.diy/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 