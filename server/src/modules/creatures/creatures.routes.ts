import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createCreatureSchema, updateCreatureSchema } from './creatures.schemas';
import * as service from './creatures.service';

export const creaturesRouter = Router();

creaturesRouter.get('/', async (_req, res, next) => {
  try {
    res.json({ creatures: await service.listCreatures() });
  } catch (err) {
    next(err);
  }
});

creaturesRouter.get('/:id', async (req, res, next) => {
  try {
    res.json({ creature: await service.getCreature(req.params.id) });
  } catch (err) {
    next(err);
  }
});

export const adminCreaturesRouter = Router();
adminCreaturesRouter.use(requireAdmin);

adminCreaturesRouter.get('/', async (_req, res, next) => {
  try {
    res.json({ creatures: await service.listCreaturesForAdmin() });
  } catch (err) {
    next(err);
  }
});

adminCreaturesRouter.get('/:id', async (req, res, next) => {
  try {
    res.json({ creature: await service.getCreatureForAdmin(req.params.id) });
  } catch (err) {
    next(err);
  }
});

adminCreaturesRouter.post('/', validateBody(createCreatureSchema), async (req, res, next) => {
  try {
    res.status(201).json({ creature: await service.createCreature(req.body) });
  } catch (err) {
    next(err);
  }
});

adminCreaturesRouter.put('/:id', validateBody(updateCreatureSchema), async (req, res, next) => {
  try {
    res.json({ creature: await service.updateCreature(req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
});

adminCreaturesRouter.delete('/:id', async (req, res, next) => {
  try {
    await service.deleteCreature(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
