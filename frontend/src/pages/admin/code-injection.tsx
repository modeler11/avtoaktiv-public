import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { FaSave, FaInfoCircle } from 'react-icons/fa';
import API_URL from '../../config/api';
import { useRouter } from 'next/navigation';

interface CodeInjection {
  headerCode: string;
}

const AdminCodeInjection: React.FC = () => {
  const router = useRouter();
  const [headerCode, setHeaderCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Загрузка текущего кода
  const fetchCurrentCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/code-injection`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHeaderCode(response.data.headerCode || '');
    } catch (error) {
      console.error('Ошибка при загрузке кода:', error);
      setSaveStatus({
        type: 'error',
        message: 'Не удалось загрузить текущий код'
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchCurrentCode();
  }, []);

  // Сохранение кода
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/code-injection`, 
        { headerCode: headerCode.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSaveStatus({
        type: 'success',
        message: 'Код успешно сохранен'
      });
    } catch (error) {
      console.error('Ошибка при сохранении кода:', error);
      setSaveStatus({
        type: 'error',
        message: 'Не удалось сохранить код'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Вставка кода в header</h1>
          
          {saveStatus && (
            <div className={`mb-4 p-3 rounded ${
              saveStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {saveStatus.message}
            </div>
          )}

          <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg flex items-start">
            <FaInfoCircle className="mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium mb-2">Рекомендации по вставке кода:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Вы можете вставить любой валидный HTML-код</li>
                <li>Для JavaScript используйте теги &lt;script&gt;</li>
                <li>Для метрик и счетчиков копируйте код целиком</li>
                <li>Изменения вступят в силу после перезагрузки страницы</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML/JavaScript код для вставки в header
              </label>
              <textarea
                value={headerCode}
                onChange={(e) => setHeaderCode(e.target.value)}
                className="w-full h-64 p-3 border rounded font-mono text-sm"
                placeholder="<!-- Примеры кода -->

<!-- Meta теги -->
<meta name='yandex-verification' content='XXXXX' />
<meta name='google-site-verification' content='XXXXX' />

<!-- JavaScript -->
<script>
  console.log('Test header injection');
</script>

<!-- Метрики -->
<script async src='https://www.googletagmanager.com/gtag/js?id=UA-XXXXX-Y'></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'UA-XXXXX-Y');
</script>"
              />
              <p className="mt-2 text-sm text-gray-500">
                Этот код будет вставлен в секцию &lt;head&gt; на всех страницах сайта без изменений.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className={`flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaSave className="mr-2" />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCodeInjection; 