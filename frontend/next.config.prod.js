/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap-index'
      },
      {
        source: '/sitemap-static.xml',
        destination: '/sitemap-static'
      },
      {
        source: '/sitemap-jokes-:page.xml',
        destination: '/sitemap-jokes/:page'
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  }
};

module.exports = nextConfig; 