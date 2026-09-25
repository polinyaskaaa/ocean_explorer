import cors from 'cors';
import express from 'express';
import { env } from './lib/env';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
