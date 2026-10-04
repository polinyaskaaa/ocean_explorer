import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { prisma } from '../../lib/prisma';

export const progressRouter = Router();

progressRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub;

    const [user, awarded] = await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, score: true },
      }),
      prisma.quizAttempt.findMany({
        where: { userId, awardedPoint: true },
        select: { creatureId: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    res.json({
      user,
      completedCreatureIds: awarded.map((a) => a.creatureId),
      completedAt: Object.fromEntries(awarded.map((a) => [a.creatureId, a.createdAt])),
    });
  } catch (err) {
    next(err);
  }
});
