import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import Link from 'next/link';
import { HandThumbUpIcon, HandThumbDownIcon, EyeIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface JokeProps {
  text: string;
  jokeId?: string;
  initialLikes?: number;
  initialDislikes?: number;
  views?: number;
  createdAt?: string;
  showControls?: boolean;
  isPreview?: boolean;
  userVote?: 'like' | 'dislike' | null;
}

const StaticContent: React.FC<{
  text: string;
  isPreview: boolean;
  views: number;
  formattedDate?: string;
}> = ({ text, isPreview, views, formattedDate }) => {
  const truncateText = (html: string, maxLength: number) => {
    if (html.length <= maxLength) return html;
    let text = html.replace(/<dialog>/g, '<div class="dialog">').replace(/<\/dialog>/g, '</div>');
    let inTag = false;
    let visibleLength = 0;
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '<') inTag = true;
      result += char;
      if (!inTag) {
        visibleLength++;
        if (visibleLength >= maxLength) {
          const nextCloseTag = text.indexOf('</div>', i);
          if (nextCloseTag !== -1) {
            result += text.slice(i + 1, nextCloseTag + 6);
          }
          result += '...';
          break;
        }
      }
      if (char === '>') inTag = false;
    }
    return result;
  };

  return (
    <>
      <div 
        className={`
          text-gray-800 prose max-w-none
          [&_.dialog]:pl-4 [&_.dialog]:border-l-4 [&_.dialog]:border-gray-200 [&_.dialog]:my-2
          ${isPreview ? 'text-sm' : 'text-lg'}
        `}
        dangerouslySetInnerHTML={{ 
          __html: isPreview 
            ? truncateText(text, 150)
            : text.replace(/<dialog>/g, '<div class="dialog">').replace(/<\/dialog>/g, '</div>')
        }}
      />
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
          </div>
          {!isPreview && formattedDate && (
            <div className="flex items-center gap-1">
            </div>
          )}
        </div>
        {isPreview && (
          <button className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            Читать далее
          </button>
        )}
      </div>
    </>
  );
};

const InteractiveContent: React.FC<{
  likes: number;
  dislikes: number;
  userInteraction: 'like' | 'dislike' | null;
  onInteraction: (type: 'like' | 'dislike') => void;
  views: number;
  formattedDate?: string;
}> = ({ likes, dislikes, userInteraction, onInteraction, views, formattedDate }) => {
  return (
    <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button 
          className={`flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 px-3 sm:px-4 rounded transition-colors ${
            userInteraction === 'like'
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onInteraction('like')}
          disabled={userInteraction === 'dislike'}
        >
          <HandThumbUpIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>{likes}</span>
        </button>
        <button 
          className={`flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 px-3 sm:px-4 rounded transition-colors ${
            userInteraction === 'dislike'
              ? 'bg-red-500 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onInteraction('dislike')}
          disabled={userInteraction === 'like'}
        >
          <HandThumbDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>{dislikes}</span>
        </button>
      </div>
      <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>{views}</span>
        </div>
        {formattedDate && (
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Joke: React.FC<JokeProps> = ({ 
  text, 
  jokeId, 
  initialLikes = 0, 
  initialDislikes = 0,
  views = 0,
  createdAt,
  showControls = true,
  isPreview = true,
  userVote: initialUserVote = null
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userInteraction, setUserInteraction] = useState<'like' | 'dislike' | null>(initialUserVote);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (jokeId && !isPreview && mounted) {
      axios.get(`${API_URL}/jokes/${jokeId}`, { withCredentials: true })
        .then((response) => {
          const joke = response.data;
          setLikes(joke.likes);
          setDislikes(joke.dislikes);
          setUserInteraction(joke.userVote);
        })
        .catch((error) => console.error('Ошибка при получении состояния:', error));
    }
  }, [jokeId, isPreview, mounted]);

  useEffect(() => {
    if (jokeId && !isPreview && mounted) {
      axios.post(`${API_URL}/jokes/${jokeId}/view`, {}, { withCredentials: true })
        .catch((error) => console.error('Ошибка при регистрации просмотра:', error));
    }
  }, [jokeId, isPreview, mounted]);

  const handleInteraction = async (type: 'like' | 'dislike') => {
    if (!jokeId || isPreview || !mounted) return;

    try {
      const response = await axios.post(
        `${API_URL}/jokes/${jokeId}/like`, 
        { type }, 
        { withCredentials: true }
      );
      const joke = response.data;
      
      setLikes(joke.likes);
      setDislikes(joke.dislikes);

      if (type === userInteraction) {
        setUserInteraction(null);
      } else {
        setUserInteraction(type);
      }
    } catch (error) {
      console.error('Ошибка при обработке взаимодействия:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formattedDate = formatDate(createdAt);
  const wrapperClassName = isPreview 
    ? "bg-white p-3 sm:p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200"
    : "bg-white p-4 sm:p-6 rounded-lg shadow-lg";

  const content = (
    <>
      <StaticContent 
        text={text}
        isPreview={isPreview}
        views={views}
        formattedDate={formattedDate}
      />
      {mounted && showControls && (
        <InteractiveContent 
          likes={likes}
          dislikes={dislikes}
          userInteraction={userInteraction}
          onInteraction={handleInteraction}
          views={views}
          formattedDate={formattedDate}
        />
      )}
    </>
  );

  if (isPreview && jokeId) {
    return (
      <Link href={`/joke/${jokeId}`} className="block">
        <div className={wrapperClassName}>
          {content}
        </div>
      </Link>
    );
  }

  return (
    <div className={wrapperClassName}>
      {content}
    </div>
  );
};

export default Joke; 