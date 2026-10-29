// backend/src/modules/eleve/eleve.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { eleveController } from './eleve.controller';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createEleveSchema,
  updateEleveSchema,
  eleveIdSchema,
  listElevesSchema,
} from './eleve.validation';

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

router.get('/', validateRequest(listElevesSchema), eleveController.list);
router.get('/:id', validateRequest(eleveIdSchema), eleveController.getById);
router.post('/', writeLimiter, validateRequest(createEleveSchema), eleveController.create);
router.put('/:id', writeLimiter, validateRequest(updateEleveSchema), eleveController.update);
router.delete('/:id', writeLimiter, validateRequest(eleveIdSchema), eleveController.softDelete);
router.delete('/:id/hard', writeLimiter, validateRequest(eleveIdSchema), eleveController.hardDelete);

export default router;

export const publicRoute = false;
export const basePath = '/eleves';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE', 'ENSEIGNANT', 'ELEVE', 'PARENT'];