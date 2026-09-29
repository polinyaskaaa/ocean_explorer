import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../lib/env';
import { HttpError } from '../lib/http-error';

export interface TokenPayload {
  sub: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

function readToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) return next();

  try {
    req.user = jwt.verify(token, env.jwtSecret) as TokenPayload;
  } catch {
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) return next(HttpError.unauthorized());

  try {
    req.user = jwt.verify(token, env.jwtSecret) as TokenPayload;
    next();
  } catch {
    next(HttpError.unauthorized('Сесія недійсна або протермінована'));
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err);
    if (req.user?.role !== Role.ADMIN) return next(HttpError.forbidden());
    next();
  });
}
