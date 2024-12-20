import express, { Request, Response } from 'express';
import { Section } from '../models/Section';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Получить все разделы
router.get('/', async (req: Request, res: Response) => {
  try {
    const sections = await Section.find().sort('order');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении разделов' });
  }
});

// Создать новый раздел (только для админа)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, slug } = req.body;
    const section = new Section({
      title,
      slug,
      icon: 'FaLaugh',
    });
    await section.save();
    res.status(201).json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(400).json({ message: 'Ошибка при создании раздела' });
  }
});

// Обновить раздел (только для админа)
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, slug } = req.body;
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { 
        title,
        slug,
        icon: 'FaLaugh',
        updatedAt: Date.now() 
      },
      { new: true }
    );
    res.json(section);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении раздела' });
  }
});

// Удалить раздел (только для админа)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при удалении раздела' });
  }
});

export default router; 