/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  }
};

module.exports = nextConfig; 