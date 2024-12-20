import React, { Suspense } from 'react';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Section } from '../../hooks/useSections';
import API_URL from '../../config/api';
import { useRouter } from 'next/router';

const DynamicJoke = dynamic(() => import('../../components/Joke'), {
  ssr: false,
  loading: () => (
    <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
});

interface JokeType {
  _id: string;
  text: string;
  views: number;
  likes: number;
  dislikes: number;
  createdAt: string;
  userVote?: 'like' | 'dislike' | null;
}

interface PaginationType {
  total: number;
  pages: number;
  currentPage: number;
  hasMore: boolean;
}

interface JokeSectionProps {
  section: Section;
  jokes: JokeType[];
  pagination: PaginationType;
  headerCode: string;
}

const JokeSection: React.FC<JokeSectionProps> = ({ section, jokes, pagination, headerCode }) => {
  const router = useRouter();
  const canonicalUrl = `https://example.com/jokes/${section.slug}`;

  const handlePageChange = (page: number) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page }
    }, undefined, { scroll: true });
  };

  if (!jokes.length) {
    return (
      <section className="container mx-auto mt-8 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">{section.title}</h2>
        <p className="text-center text-gray-600">В этом разделе пока нет анекдотов</p>
      </section>
    );
  }

  return (
    <>
      <Head>
        <title>{section.seo.title}</title>
        <meta name="description" content={section.seo.description} />
        <meta name="keywords" content={section.seo.keywords} />
        
        {/* Open Graph */}
        <meta property="og:title" content={section.seo.title} />
        <meta property="og:description" content={section.seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={section.seo.title} />
        <meta name="twitter:description" content={section.seo.description} />

        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Schema.org разметка */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": section.seo.title,
            "description": section.seo.description,
            "keywords": section.seo.keywords,
            "url": canonicalUrl,
            "numberOfItems": pagination.total,
            "dateModified": new Date().toISOString()
          })}
        </script>

        {headerCode}
      </Head>

      <section className="container mx-auto mt-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">{section.seo.h1}</h1>
        
        {/* Сетка анекдотов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jokes.map((joke) => (
            <div key={joke._id} className="flex justify-center">
              <div className="w-full max-w-md">
                <DynamicJoke 
                  text={joke.text}
                  jokeId={joke._id}
                  initialLikes={joke.likes}
                  initialDislikes={joke.dislikes}
                  views={joke.views}
                  createdAt={joke.createdAt}
                  userVote={joke.userVote}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Пагинация */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`px-4 py-2 rounded ${
                pagination.currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Назад
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .map((page) => {
                  const showPage = page === 1 || 
                                  page === pagination.pages || 
                                  Math.abs(page - pagination.currentPage) <= 1;

                  if (!showPage) {
                    if (page === 2 || page === pagination.pages - 1) {
                      return <span key={`ellipsis-${page}`} className="px-2">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded ${
                        page === pagination.currentPage
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasMore}
              className={`px-4 py-2 rounded ${
                !pagination.hasMore
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Вперёд
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  try {
    const { slug } = params as { slug: string };
    const page = query.page || '1';
    
    const sectionsResponse = await axios.get(`${API_URL}/sections`);
    const sections = sectionsResponse.data;
    const section = sections.find((s: Section) => s.slug === slug);
    
    if (!section) {
      return { notFound: true };
    }

    const jokesResponse = await axios.get(
      `${API_URL}/jokes?sectionId=${section._id}&page=${page}&limit=9`
    );
    
    const headerResponse = await axios.get(`${API_URL}/code-injection/public`);
    const headerCode = headerResponse.data.headerCode || '';
    
    return {
      props: {
        section,
        jokes: jokesResponse.data.jokes,
        pagination: jokesResponse.data.pagination,
        headerCode
      },
    };
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    return { notFound: true };
  }
};

export default JokeSection; 