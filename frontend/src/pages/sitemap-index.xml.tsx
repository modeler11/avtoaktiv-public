import { GetServerSideProps } from 'next';
import axios from 'axios';

const BASE_URL = 'https://example.com';
const JOKES_PER_SITEMAP = 1000; // Лимит URL на один sitemap файл

const SitemapIndex = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://example.com/api';
    
    // Получаем анекдоты с лимитом 1 для получения общего количества
    const response = await axios.get(`${apiUrl}/jokes`, {
      params: {
        limit: 1,
        page: 1
      }
    });
    
    // Получаем общее количество из заголовка или из ответа
    const totalJokes = response.data.total || response.headers['x-total-count'] || 0;
    
    // Вычисляем количество необходимых sitemap файлов
    const numberOfSitemaps = Math.ceil(totalJokes / JOKES_PER_SITEMAP) || 1;

    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Основной sitemap для статических страниц и разделов -->
      <sitemap>
        <loc>${BASE_URL}/sitemap-static.xml</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </sitemap>

      <!-- Sitemap файлы для анекдотов -->
      ${Array.from({ length: numberOfSitemaps }, (_, i) => `
        <sitemap>
          <loc>${BASE_URL}/sitemap-jokes-${i + 1}.xml</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
        </sitemap>
      `).join('')}
    </sitemapindex>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    res.write(sitemapIndex);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    // В случае ошибки возвращаем индекс с одним sitemap файлом
    const basicSitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap>
        <loc>${BASE_URL}/sitemap-static.xml</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </sitemap>
      <sitemap>
        <loc>${BASE_URL}/sitemap-jokes-1.xml</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </sitemap>
    </sitemapindex>`;
    
    if (res) {
      res.setHeader('Content-Type', 'application/xml');
      res.write(basicSitemapIndex);
      res.end();
    }
    return { props: {} };
  }
};

export default SitemapIndex; 