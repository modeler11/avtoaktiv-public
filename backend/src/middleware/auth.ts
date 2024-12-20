import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Добавляем расширение типа Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Токен отсутствует' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err: any, user: any) => {
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(403).json({ message: 'Недействительный токен' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Ошибка авторизации' });
  }
}; 