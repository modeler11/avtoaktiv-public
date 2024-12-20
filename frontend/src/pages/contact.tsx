import React from 'react';
import { NextPage } from 'next';

const Contact: NextPage = () => {
  return (
    <section className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Контакты</h2>
      <p className="text-gray-800">
        Вы можете связаться с нами по электронной почте: <a href="mailto:info@example.com" className="text-blue-500">info@example.com</a>
      </p>
    </section>
  );
};

export default Contact; 