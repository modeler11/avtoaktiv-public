import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import TopJokes from '../components/TopJokes';
import axios from 'axios';
import API_URL from '../config/api';

interface HomeProps {
  headerCode: string;
}

const Home: NextPage<HomeProps> = ({ headerCode }) => {
  return (
    <>
      <Head>
        <title>TxtForge - Лучшие анекдоты и шутки | Юмористический портал</title>
        <meta name="description" content="TxtForge - огромная коллекция смешных анекдотов и шуток на русском языке. Ежедневное обновление контента, самый свежий юмор и отборные шутки." />
        <meta name="keywords" content="анекдоты, шутки, юмор, смешные истории, развлечения, txtforge, тхтфордж" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://txtforge.ru/" />
        <meta property="og:title" content="TxtForge - Лучшие анекдоты и шутки" />
        <meta property="og:description" content="Огромная коллекция смешных анекдотов и шуток на русском языке. Ежедневное обновление контента." />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://txtforge.ru/" />
        <meta property="twitter:title" content="TxtForge - Лучшие анекдоты и шутки" />
        <meta property="twitter:description" content="Огромная коллекция смешных анекдотов и шуток на русском языке. Ежедневное обновление контента." />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Russian" />
        <link rel="canonical" href="https://txtforge.ru/" />

        {headerCode}
      </Head>
      <TopJokes />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const headerResponse = await axios.get(`${API_URL}/code-injection/public`);
    const headerCode = headerResponse.data.headerCode || '';

    return {
      props: {
        headerCode
      }
    };
  } catch (error) {
    return {
      props: {
        headerCode: ''
      }
    };
  }
};

export default Home; 