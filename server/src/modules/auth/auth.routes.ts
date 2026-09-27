import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { loginSchema, registerSchema } from './auth.schemas';
import * as authService from './auth.service';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    res.status(201).json(await authService.register(req.body));
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    res.json(await authService.login(req.body));
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    res.json({ user: await authService.getProfile(req.user!.sub) });
  } catch (err) {
    next(err);
  }
});
