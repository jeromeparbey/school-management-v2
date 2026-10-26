// backend/src/modules/classe/classe.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { classeController } from './classe.controller';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createClasseSchema,
  updateClasseSchema,
  classeIdSchema,
  listClassesSchema,
} from './classe.validation';

const router = Router();

const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  handler: (_req, res) => {
    res.status(429).json({
      status: 429,
      message: 'Trop d’opérations. Réessayez plus tard.',
      timestamp: new Date().toISOString(),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ───────────────────────────────────────────
// LECTURE
// ───────────────────────────────────────────
router.get(
  '/',
  validateRequest(listClassesSchema),
  classeController.list
);

router.get(
  '/by-annee/:anneeScolaireId',
  classeController.listByAnnee
);

router.get(
  '/:id',
  validateRequest(classeIdSchema),
  classeController.getById
);

router.get(
  '/:id/eleves',
  validateRequest(classeIdSchema),
  classeController.listEleves
);

router.get(
  '/:id/statistiques',
  validateRequest(classeIdSchema),
  classeController.statistiques
);

// ───────────────────────────────────────────
// ÉCRITURE
// ───────────────────────────────────────────
router.post(
  '/',
  writeLimiter,
  validateRequest(createClasseSchema),
  classeController.create
);

router.put(
  '/:id',
  writeLimiter,
  validateRequest(updateClasseSchema),
  classeController.update
);

// ───────────────────────────────────────────
// SUPPRESSION / ARCHIVAGE
// ───────────────────────────────────────────
router.delete(
  '/:id',
  writeLimiter,
  validateRequest(classeIdSchema),
  classeController.softDelete
);

router.delete(
  '/:id/hard',
  writeLimiter,
  validateRequest(classeIdSchema),
  classeController.hardDelete
);

export default router;

// ============================================
// MÉTADONNÉES POUR LE LOADER DYNAMIQUE
// ============================================
export const publicRoute = false;
export const basePath = '/classes';
export const roles: string[] = [
  'DIRECTEUR',
  'ADMIN',
  'SECRETAIRE',
  'ENSEIGNANT',
];