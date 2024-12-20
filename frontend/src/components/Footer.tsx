import React from 'react';
import Link from 'next/link';
import { FaVk, FaTelegram, FaGithub } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const copyrightYears = currentYear === 2024 ? '2024' : `2024-${currentYear}`;

  return (
    <footer className="bg-gray-800 text-white py-8 px-4 md:ml-64">
      <div className="container mx-auto max-w-[calc(100%-2rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">О проекте</h3>
            <p className="text-gray-300 text-sm">
              TxtForge - это платформа для любителей юмора, где собраны лучшие анекдоты и шутки.
            </p>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white text-sm">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/jokes" className="text-gray-300 hover:text-white text-sm">
                  Анекдоты
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold mb-4">Мы в соцсетях</h3>
            <div className="flex justify-center md:justify-end space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <FaVk className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaTelegram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaGithub className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>© {copyrightYears} TxtForge. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 