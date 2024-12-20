import { GetServerSideProps } from 'next';
import axios from 'axios';

const BASE_URL = 'https://example.com';
const JOKES_PER_SITEMAP = 1000;

const JokesSitemap = () => null;

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  try {
    const page = parseInt(params?.page as string) || 1;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://example.com/api';
    
    // Получаем анекдоты с пагинацией
    const response = await axios.get(`${apiUrl}/jokes`, {
      params: {
        limit: JOKES_PER_SITEMAP,
        page: page,
        sort: '-createdAt'
      }
    });

    const jokes = Array.isArray(response.data) ? response.data : 
                 (response.data.jokes || response.data.data || []);

    // Если нет анекдотов, возвращаем 404
    if (!jokes.length) {
      if (res) {
        res.statusCode = 404;
        res.end();
      }
      return { props: {} };
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${jokes.map((joke: any) => `
        <url>
          <loc>${BASE_URL}/jokes/${joke._id}</loc>
          <lastmod>${new Date(joke.updatedAt || joke.createdAt).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
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
    console.error('Error generating jokes sitemap:', error);
    if (res) {
      res.statusCode = 500;
      res.end();
    }
    return { props: {} };
  }
};

export default JokesSitemap; 