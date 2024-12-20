import React from 'react';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import Joke from '../../components/Joke';
import API_URL from '../../config/api';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface JokeType {
  _id: string;
  text: string;
  views: number;
  likes: number;
  dislikes: number;
  createdAt: string;
  sectionId: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
    tags: string[];
  };
}

interface JokePageProps {
  joke: JokeType;
  relatedJokes: JokeType[];
  headerCode: string;
}

const JokePage: React.FC<JokePageProps> = ({ joke, relatedJokes, headerCode }) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{joke.seo.title} - TxtForge</title>
        <meta name="description" content={joke.seo.description} />
        <meta name="keywords" content={joke.seo.keywords} />
        
        {/* Open Graph */}
        <meta property="og:title" content={joke.seo.title} />
        <meta property="og:description" content={joke.seo.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://example.com/joke/${joke._id}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={joke.seo.title} />
        <meta name="twitter:description" content={joke.seo.description} />

        {/* Schema.org разметка */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": joke.seo.title,
            "description": joke.seo.description,
            "keywords": joke.seo.keywords,
            "datePublished": joke.createdAt,
            "dateModified": joke.createdAt,
            "interactionStatistic": [
              {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/LikeAction",
                "userInteractionCount": joke.likes
              },
              {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/ViewAction",
                "userInteractionCount": joke.views
              }
            ]
          })}
        </script>

        {headerCode}
      </Head>
      <div className="container mx-auto mt-4 sm:mt-8 px-3 sm:px-4">
        {/* Кнопка "Назад" */}
        <button
          onClick={() => router.back()}
          className="mb-4 sm:mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Вернуться назад
        </button>

        {/* Основной анекдот */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{joke.seo.title}</h1>
            <Joke 
              text={joke.text}
              jokeId={joke._id}
              initialLikes={joke.likes}
              initialDislikes={joke.dislikes}
              views={joke.views}
              createdAt={joke.createdAt}
              isPreview={false}
            />
          </div>
        </div>

        {/* Теги */}
        {joke.seo.tags.length > 0 && (
          <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
            <div className="flex flex-wrap gap-2">
              {joke.seo.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs sm:text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Заголовок для случайных анекдотов */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold">Похожие анекдоты:</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Может быть, вам понравятся и эти анекдоты</p>
        </div>

        {/* Случайные анекдоты из того же раздела */}
        {relatedJokes.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 gap-4 sm:gap-6">
              {relatedJokes.map((relatedJoke) => (
                <div key={relatedJoke._id} className="flex justify-center">
                  <div className="w-full max-w-3xl">
                    <Joke 
                      text={relatedJoke.text}
                      jokeId={relatedJoke._id}
                      initialLikes={relatedJoke.likes}
                      initialDislikes={relatedJoke.dislikes}
                      views={relatedJoke.views}
                      createdAt={relatedJoke.createdAt}
                      isPreview={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const { id } = params as { id: string };
    
    // Получаем основной анекдот
    const jokeResponse = await axios.get(`${API_URL}/jokes/${id}`);
    const joke = jokeResponse.data;

    if (!joke) {
      return { notFound: true };
    }

    console.log('Основной анекдот:', {
      id: joke._id,
      sectionId: joke.sectionId,
      hasText: !!joke.text
    });

    // Получаем случайные анекдоты из того же раздела
    const relatedJokesResponse = await axios.get(
      `${API_URL}/jokes/random?sectionId=${joke.sectionId}&exclude=${joke._id}&limit=5`
    );
    
    console.log('Получены случайные анекдоты:', {
      count: relatedJokesResponse.data?.length || 0,
      sectionId: joke.sectionId
    });

    // Получаем код для вставки в header
    const headerResponse = await axios.get(`${API_URL}/code-injection/public`);
    const headerCode = headerResponse.data.headerCode || '';

    return {
      props: {
        joke,
        relatedJokes: relatedJokesResponse.data || [],
        headerCode
      },
    };
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    return { notFound: true };
  }
};

export default JokePage; 