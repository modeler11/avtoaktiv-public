import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { FaPlay, FaPause, FaClock, FaTrash, FaEdit } from 'react-icons/fa';
import API_URL from '../../config/api';
import { useRouter } from 'next/navigation';

interface ContentGenerator {
  _id: string;
  sectionId: string;
  modelId: string;
  prompt: string;
  intervalMinutes: number;
  isActive: boolean;
  lastRun?: Date;
}

interface Section {
  _id: string;
  title: string;
}

interface AIModel {
  _id: string;
  name: string;
  modelId: string;
}

const ContentGenerator: React.FC = () => {
  const router = useRouter();
  const [generators, setGenerators] = useState<ContentGenerator[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenerator, setEditingGenerator] = useState<ContentGenerator | null>(null);
  const [selectedGenerators, setSelectedGenerators] = useState<string[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchIntervalMinutes, setBatchIntervalMinutes] = useState<number>(60);
  const [formData, setFormData] = useState({
    sectionId: '',
    modelId: '',
    prompt: '',
    intervalMinutes: 60
  });

  const fetchGenerators = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/content-generator`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGenerators(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке генераторов:', error);
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

  const fetchModels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ai-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModels(response.data.models || []);
    } catch (error) {
      console.error('Ошибка при загрузке моделей:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchGenerators();
    fetchSections();
    fetchModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      console.log('Отправка данных генератора:', {
        formData,
        selectedModel: models.find(m => m.modelId === formData.modelId)
      });

      if (editingGenerator) {
        await axios.put(
          `${API_URL}/content-generator/${editingGenerator._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/content-generator`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchGenerators();
      setIsModalOpen(false);
      setEditingGenerator(null);
      setFormData({
        sectionId: '',
        modelId: '',
        prompt: '',
        intervalMinutes: 60
      });
    } catch (error) {
      console.error('Ошибка при сохранении генератора:', error);
      alert('Ошибка при сохранении генератора');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот генератор?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/content-generator/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGenerators();
    } catch (error) {
      console.error('Ошибка при удалении генератора:', error);
    }
  };

  const toggleGenerator = async (id: string, isActive: boolean) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${API_URL}/content-generator/${id}/toggle`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchGenerators();
    } catch (error) {
      console.error('Ошибка при изменении статуса генератора:', error);
    }
  };

  const handleBatchIntervalUpdate = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${API_URL}/content-generator/batch/interval`,
        {
          ids: selectedGenerators,
          intervalMinutes: batchIntervalMinutes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsBatchModalOpen(false);
      setSelectedGenerators([]);
      fetchGenerators();
    } catch (error) {
      console.error('Ошибка при массовом обновлении интервалов:', error);
    }
  };

  const handleBatchStatusUpdate = async (isActive: boolean) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${API_URL}/content-generator/batch/status`,
        {
          ids: selectedGenerators,
          isActive
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedGenerators([]);
      fetchGenerators();
    } catch (error) {
      console.error('Ошибка при массовом обновлении статусов:', error);
    }
  };

  const toggleGeneratorSelection = (id: string) => {
    setSelectedGenerators(prev => 
      prev.includes(id) 
        ? prev.filter(genId => genId !== id)
        : [...prev, id]
    );
  };

  const toggleAllGenerators = () => {
    if (selectedGenerators.length === generators.length) {
      setSelectedGenerators([]);
    } else {
      setSelectedGenerators(generators.map(g => g._id));
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Автонаполнение контента</h1>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedGenerators.length === generators.length && generators.length > 0}
                onChange={toggleAllGenerators}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">
                Выбрать все ({selectedGenerators.length}/{generators.length})
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {selectedGenerators.length > 0 && (
              <>
                <button
                  onClick={() => setIsBatchModalOpen(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Изменить интервал ({selectedGenerators.length})
                </button>
                <button
                  onClick={() => handleBatchStatusUpdate(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                  Запустить все
                </button>
                <button
                  onClick={() => handleBatchStatusUpdate(false)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                >
                  Остановить все
                </button>
              </>
            )}
            <button
              onClick={() => {
                setEditingGenerator(null);
                setFormData({
                  sectionId: '',
                  modelId: '',
                  prompt: '',
                  intervalMinutes: 60
                });
                setIsModalOpen(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FaPlay className="mr-2" /> Добавить генератор
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {generators.map((generator) => (
            <div key={generator._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedGenerators.includes(generator._id)}
                    onChange={() => toggleGeneratorSelection(generator._id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <h3 className="font-bold">
                      {sections.find(s => s._id === generator.sectionId)?.title || 'Раздел не найден'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Модель: {models.find(m => m._id === generator.modelId)?.name || 'Модель не найдена'}
                      <span className="text-xs text-gray-400 ml-1">({generator.modelId})</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <FaClock className="inline mr-1" />
                      Интервал: {generator.intervalMinutes} минут
                    </p>
                    {generator.lastRun && (
                      <p className="text-sm text-gray-600">
                        Последний запуск: {new Date(generator.lastRun).toLocaleString()}
                      </p>
                    )}
                    <div className="mt-2">
                      <p className="text-sm font-medium">Промпт:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{generator.prompt}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingGenerator(generator);
                      setFormData({
                        sectionId: generator.sectionId,
                        modelId: generator.modelId,
                        prompt: generator.prompt,
                        intervalMinutes: generator.intervalMinutes
                      });
                      setIsModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => toggleGenerator(generator._id, !generator.isActive)}
                    className={`${
                      generator.isActive ? 'text-green-500 hover:text-green-700' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {generator.isActive ? <FaPause /> : <FaPlay />}
                  </button>
                  <button
                    onClick={() => handleDelete(generator._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingGenerator ? 'Редактировать генератор' : 'Добавить генератор'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Раздел
                  </label>
                  <select
                    value={formData.sectionId}
                    onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Выберите раздел</option>
                    {sections.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Модель AI
                  </label>
                  <select
                    value={formData.modelId}
                    onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Выберите модель</option>
                    {models.map((model) => (
                      <option key={model._id} value={model.modelId}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Интервал (в минутах)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.intervalMinutes}
                    onChange={(e) => setFormData({ ...formData, intervalMinutes: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Промпт для генерации
                  </label>
                  <div className="mb-2 text-sm text-gray-600">
                    Промпт должен возвращать JSON в следующем формате:
                    <pre className="bg-gray-50 p-2 rounded mt-1 text-xs overflow-x-auto">
{`{
  "content": "HTML-текст анекдота здесь",
  "seo": {
    "title": "Уникальный заголовок для страницы 50-60 символов",
    "description": "Привлекательное описание анекдота 150-160 символов для поисковой выдачи",
    "keywords": "список, ключевых, слов, через, запятую, 8-10, штук",
    "tags": ["тег1", "тег2", "тег3", "тег4"]
  }
}`}
                    </pre>
                  </div>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    className="w-full p-2 border rounded"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingGenerator(null);
                      setFormData({
                        sectionId: '',
                        modelId: '',
                        prompt: '',
                        intervalMinutes: 60
                      });
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {editingGenerator ? 'Сохранить' : 'Добавить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isBatchModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                Изменить интервал для {selectedGenerators.length} генераторов
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Интервал (в минутах)
                </label>
                <input
                  type="number"
                  min="1"
                  value={batchIntervalMinutes}
                  onChange={(e) => setBatchIntervalMinutes(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Отмена
                </button>
                <button
                  onClick={handleBatchIntervalUpdate}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContentGenerator; 