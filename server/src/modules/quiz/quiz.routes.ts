import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { submitQuizSchema } from './quiz.schemas';
import * as service from './quiz.service';

export const quizRouter = Router();

quizRouter.get('/:creatureId', requireAuth, async (req, res, next) => {
  try {
    res.json(await service.startQuiz(req.params.creatureId));
  } catch (err) {
    next(err);
  }
});

quizRouter.post(
  '/:creatureId/submit',
  requireAuth,
  validateBody(submitQuizSchema),
  async (req, res, next) => {
    try {
      res.json(await service.submitQuiz(req.user!.sub, req.params.creatureId, req.body));
    } catch (err) {
      next(err);
    }
  },
);
