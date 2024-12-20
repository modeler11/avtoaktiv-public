import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { FaKey, FaPlus, FaTrash, FaPlay } from 'react-icons/fa';
import API_URL from '../../config/api';
import { useRouter } from 'next/navigation';

interface AIModel {
  _id: string;
  name: string;
  modelId: string;
  isActive: boolean;
}

const AdminAISettings: React.FC = () => {
  const router = useRouter();
  const [models, setModels] = useState<AIModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    modelId: ''
  });
  const [currentApiKey, setCurrentApiKey] = useState<string>('');
  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ai-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Получены настройки:', response.data);
      
      setModels(response.data.models || []);
      setCurrentApiKey(response.data.openrouterApiKey || '');
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchSettings();
  }, []);

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      if (!apiKey.trim()) {
        console.error('API ключ не может быть пустым');
        return;
      }

      const response = await axios.put(
        `${API_URL}/ai-settings/api-key`,
        { apiKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Ответ сервера при сохранении ключа:', response.data);
      
      if (response.data.success) {
        // Сразу после сохранения запрашиваем обновленные настройки
        const settingsResponse = await axios.get(`${API_URL}/ai-settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Полученные настройки:', settingsResponse.data);
        
        // Обновляем состояние
        setModels(settingsResponse.data.models || []);
        setCurrentApiKey(settingsResponse.data.openrouterApiKey || '');
        setApiKey(''); // Очищаем поле ввода
        console.log('API ключ успешно обновлен и загружен');
      }
    } catch (error) {
      console.error('Ошибка при обновлении API ключа:', error);
      if (axios.isAxiosError(error)) {
        console.error('Детали ошибки:', error.response?.data);
      }
    }
  };

  const handleModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      await axios.post(
        `${API_URL}/ai-settings/models`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSettings();
      setIsModalOpen(false);
      setFormData({ name: '', modelId: '' });
    } catch (error) {
      console.error('Ошибка при добавлении модели:', error);
      alert('Ошибка при добавлении модели');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту модель?')) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/ai-settings/models/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSettings();
    } catch (error) {
      console.error('Ошибка при удалении модели:', error);
    }
  };

  const handleTest = async (modelId: string) => {
    setTestError(null);
    setTestResult(null);
    setIsTestLoading(true);
    const token = localStorage.getItem('token');

    try {
      console.log('Отправка запроса на тестирование модели:', {
        modelId,
        promptLength: testPrompt.length
      });

      const response = await axios.post(
        `${API_URL}/ai-settings/models/test`,
        { 
          modelId, 
          prompt: testPrompt 
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Получен ответ от сервера:', {
        success: response.data.success,
        responseLength: response.data.response?.length,
        status: response.status
      });

      if (response.data.success) {
        setTestResult(response.data.response);
      } else {
        throw new Error(response.data.message || 'Неизвестная ошибка');
      }
    } catch (error: any) {
      console.error('Ошибка при тестировании:', error);
      setTestError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Ошибка при тестировании модели'
      );
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Форма API ключа */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">API Ключ OpenRouter</h2>
          {currentApiKey ? (
            <div className="mb-4 text-sm text-gray-600 bg-gray-100 p-2 rounded">
              Текущий ключ: {currentApiKey}
            </div>
          ) : (
            <div className="mb-4 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              API ключ не установлен
            </div>
          )}
          <form onSubmit={handleApiKeySubmit} className="flex gap-4">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Введите API ключ"
              className="flex-1 p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              <FaKey className="mr-2" />
              Сохранить ключ
            </button>
          </form>
        </div>

        {/* Управление моделями */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Модели AI</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <FaPlus className="inline mr-2" />
              Добавить модель
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {models.map((model) => (
              <div key={model._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold">{model.name}</h3>
                    <p className="text-sm text-gray-600">{model.modelId}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTestingModel(model._id === testingModel ? null : model._id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaPlay />
                    </button>
                    <button
                      onClick={() => handleDelete(model._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {testingModel === model._id && (
                  <div className="mt-4 border-t pt-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Тестовый промпт
                      </label>
                      <textarea
                        value={testPrompt}
                        onChange={(e) => setTestPrompt(e.target.value)}
                        className="w-full p-2 border rounded min-h-[100px]"
                        placeholder="Введите текст для теста..."
                      />
                    </div>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => handleTest(model.modelId)}
                        disabled={isTestLoading || !testPrompt.trim()}
                        className={`px-4 py-2 rounded ${
                          isTestLoading || !testPrompt.trim()
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {isTestLoading ? 'Тестирование...' : 'Протестировать'}
                      </button>
                    </div>
                    {testError && (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {testError}
                      </div>
                    )}
                    {testResult && (
                      <div className="p-3 bg-gray-100 rounded">
                        <h4 className="font-medium mb-2">Ответ модели:</h4>
                        <p className="whitespace-pre-wrap">{testResult}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Модальное окно добавления модели */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Добавить модель AI</h2>
              <form onSubmit={handleModelSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название модели
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID модели
                  </label>
                  <input
                    type="text"
                    value={formData.modelId}
                    onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Добавить
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

export default AdminAISettings; 