import { ContentGenerator } from '../models/ContentGenerator';
import { Section } from '../models/Section';
import { AISettings } from '../models/AISettings';
import { Joke } from '../models/Joke';
import axios from 'axios';
import mongoose from 'mongoose';

export class ContentGeneratorService {
  private static instance: ContentGeneratorService;
  private isRunning: boolean = false;

  private constructor() {
    this.startGeneratorLoop();
  }

  public static getInstance(): ContentGeneratorService {
    if (!ContentGeneratorService.instance) {
      ContentGeneratorService.instance = new ContentGeneratorService();
    }
    return ContentGeneratorService.instance;
  }

  private async startGeneratorLoop() {
    if (this.isRunning) return;
    this.isRunning = true;

    while (this.isRunning) {
      try {
        // Получаем все активные генераторы
        const generators = await ContentGenerator.find({ isActive: true });

        for (const generator of generators) {
          try {
            // Проверяем, нужно ли запускать генератор
            const now = new Date();
            const lastRun = generator.lastRun ? new Date(generator.lastRun) : new Date(0);
            const timeSinceLastRun = now.getTime() - lastRun.getTime();
            const intervalMs = generator.intervalMinutes * 60 * 1000;

            if (timeSinceLastRun >= intervalMs) {
              await this.runGenerator(generator);
            }
          } catch (error) {
            console.error(`Ошибка при обработке генератора ${generator._id}:`, error);
          }
        }

        // Ждем 1 минуту перед следующей проверкой
        await new Promise(resolve => setTimeout(resolve, 60000));
      } catch (error) {
        console.error('Ошибка в цикле генератора:', error);
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
    }
  }

  private async runGenerator(generator: any) {
    try {
      console.log('Запуск генератора:', {
        generatorId: generator._id,
        sectionId: generator.sectionId,
        modelId: generator.modelId
      });

      // Получаем информацию о разделе
      const section = await Section.findById(generator.sectionId);
      if (!section) {
        throw new Error('Раздел не найден');
      }

      // П��лучаем настройки AI и проверяем модель
      const settings = await AISettings.findOne();
      if (!settings?.openrouterApiKey) {
        throw new Error('API ключ не настроен');
      }

      console.log('Настройки AI:', {
        hasApiKey: !!settings.openrouterApiKey,
        modelsCount: settings.models.length,
        models: settings.models.map(m => ({
          id: m._id?.toString() || 'unknown',
          modelId: m.modelId,
          name: m.name
        }))
      });

      // Ищем модель по modelId
      const model = settings.models.find(m => m.modelId === generator.modelId);
      if (!model) {
        throw new Error(`Модель не найдена. Искомый ID: ${generator.modelId}`);
      }

      console.log('Найдена модель:', {
        modelId: model.modelId,
        name: model.name
      });

      // Отправляем запрос к API OpenRouter
      const timestamp = Date.now();
      const promptWithSeed = generator.prompt.replace('{{currentTimestamp}}', timestamp.toString());
      
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model.modelId,
          messages: [
            {
              role: 'user',
              content: promptWithSeed
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${settings.openrouterApiKey}`,
            'HTTP-Referer': 'https://example.com',
            'Content-Type': 'application/json'
          }
        }
      );

      // Получаем сгенерированный текст
      const generatedContent = response.data.choices[0]?.message?.content;

      if (generatedContent) {
        try {
          // Парсим JSON ответ
          const parsedContent = JSON.parse(generatedContent);
          
          // Создаем новую запись в разделе
          const joke = new Joke({
            sectionId: section._id,
            text: parsedContent.content,
            isPublished: true,
            isGenerated: true,
            seo: {
              title: parsedContent.seo.title,
              description: parsedContent.seo.description,
              keywords: parsedContent.seo.keywords,
              tags: parsedContent.seo.tags
            }
          });
          await joke.save();

          // Обновляем время последнего запуска
          await ContentGenerator.findByIdAndUpdate(generator._id, {
            lastRun: new Date(),
            updatedAt: new Date()
          });

          console.log('Сгенерирован и сохранен новый контент:', {
            sectionId: section._id,
            sectionTitle: section.title,
            contentLength: parsedContent.content.length,
            jokeId: joke._id,
            seoTitle: parsedContent.seo.title
          });
        } catch (parseError) {
          console.error('Ошибка при парсинге JSON ответа:', parseError);
          throw new Error('Некорректный формат ответа от AI');
        }
      }
    } catch (error) {
      console.error('Ошибка при генерации контента:', error);
      throw error;
    }
  }

  public stop() {
    this.isRunning = false;
  }
}

// Запускаем сервис при импорте модуля
ContentGeneratorService.getInstance(); 