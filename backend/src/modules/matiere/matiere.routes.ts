// backend/src/modules/matiere/matiere.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { matiereController } from './matiere.controller';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createMatiereSchema,
  updateMatiereSchema,
  matiereIdSchema,
  listMatieresSchema,
} from './matiere.validation';

const router = Router();

const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  handler: (_req, res) => {
    res.status(429).json({ status: 429, message: 'Trop d’opérations.', timestamp: new Date().toISOString() });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', validateRequest(listMatieresSchema), matiereController.list);
router.get('/:id', validateRequest(matiereIdSchema), matiereController.getById);
router.post('/', writeLimiter, validateRequest(createMatiereSchema), matiereController.create);
router.put('/:id', writeLimiter, validateRequest(updateMatiereSchema), matiereController.update);
router.delete('/:id', writeLimiter, validateRequest(matiereIdSchema), matiereController.softDelete);
router.delete('/:id/hard', writeLimiter, validateRequest(matiereIdSchema), matiereController.hardDelete);

export default router;

export const publicRoute = false;
export const basePath = '/matieres';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE', 'ENSEIGNANT'];