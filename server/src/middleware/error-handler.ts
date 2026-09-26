import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../lib/http-error';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ message: 'Маршрут не знайдено' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message, details: err.details });
    return;
  }

  console.error('[unhandled error]', err);
  res.status(500).json({ message: 'Внутрішня помилка сервера' });
}
