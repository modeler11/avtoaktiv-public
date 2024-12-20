import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

interface SEO {
  title: string;
  description: string;
  keywords: string;
  h1: string;
}

export interface Section {
  _id: string;
  title: string;
  slug: string;
  icon: string;
  jokesCount: number;
  seo: SEO;
}

export const useSections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get<Section[]>(`${API_URL}/sections`);
        setSections(response.data);
      } catch (err) {
        setError('Ошибка при загрузке разделов');
        console.error('Error fetching sections:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSections();
  }, []);

  return { sections, isLoading, error };
}; 