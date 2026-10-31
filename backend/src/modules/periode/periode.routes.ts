// backend/src/modules/periode/periode.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { periodeController } from './periode.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  createPeriodeSchema,
  updatePeriodeSchema,
  periodeIdSchema,
  listPeriodesSchema,
} from './periode.validation.js';

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

router.get('/', validateRequest(listPeriodesSchema), periodeController.list);
router.get('/:id', validateRequest(periodeIdSchema), periodeController.getById);
router.post('/', writeLimiter, validateRequest(createPeriodeSchema), periodeController.create);
router.put('/:id', writeLimiter, validateRequest(updatePeriodeSchema), periodeController.update);
router.delete('/:id', writeLimiter, validateRequest(periodeIdSchema), periodeController.hardDelete);

export default router;

export const publicRoute = false;
export const basePath = '/periodes';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE'];