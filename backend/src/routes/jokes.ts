import express, { Request, Response } from 'express';
import { Joke, IJoke } from '../models/Joke';
import { JokeInteraction, IJokeInteraction } from '../models/JokeInteraction';
import { authenticateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

const router = express.Router();

interface UserVotes {
  [key: string]: 'like' | 'dislike';
}

// Получить все анекдоты с фильтрацией по разделу и пагинацией
router.get('/', async (req: Request, res: Response) => {
  try {
    const { sectionId, page = '1', limit = '9' } = req.query;
    const currentPage = parseInt(page as string);
    const itemsPerPage = parseInt(limit as string);
    const skip = (currentPage - 1) * itemsPerPage;

    console.log('GET /jokes - Параметры запроса:', {
      sectionId,
      page: currentPage,
      limit: itemsPerPage
    });

    const query = sectionId ? { sectionId } : {};
    
    // Получаем общее количество анекдотов для пагинации
    const total = await Joke.countDocuments(query);
    
    // Получаем анекдоты для текущей страницы
    const jokes = await Joke.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(itemsPerPage);
    
    console.log('GET /jokes - Найдено анекдотов:', {
      total,
      current: jokes.length,
      page: currentPage
    });
    
    // Добавляем информацию о голосах пользователя
    const clientId = req.cookies.clientId;
    let userVotes: UserVotes = {};
    
    if (clientId) {
      const interactions = await JokeInteraction.find({
        jokeId: { $in: jokes.map((joke: IJoke) => joke._id) },
        clientId,
        type: { $in: ['like', 'dislike'] }
      });
      
      userVotes = interactions.reduce((acc: UserVotes, interaction: IJokeInteraction) => ({
        ...acc,
        [interaction.jokeId.toString()]: interaction.type as 'like' | 'dislike'
      }), {});
    }

    const jokesWithVotes = jokes.map((joke: IJoke) => ({
      ...joke.toObject(),
      userVote: userVotes[joke._id.toString()] || null,
      dislikes: joke.dislikes || 0
    }));

    res.json({
      jokes: jokesWithVotes,
      pagination: {
        total,
        pages: Math.ceil(total / itemsPerPage),
        currentPage,
        hasMore: currentPage * itemsPerPage < total
      }
    });
  } catch (error) {
    console.error('Ошибка при получении анекдотов:', error);
    res.status(500).json({ message: 'Ошибка при получении анекдотов' });
  }
});

// Обновить статью
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { text, isPublished } = req.body;
    const joke = await Joke.findByIdAndUpdate(
      req.params.id,
      { 
        text,
        isPublished,
        updatedAt: new Date()
      },
      { new: true }
    );
    res.json(joke);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при обновлении статьи' });
  }
});

// Удалить статью
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    await Joke.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при удалении статьи' });
  }
});

// Добавить просмотр
router.post('/:id/view', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clientId = req.cookies.clientId || uuidv4();
    
    // Если нет clientId в куках, устанавливаем его
    if (!req.cookies.clientId) {
      res.cookie('clientId', clientId, { 
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 год
        httpOnly: true 
      });
    }

    // Пыаемся создать запись о просмотре
    try {
      await JokeInteraction.create({
        jokeId: id,
        clientId,
        type: 'view'
      });

      // Увеличиваем счетчик просмотров
      await Joke.findByIdAndUpdate(id, { $inc: { views: 1 } });
    } catch (error: any) {
      // Если ошибка дубликата, игнорируем
      if (error.code !== 11000) {
        throw error;
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при добавлении просмотра' });
  }
});

// Добавить/убрать лайк
router.post('/:id/like', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'like' или 'dislike'
    const clientId = req.cookies.clientId || uuidv4();
    
    // Если нет clientId в куках, устанавливаем его
    if (!req.cookies.clientId) {
      res.cookie('clientId', clientId, { 
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 год
        httpOnly: true 
      });
    }

    // Проверяем существующее взаимодействие
    const existingInteraction = await JokeInteraction.findOne({
      jokeId: id,
      clientId,
      type: { $in: ['like', 'dislike'] }
    });

    const joke = await Joke.findById(id);
    if (!joke) {
      return res.status(404).json({ message: 'Анекдот не найден' });
    }

    if (existingInteraction) {
      // Если уже есть такой же тип - удаляем (отмена лайка/дизлайка)
      if (existingInteraction.type === type) {
        await JokeInteraction.deleteOne({ _id: existingInteraction._id });
        if (type === 'like') {
          joke.likes = Math.max(0, joke.likes - 1);
        } else {
          joke.dislikes = Math.max(0, joke.dislikes - 1);
        }
      } else {
        // Если другой тип - меняем тип
        existingInteraction.type = type;
        await existingInteraction.save();
        if (type === 'like') {
          joke.likes = joke.likes + 1;
          joke.dislikes = Math.max(0, joke.dislikes - 1);
        } else {
          joke.dislikes = joke.dislikes + 1;
          joke.likes = Math.max(0, joke.likes - 1);
        }
      }
    } else {
      // Создаем новое взаимодействие
      await JokeInteraction.create({
        jokeId: id,
        clientId,
        type
      });
      if (type === 'like') {
        joke.likes = joke.likes + 1;
      } else {
        joke.dislikes = joke.dislikes + 1;
      }
    }

    await joke.save();

    // Возвращаем обновленный анекдот с информацией о голосе пользователя
    const updatedInteraction = await JokeInteraction.findOne({
      jokeId: id,
      clientId,
      type: { $in: ['like', 'dislike'] }
    });

    res.json({
      ...joke.toObject(),
      userVote: updatedInteraction ? updatedInteraction.type : null
    });
  } catch (error) {
    console.error('Ошибка при обработке лайка:', error);
    res.status(400).json({ message: 'Ошибка при обработке лайка' });
  }
});

// Получение случайных анекдотов из раздела
router.get('/random', async (req, res) => {
  try {
    const { sectionId, exclude, limit = 3 } = req.query;

    // Используем агрегацию с $sample для получения случайных анекдотов
    const jokes = await Joke.aggregate([
      {
        $match: {
          sectionId: new mongoose.Types.ObjectId(sectionId as string),
          _id: { $ne: new mongoose.Types.ObjectId(exclude as string) }
        }
      },
      { $sample: { size: parseInt(limit as string) } }
    ]);

    console.log('Найдено случайных анекдотов:', jokes.length);
    res.json(jokes);
  } catch (error) {
    console.error('Ошибка при получении анекдотов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить топ анекдотов по лайкам
router.get('/top/likes', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;
    const jokes = await Joke.find({ isPublished: true })
      .sort({ likes: -1 })
      .limit(limit);

    // Добавляем информацию о голосах пользователя
    const clientId = req.cookies.clientId;
    let userVotes: UserVotes = {};
    
    if (clientId) {
      const interactions = await JokeInteraction.find({
        jokeId: { $in: jokes.map(joke => joke._id) },
        clientId,
        type: { $in: ['like', 'dislike'] }
      });
      
      userVotes = interactions.reduce((acc: UserVotes, interaction: IJokeInteraction) => ({
        ...acc,
        [interaction.jokeId.toString()]: interaction.type as 'like' | 'dislike'
      }), {});
    }

    const jokesWithVotes = jokes.map(joke => ({
      ...joke.toObject(),
      userVote: userVotes[joke._id.toString()] || null,
      dislikes: joke.dislikes || 0
    }));

    res.json(jokesWithVotes);
  } catch (error) {
    console.error('Ошибка при получении топ анекдотов по лайкам:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить топ анекдотов по просмотрам
router.get('/top/views', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;
    const jokes = await Joke.find({ isPublished: true })
      .sort({ views: -1 })
      .limit(limit);

    // Добавляем информацию о голосах пользователя
    const clientId = req.cookies.clientId;
    let userVotes: UserVotes = {};
    
    if (clientId) {
      const interactions = await JokeInteraction.find({
        jokeId: { $in: jokes.map(joke => joke._id) },
        clientId,
        type: { $in: ['like', 'dislike'] }
      });
      
      userVotes = interactions.reduce((acc: UserVotes, interaction: IJokeInteraction) => ({
        ...acc,
        [interaction.jokeId.toString()]: interaction.type as 'like' | 'dislike'
      }), {});
    }

    const jokesWithVotes = jokes.map(joke => ({
      ...joke.toObject(),
      userVote: userVotes[joke._id.toString()] || null,
      dislikes: joke.dislikes || 0
    }));

    res.json(jokesWithVotes);
  } catch (error) {
    console.error('Ошибка при получении топ анекдотов по просмотрам:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить топ анекдотов по дизлайкам
router.get('/top/dislikes', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;
    const jokes = await Joke.find({ isPublished: true })
      .sort({ dislikes: -1 })
      .limit(limit);

    // Добавляем информацию о голосах пользователя
    const clientId = req.cookies.clientId;
    let userVotes: UserVotes = {};
    
    if (clientId) {
      const interactions = await JokeInteraction.find({
        jokeId: { $in: jokes.map(joke => joke._id) },
        clientId,
        type: { $in: ['like', 'dislike'] }
      });
      
      userVotes = interactions.reduce((acc: UserVotes, interaction: IJokeInteraction) => ({
        ...acc,
        [interaction.jokeId.toString()]: interaction.type as 'like' | 'dislike'
      }), {});
    }

    const jokesWithVotes = jokes.map(joke => ({
      ...joke.toObject(),
      userVote: userVotes[joke._id.toString()] || null,
      dislikes: joke.dislikes || 0
    }));

    res.json(jokesWithVotes);
  } catch (error) {
    console.error('Ошибка при получении топ анекдотов по дизлайкам:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить последние добавленные анекдоты
router.get('/latest', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;
    const jokes = await Joke.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(limit);

    // Добавляем информацию о голосах пользователя
    const clientId = req.cookies.clientId;
    let userVotes: UserVotes = {};
    
    if (clientId) {
      const interactions = await JokeInteraction.find({
        jokeId: { $in: jokes.map(joke => joke._id) },
        clientId,
        type: { $in: ['like', 'dislike'] }
      });
      
      userVotes = interactions.reduce((acc: UserVotes, interaction: IJokeInteraction) => ({
        ...acc,
        [interaction.jokeId.toString()]: interaction.type as 'like' | 'dislike'
      }), {});
    }

    const jokesWithVotes = jokes.map(joke => ({
      ...joke.toObject(),
      userVote: userVotes[joke._id.toString()] || null,
      dislikes: joke.dislikes || 0
    }));

    res.json(jokesWithVotes);
  } catch (error) {
    console.error('Ошибка при получении последних анекдотов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение отдельного анекдота по ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const joke = await Joke.findById(req.params.id);
    
    if (!joke) {
      return res.status(404).json({ message: 'Анекдот не найден' });
    }

    // Получаем clientId из куки
    const clientId = req.cookies.clientId;

    // Если есть clientId, проверяем взаимодействие пользователя
    let userVote = null;
    if (clientId) {
      const interaction = await JokeInteraction.findOne({
        jokeId: req.params.id,
        clientId,
        type: { $in: ['like', 'dislike'] }
      });
      if (interaction) {
        userVote = interaction.type;
      }
    }

    // Возвращаем анекдот вместе с информацией о голосе пользователя
    res.json({
      ...joke.toObject(),
      userVote,
      dislikes: joke.dislikes || 0 // Гарантируем, что dislikes всегда будет числом
    });
  } catch (error) {
    console.error('Ошибка при получении анекдота:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});


export default router; 