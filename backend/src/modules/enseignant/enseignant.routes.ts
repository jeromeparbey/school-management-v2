// backend/src/modules/enseignant/enseignant.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { enseignantController } from './enseignant.controller';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createEnseignantSchema,
  updateEnseignantSchema,
  enseignantIdSchema,
  listEnseignantsSchema,
} from './enseignant.validation';

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

router.get('/', validateRequest(listEnseignantsSchema), enseignantController.list);
router.get('/:id', validateRequest(enseignantIdSchema), enseignantController.getById);
router.post('/', writeLimiter, validateRequest(createEnseignantSchema), enseignantController.create);
router.put('/:id', writeLimiter, validateRequest(updateEnseignantSchema), enseignantController.update);
router.delete('/:id', writeLimiter, validateRequest(enseignantIdSchema), enseignantController.softDelete);
router.delete('/:id/hard', writeLimiter, validateRequest(enseignantIdSchema), enseignantController.hardDelete);

export default router;

export const publicRoute = false;
export const basePath = '/enseignants';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE'];