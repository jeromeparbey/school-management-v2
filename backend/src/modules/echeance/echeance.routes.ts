// backend/src/modules/echeance/echeance.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { echeanceController } from './echeance.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  createEcheanceSchema,
  updateEcheanceSchema,
  echeanceIdSchema,
  listEcheancesSchema,
  listElevesEcheanceSchema, // 🆕
} from './echeance.validation.js';

const router = Router();

// ═══════════════════════════════════════════
// RATE LIMIT (écritures)
// ═══════════════════════════════════════════
const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  handler: (_req, res) => {
    res.status(429).json({
      status: 429,
      message: 'Trop d’opérations.',
      timestamp: new Date().toISOString(),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ═══════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════
router.get('/', validateRequest(listEcheancesSchema), echeanceController.list);

router.get(
  '/by-plan/:planScolariteId',
  echeanceController.listByPlan
);

// 🆕 Vue classe — DOIT être AVANT /:id
router.get(
  '/:id/eleves',
  validateRequest(listElevesEcheanceSchema),
  echeanceController.listEleves
);

router.get(
  '/:id',
  validateRequest(echeanceIdSchema),
  echeanceController.getById
);

// ═══════════════════════════════════════════
// ÉCRITURE
// ═══════════════════════════════════════════
router.post(
  '/',
  writeLimiter,
  validateRequest(createEcheanceSchema),
  echeanceController.create
);

router.put(
  '/:id',
  writeLimiter,
  validateRequest(updateEcheanceSchema),
  echeanceController.update
);

// ═══════════════════════════════════════════
// SUPPRESSION
// ═══════════════════════════════════════════
router.delete(
  '/:id',
  writeLimiter,
  validateRequest(echeanceIdSchema),
  echeanceController.hardDelete
);

export default router;

export const publicRoute = false;
export const basePath = '/echeances';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE'];