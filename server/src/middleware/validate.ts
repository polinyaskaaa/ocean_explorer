import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { HttpError } from '../lib/http-error';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(HttpError.badRequest('Некоректні вхідні дані', result.error.flatten().fieldErrors));
      return;
    }
    req.body = result.data;
    next();
  };
}
