import axios from 'axios';
import { AISettings } from '../models/AISettings';

export class OpenRouterService {
  private static instance: OpenRouterService;
  private apiKey: string | null = null;

  private constructor() {}

  static getInstance(): OpenRouterService {
    if (!OpenRouterService.instance) {
      OpenRouterService.instance = new OpenRouterService();
    }
    return OpenRouterService.instance;
  }

  async initialize() {
    const settings = await AISettings.findOne();
    if (settings?.openrouterApiKey) {
      this.apiKey = settings.openrouterApiKey;
    } else {
      this.apiKey = null;
    }
  }

  async setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await axios.get('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async getAvailableModels() {
    if (!this.apiKey) {
      throw new Error('API ключ не установлен');
    }

    try {
      const response = await axios.get('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Ошибка при получении списка моделей');
    }
  }
} 