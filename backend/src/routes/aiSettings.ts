import express, { Request, Response } from 'express';
import { AISettings } from '../models/AISettings';
import { authenticateToken } from '../middleware/auth';
import axios from 'axios';

const router = express.Router();

// Получить текущие настройки
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const settings = await AISettings.findOne();
    console.log('GET /ai-settings - Найденные настройки:', {
      exists: !!settings,
      id: settings?._id,
      hasApiKey: !!settings?.openrouterApiKey,
      apiKeyLength: settings?.openrouterApiKey?.length,
      modelsCount: settings?.models?.length || 0
    });

    if (!settings) {
      console.log('GET /ai-settings - Настройки не найдены');
      return res.json({ 
        message: 'Настройки не найдены',
        models: [],
        openrouterApiKey: null 
      });
    }

    const response = {
      ...settings.toObject(),
      openrouterApiKey: settings.openrouterApiKey 
        ? `...${settings.openrouterApiKey.slice(-4)}`
        : null,
      models: settings.models || []
    };

    console.log('GET /ai-settings - Отправляем ответ:', {
      hasKey: !!response.openrouterApiKey,
      maskedKey: response.openrouterApiKey,
      modelsCount: response.models.length
    });
    
    res.json(response);
  } catch (error) {
    console.error('GET /ai-settings - Ошибка:', error);
    res.status(500).json({ message: 'Ошибка при получении настроек' });
  }
});

// Обновить API ключ
router.put('/api-key', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    console.log('PUT /ai-settings/api-key - Получен запрос на обновление API ключа');
    
    if (!apiKey) {
      console.error('PUT /ai-settings/api-key - API ключ отсутствует в запросе');
      return res.status(400).json({ message: 'API ключ обязателен' });
    }
    
    let settings = await AISettings.findOne();
    console.log('PUT /ai-settings/api-key - Текущие настройки:', {
      exists: !!settings,
      id: settings?._id
    });
    
    if (settings) {
      settings.openrouterApiKey = apiKey;
      settings.updatedAt = new Date();
    } else {
      settings = new AISettings({
        openrouterApiKey: apiKey,
        models: []
      });
      console.log('PUT /ai-settings/api-key - Создаем новые настройки');
    }
    
    const savedSettings = await settings.save();
    console.log('PUT /ai-settings/api-key - Настройки сохранены:', {
      id: savedSettings._id,
      hasKey: !!savedSettings.openrouterApiKey,
      keyLength: savedSettings.openrouterApiKey?.length
    });
    
    const maskedKey = `...${apiKey.slice(-4)}`;
    res.json({ 
      message: 'API ключ успешно обновлен',
      maskedKey: maskedKey,
      success: true
    });
  } catch (error) {
    console.error('PUT /ai-settings/api-key - Ошибка:', error);
    res.status(500).json({ 
      message: 'Ошибка при обновлении API ключа',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    });
  }
});

// Добавить модель
router.post('/models', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, modelId } = req.body;
    let settings = await AISettings.findOne();
    
    if (!settings) {
      return res.status(404).json({ message: 'Настройки не найдены' });
    }
    
    settings.models.push({ name, modelId });
    settings.updatedAt = new Date();
    await settings.save();
    
    res.status(201).json(settings.models[settings.models.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при добавлении модели' });
  }
});

// Удалить модель
router.delete('/models/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const settings = await AISettings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Настройки не найдены' });
    }
    
    settings.models = settings.models.filter(
      (model) => model._id && model._id.toString() !== req.params.id
    ) as any;
    
    settings.updatedAt = new Date();
    await settings.save();
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении модели' });
  }
});

// Тестировать модель
router.post('/models/test', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { modelId, prompt } = req.body;
    console.log('POST /ai-settings/models/test - Запрос на тест модели:', {
      modelId,
      promptLength: prompt?.length
    });

    const settings = await AISettings.findOne();
    if (!settings?.openrouterApiKey) {
      console.error('POST /ai-settings/models/test - API ключ не найден');
      return res.status(400).json({ 
        success: false,
        message: 'API ключ не настроен' 
      });
    }

    // Проверяем существование модели
    const modelExists = settings.models.some(model => model.modelId === modelId);
    if (!modelExists) {
      console.error('POST /ai-settings/models/test - Модель не найдена:', modelId);
      return res.status(404).json({
        success: false,
        message: 'Модель не найдена'
      });
    }

    console.log('POST /ai-settings/models/test - Отправка запроса к OpenRouter');
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelId,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${settings.openrouterApiKey}`,
          'HTTP-Referer': 'https://example.com',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('POST /ai-settings/models/test - Успешный ответ от OpenRouter:', {
      status: response.status,
      modelUsed: response.data?.model,
      responseLength: response.data?.choices?.[0]?.message?.content?.length
    });

    res.json({
      success: true,
      response: response.data?.choices?.[0]?.message?.content || 'Нет ответа'
    });
  } catch (error: any) {
    console.error('POST /ai-settings/models/test - Ошибка:', {
      message: error.message,
      response: error.response?.data
    });

    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.error || error.message || 'Ошибка при тестировании модели'
    });
  }
});

export default router; 