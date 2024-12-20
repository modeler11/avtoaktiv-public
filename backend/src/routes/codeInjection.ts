import express, { Request, Response } from 'express';
import { CodeInjection } from '../models/CodeInjection';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Получить текущий код
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    let codeInjection = await CodeInjection.findOne();
    
    if (!codeInjection) {
      codeInjection = new CodeInjection({ headerCode: '' });
      await codeInjection.save();
    }
    
    res.json(codeInjection);
  } catch (error) {
    console.error('Ошибка при получении кода:', error);
    res.status(500).json({ message: 'Ошибка при получении кода' });
  }
});

// Обновить код
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { headerCode } = req.body;
    
    let codeInjection = await CodeInjection.findOne();
    
    if (codeInjection) {
      codeInjection.headerCode = headerCode;
      codeInjection.updatedAt = new Date();
    } else {
      codeInjection = new CodeInjection({ headerCode });
    }
    
    await codeInjection.save();
    res.json(codeInjection);
  } catch (error) {
    console.error('Ошибка при сохранении кода:', error);
    res.status(500).json({ message: 'Ошибка при сохранении кода' });
  }
});

// Получить код для публичного доступа (без авторизации)
router.get('/public', async (req: Request, res: Response) => {
  try {
    const codeInjection = await CodeInjection.findOne();
    res.json({ headerCode: codeInjection?.headerCode || '' });
  } catch (error) {
    console.error('Ошибка при получении публичного кода:', error);
    res.status(500).json({ message: 'Ошибка при получении кода' });
  }
});

export default router; 