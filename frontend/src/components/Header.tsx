import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl font-bold">TxtForge</h1>
        <p className="mt-2">Ваш надёжный инструмент для работы с текстом</p>
      </div>
    </header>
  );
};

export default Header; 