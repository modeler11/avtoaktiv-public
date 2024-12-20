import React from 'react';
import { NextPage } from 'next';

const About: NextPage = () => {
  return (
    <section className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">О нас</h2>
      <p className="text-gray-800">
        TxtForge — это ваш надёжный инструмент для работы с текстом. Мы предлагаем вам лучшие анекдоты и многое другое.
      </p>
    </section>
  );
};

export default About; 