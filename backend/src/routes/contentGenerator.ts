import express, { Request, Response } from 'express';
import { ContentGenerator } from '../models/ContentGenerator';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Получить все генераторы
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const generators = await ContentGenerator.find().sort('-createdAt');
    res.json(generators);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении генераторов' });
  }
});

// Создать новый генератор
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { sectionId, modelId, prompt, intervalMinutes } = req.body;
    const generator = new ContentGenerator({
      sectionId,
      modelId,
      prompt,
      intervalMinutes,
      isActive: false
    });
    await generator.save();
    res.status(201).json(generator);
  } catch (error) {
    console.error('Error creating generator:', error);
    res.status(400).json({ message: 'Ошибка при создании генератора' });
  }
});

// Обновить генератор
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { sectionId, modelId, prompt, intervalMinutes } = req.body;
    const generator = await ContentGenerator.findByIdAndUpdate(
      req.params.id,
      { 
        sectionId,
        modelId,
        prompt,
        intervalMinutes,
        updatedAt: Date.now()
      },
      { new: true }
    );
    res.json(generator);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении генератора' });
  }
});

// Изменить статус генератора (активен/неактивен)
router.put('/:id/toggle', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    const generator = await ContentGenerator.findByIdAndUpdate(
      req.params.id,
      { 
        isActive,
        updatedAt: Date.now()
      },
      { new: true }
    );
    res.json(generator);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении статуса генератора' });
  }
});

// Удалить генератор
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    await ContentGenerator.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при удалении генератора' });
  }
});

// Массовое изменение интервала
router.put('/batch/interval', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { ids, intervalMinutes } = req.body;
    
    if (!Array.isArray(ids) || !intervalMinutes || intervalMinutes < 1) {
      return res.status(400).json({ message: 'Неверные параметры запроса' });
    }

    await ContentGenerator.updateMany(
      { _id: { $in: ids } },
      { 
        intervalMinutes,
        updatedAt: Date.now()
      }
    );

    res.json({ message: 'Интервалы успешно обновлены' });
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении интервалов' });
  }
});

// Массовое изменение статуса
router.put('/batch/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { ids, isActive } = req.body;
    
    if (!Array.isArray(ids) || typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Неверные параметры запроса' });
    }

    await ContentGenerator.updateMany(
      { _id: { $in: ids } },
      { 
        isActive,
        updatedAt: Date.now()
      }
    );

    res.json({ message: 'Статусы успешно обновлены' });
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении статусов' });
  }
});

export default router; 