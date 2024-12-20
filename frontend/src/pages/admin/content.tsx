import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Joke from '../../components/Joke';
import axios from 'axios';
import { FaEdit, FaTrash, FaEye, FaThumbsUp } from 'react-icons/fa';
import API_URL from '../../config/api';
import { useRouter } from 'next/navigation';

interface Joke {
  _id: string;
  text: string;
  sectionId: string;
  isPublished: boolean;
  views: number;
  likes: number;
  dislikes: number;
  isGenerated: boolean;
  createdAt: string;
}

interface Section {
  _id: string;
  title: string;
}

interface JokesResponse {
  jokes: Joke[];
  pagination: {
    total: number;
    current: number;
    page: number;
  };
}

const ContentManager: React.FC = () => {
  const router = useRouter();
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJoke, setEditingJoke] = useState<Joke | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    text: '',
    isPublished: true
  });

  const fetchJokes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get<JokesResponse>(`${API_URL}/jokes${selectedSection ? `?sectionId=${selectedSection}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setJokes(response.data.jokes || []);
    } catch (error) {
      console.error('Ошибка при загрузке статей:', error);
      setJokes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await axios.get(`${API_URL}/sections`);
      setSections(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке разделов:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchSections();
    fetchJokes();
  }, [selectedSection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      if (editingJoke) {
        await axios.put(
          `${API_URL}/jokes/${editingJoke._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchJokes();
      setIsModalOpen(false);
      setEditingJoke(null);
      setFormData({ text: '', isPublished: true });
    } catch (error) {
      console.error('Ошибка при сохранении статьи:', error);
      alert('Ошибка при сохранении статьи');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту статью?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/jokes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJokes();
    } catch (error) {
      console.error('Ошибка при удалении статьи:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Управление статьями</h1>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Все разделы</option>
            {sections.map((section) => (
              <option key={section._id} value={section._id}>
                {section.title}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-4">Загрузка...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {Array.isArray(jokes) && jokes.length > 0 ? (
              jokes.map((joke: Joke) => (
                <div key={joke._id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">
                          {sections.find(s => s._id === joke.sectionId)?.title || 'Раздел не найден'}
                        </span>
                        {joke.isGenerated && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            AI
                          </span>
                        )}
                        {!joke.isPublished && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Черновик
                          </span>
                        )}
                      </div>
                      <Joke 
                        text={joke.text} 
                        jokeId={joke._id}
                        initialLikes={joke.likes}
                        initialDislikes={joke.dislikes}
                      />
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaEye className="w-4 h-4" /> {joke.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaThumbsUp className="w-4 h-4" /> {joke.likes}
                        </span>
                        <span>
                          {new Date(joke.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingJoke(joke);
                          setFormData({
                            text: joke.text,
                            isPublished: joke.isPublished
                          });
                          setIsModalOpen(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(joke._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">Нет доступных статей</div>
            )}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Редактировать статью</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Текст
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="w-full p-2 border rounded min-h-[200px] mb-4 font-mono"
                    required
                  />
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Предпросмот
                    </label>
                    <div className="border rounded p-4">
                      <Joke text={formData.text} />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Опубликовано</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingJoke(null);
                      setFormData({ text: '', isPublished: true });
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContentManager; 