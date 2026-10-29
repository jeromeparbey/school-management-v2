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
  affecterEnseignantSchema,
} from './matiere.validation';

const router = Router();

// ══════════════════════════════════════════
// RATE LIMIT (écritures)
// ══════════════════════════════════════════

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

// ══════════════════════════════════════════
// LECTURE
// ══════════════════════════════════════════

router.get('/', validateRequest(listMatieresSchema), matiereController.list);

// ══════════════════════════════════════════
// ÉCRITURE
// ══════════════════════════════════════════

router.post(
  '/',
  writeLimiter,
  validateRequest(createMatiereSchema),
  matiereController.create
);

// ══════════════════════════════════════════
// 🆕 ROUTES SPÉCIFIQUES (AVANT /:id)
// ══════════════════════════════════════════

// Affecter un enseignant à une matière (classe + année)
router.post(
  '/:id/affecter-enseignant',
  writeLimiter,
  validateRequest(affecterEnseignantSchema),
  matiereController.affecterEnseignant
);

// ══════════════════════════════════════════
// ROUTES PARAMÉTRÉES GÉNÉRIQUES (APRÈS)
// ══════════════════════════════════════════

router.get(
  '/:id',
  validateRequest(matiereIdSchema),
  matiereController.getById
);

router.put(
  '/:id',
  writeLimiter,
  validateRequest(updateMatiereSchema),
  matiereController.update
);

router.delete(
  '/:id',
  writeLimiter,
  validateRequest(matiereIdSchema),
  matiereController.softDelete
);

router.delete(
  '/:id/hard',
  writeLimiter,
  validateRequest(matiereIdSchema),
  matiereController.hardDelete
);

export default router;

export const publicRoute = false;
export const basePath = '/matieres';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE', 'ENSEIGNANT'];