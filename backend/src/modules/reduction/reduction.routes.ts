// backend/src/modules/reduction/reduction.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { reductionController } from './reduction.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  createReductionSchema,
  updateReductionSchema,
  reductionIdSchema,
  listReductionsSchema,
} from './reduction.validation.js';

const router = Router();

const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100, // Réductions = moins fréquent que paiements
  handler: (_req, res) => {
    res.status(429).json({
      status: 429,
      message: 'Trop d\'opérations.',
      timestamp: new Date().toISOString(),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Lecture
router.get(
  '/',
  validateRequest(listReductionsSchema),
  reductionController.list
);
router.get('/stats', reductionController.stats);
router.get('/by-eleve/:eleveId', reductionController.listByEleve);
router.get(
  '/:id',
  validateRequest(reductionIdSchema),
  reductionController.getById
);

// Écriture
router.post(
  '/',
  writeLimiter,
  validateRequest(createReductionSchema),
  reductionController.create
);
router.put(
  '/:id',
  writeLimiter,
  validateRequest(updateReductionSchema),
  reductionController.update
);

// Suppression
router.delete(
  '/:id/hard',
  writeLimiter,
  validateRequest(reductionIdSchema),
  reductionController.hardDelete
);

export default router;

export const publicRoute = false;
export const basePath = '/reductions';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE'];