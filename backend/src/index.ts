import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import sectionsRouter from './routes/sections';
import aiSettingsRouter from './routes/aiSettings';
import contentGeneratorRouter from './routes/contentGenerator';
import jokesRouter from './routes/jokes';
import codeInjectionRouter from './routes/codeInjection';
import './services/contentGeneratorService';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'https://example.com',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/txtforge');

// Добавляем префикс /api ко всем роутам
const apiRouter = express.Router();

// Роут для авторизации
apiRouter.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30d' }
    );
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Неверные учетные данные' });
  }
});

// Монтируем роутеры с префиксом /api
apiRouter.use('/sections', sectionsRouter);
apiRouter.use('/ai-settings', aiSettingsRouter);
apiRouter.use('/content-generator', contentGeneratorRouter);
apiRouter.use('/jokes', jokesRouter);
apiRouter.use('/code-injection', codeInjectionRouter);

// Монтируем основной роутер
app.use('/api', apiRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 