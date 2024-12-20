import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Section } from '../../hooks/useSections';
import { transliterate } from '../../utils/helpers';
import API_URL from '../../config/api';
import { useRouter } from 'next/navigation';

const AdminSections: React.FC = () => {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState({
    title: '',
  });

  // Загрузка разделов
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
  }, []);

  // Обработка изменения формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Добавление/редактирование раздела
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Токен отсутствует');
      router.push('/admin');
      return;
    }

    const slug = transliterate(formData.title);

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (editingSection) {
        await axios.put(
          `${API_URL}/sections/${editingSection._id}`, 
          { ...formData, slug },
          { headers }
        );
      } else {
        await axios.post(
          `${API_URL}/sections`, 
          { ...formData, slug },
          { headers }
        );
      }
      
      fetchSections();
      setIsModalOpen(false);
      setEditingSection(null);
      setFormData({ title: '' });
    } catch (error: any) {
      console.error('Ошибка при сохранении раздела:', error.response?.data || error);
      if (error.response?.status === 403) {
        alert('Сессия истекла. Пожалуйста, войдите снова.');
        router.push('/admin');
      }
    }
  };

  // Удаление раздела
  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот раздел?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/sections/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSections();
    } catch (error) {
      console.error('Ошибка при удалении раздела:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Управление разделами</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Добавить раздел
          </button>
        </div>

        {/* Список разделов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <div key={section._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">{section.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingSection(section);
                      setFormData({
                        title: section.title,
                      });
                      setIsModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(section._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">Slug: {section.slug}</p>
              <p className="text-sm text-gray-600">Анекдотов: {section.jokesCount}</p>
            </div>
          ))}
        </div>

        {/* Модальное окно добавления/редактирования */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingSection ? 'Редактировать раздел' : 'Добавить раздел'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название раздела
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingSection(null);
                      setFormData({ title: '' });
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    {editingSection ? 'Сохранить' : 'Добавить'}
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

export default AdminSections; 