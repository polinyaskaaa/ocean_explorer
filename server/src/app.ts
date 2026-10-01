import cors from 'cors';
import express from 'express';
import { env } from './lib/env';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { authRouter } from './modules/auth/auth.routes';
import { adminCreaturesRouter, creaturesRouter } from './modules/creatures/creatures.routes';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  app.use('/api/auth', authRouter);
  app.use('/api/creatures', creaturesRouter);
  app.use('/api/admin/creatures', adminCreaturesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
