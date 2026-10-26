// backend/src/modules/inscription/inscription.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { inscriptionController } from './inscription.controller';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createInscriptionSchema,
  updateInscriptionSchema,
  inscriptionIdSchema,
  listInscriptionsSchema,
} from './inscription.validation';

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

router.get('/', validateRequest(listInscriptionsSchema), inscriptionController.list);
router.get('/:id', validateRequest(inscriptionIdSchema), inscriptionController.getById);
router.post('/', writeLimiter, validateRequest(createInscriptionSchema), inscriptionController.create);
router.put('/:id', writeLimiter, validateRequest(updateInscriptionSchema), inscriptionController.update);
router.delete('/:id', writeLimiter, validateRequest(inscriptionIdSchema), inscriptionController.softDelete);
router.delete('/:id/hard', writeLimiter, validateRequest(inscriptionIdSchema), inscriptionController.hardDelete);

export default router;

export const publicRoute = false;
export const basePath = '/inscriptions';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE'];