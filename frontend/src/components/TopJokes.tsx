import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import API_URL from '../config/api';
import { Tab as HeadlessTab } from '@headlessui/react';
import { FaFire, FaEye, FaThumbsDown, FaClock, FaThumbsUp, FaChartBar } from 'react-icons/fa';

const DynamicJoke = dynamic(() => import('./Joke'), {
  ssr: false,
  loading: () => (
    <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
});

interface Joke {
  _id: string;
  text: string;
  views: number;
  likes: number;
  dislikes: number;
  createdAt: string;
}

const TopJokes: React.FC = () => {
  const [topLikes, setTopLikes] = useState<Joke[]>([]);
  const [topViews, setTopViews] = useState<Joke[]>([]);
  const [topDislikes, setTopDislikes] = useState<Joke[]>([]);
  const [latestJokes, setLatestJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [likesRes, viewsRes, dislikesRes, latestRes] = await Promise.all([
          axios.get(`${API_URL}/jokes/top/likes`),
          axios.get(`${API_URL}/jokes/top/views`),
          axios.get(`${API_URL}/jokes/top/dislikes`),
          axios.get(`${API_URL}/jokes/latest`)
        ]);

        setTopLikes(likesRes.data);
        setTopViews(viewsRes.data);
        setTopDislikes(dislikesRes.data);
        setLatestJokes(latestRes.data);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = [
    { 
      name: 'Популярные', 
      icon: <FaFire className="h-5 w-5 mr-2" />, 
      data: topLikes 
    },
    { 
      name: 'По просмотрам', 
      icon: <FaEye className="h-5 w-5 mr-2" />, 
      data: topViews 
    },
    { 
      name: 'Спорные', 
      icon: <FaThumbsDown className="h-5 w-5 mr-2" />, 
      data: topDislikes 
    },
    { 
      name: 'Новые', 
      icon: <FaClock className="h-5 w-5 mr-2" />, 
      data: latestJokes 
    }
  ];

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Приветственный баннер */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-xl p-4 md:p-8 mb-6 md:mb-12 text-white">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Добро пожаловать в TxtForge!</h1>
        <p className="text-base md:text-lg opacity-90 mb-4 md:mb-6">
          Самая большая коллекция анекдотов и шуток. Ежедневные обновления, только лучший юмор.
        </p>
        <div className="flex flex-wrap gap-2 md:gap-4">
          <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-3 py-1 md:px-4 md:py-2 text-sm md:text-base">
            <FaThumbsUp className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            <span>1000+ анекдотов</span>
          </div>
          <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-3 py-1 md:px-4 md:py-2 text-sm md:text-base">
            <FaChartBar className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            <span>10+ категорий</span>
          </div>
          <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-3 py-1 md:px-4 md:py-2 text-sm md:text-base">
            <FaFire className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            <span>Ежедневные обновления</span>
          </div>
        </div>
      </div>

      {/* Табы с разными категориями */}
      <HeadlessTab.Group>
        <HeadlessTab.List className="flex flex-wrap md:flex-nowrap gap-1 md:space-x-2 rounded-xl bg-blue-900/20 p-1 mb-4 md:mb-8">
          {categories.map((category) => (
            <HeadlessTab
              key={category.name}
              className={({ selected }) =>
                `flex-1 min-w-[120px] rounded-lg py-2 px-1 text-xs md:text-sm font-medium leading-5 ${
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              <div className="flex items-center justify-center">
                {category.icon}
                <span className="truncate">{category.name}</span>
              </div>
            </HeadlessTab>
          ))}
        </HeadlessTab.List>
        <HeadlessTab.Panels>
          {categories.map((category, idx) => (
            <HeadlessTab.Panel
              key={idx}
              className="rounded-xl bg-white p-2 md:p-3"
            >
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg shadow-md animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {category.data.map((joke) => (
                    <div key={joke._id} className="flex justify-center">
                      <div className="w-full max-w-md">
                        <DynamicJoke
                          text={joke.text}
                          jokeId={joke._id}
                          initialLikes={joke.likes}
                          initialDislikes={joke.dislikes}
                          views={joke.views}
                          createdAt={joke.createdAt}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </HeadlessTab.Panel>
          ))}
        </HeadlessTab.Panels>
      </HeadlessTab.Group>

      {/* Дополнительная информация */}
      <div className="mt-8 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">О проекте</h3>
          <p className="text-sm md:text-base text-gray-600">
            TxtForge - это платформа для любителей юмора. Мы собираем лучшие анекдоты и шутки, 
            чтобы поднять вам настроение каждый день.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">Особенности</h3>
          <ul className="text-sm md:text-base text-gray-600 space-y-1 md:space-y-2">
            <li>• Ежедневные обновления контента</li>
            <li>• Удобная система оценок</li>
            <li>• Различные категории юмора</li>
            <li>• Возможность делиться с друзьями</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">Присоединяйтесь</h3>
          <p className="text-sm md:text-base text-gray-600">
            Станьте частью нашего сообщества. Оценивайте анекдоты, делитесь любимыми шутками 
            и следите за обновлениями.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopJokes; 