// backend/src/modules/planScolarite/planScolarite.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { planScolariteController } from './planScolarite.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  createPlanScolariteSchema,
  updatePlanScolariteSchema,
  planScolariteIdSchema,
  listPlansScolariteSchema,
} from './planScolarite.validation.js';

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

router.get('/', validateRequest(listPlansScolariteSchema), planScolariteController.list);
router.get('/:id', validateRequest(planScolariteIdSchema), planScolariteController.getById);
router.post('/', writeLimiter, validateRequest(createPlanScolariteSchema), planScolariteController.create);
router.put('/:id', writeLimiter, validateRequest(updatePlanScolariteSchema), planScolariteController.update);
router.delete('/:id', writeLimiter, validateRequest(planScolariteIdSchema), planScolariteController.hardDelete);

export default router;

export const publicRoute = false;
export const basePath = '/plans-scolarite';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE'];