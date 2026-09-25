import { createApp } from './app';
import { env } from './lib/env';
import { prisma } from './lib/prisma';

async function bootstrap() {
  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`API Deep Ocean Explorer запущено на http://localhost:${env.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} — зупиняю сервер...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch(async (err) => {
  console.error('Не вдалося запустити сервер:', err);
  await prisma.$disconnect();
  process.exit(1);
});
