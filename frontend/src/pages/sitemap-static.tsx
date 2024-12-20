import { GetServerSideProps } from 'next';
import axios from 'axios';

const BASE_URL = 'https://example.com';

const StaticSitemap = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://example.com/api';
    
    // Получаем все разделы
    const sectionsResponse = await axios.get(`${apiUrl}/sections`);
    const sections = Array.isArray(sectionsResponse.data) ? sectionsResponse.data : 
                    (sectionsResponse.data.sections || sectionsResponse.data.data || []);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Статические страницы -->
      <url>
        <loc>${BASE_URL}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${BASE_URL}/jokes</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
      <url>
        <loc>${BASE_URL}/about</loc>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>
      <url>
        <loc>${BASE_URL}/contact</loc>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>

      <!-- Разделы -->
      ${sections.map((section: any) => `
        <url>
          <loc>${BASE_URL}/section/${section.slug}</loc>
          <lastmod>${new Date(section.updatedAt).toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    res.write(sitemap);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error('Error generating static sitemap:', error);
    if (res) {
      res.statusCode = 500;
      res.end();
    }
    return { props: {} };
  }
};

export default StaticSitemap; 