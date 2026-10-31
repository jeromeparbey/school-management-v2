// backend/src/modules/directeur/directeur.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { directeurController } from './directeur.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  createDirecteurSchema,
  updateDirecteurSchema,
  directeurIdSchema,
  listDirecteursSchema,
  toggleDirecteurSchema,
  changeDirecteurPasswordSchema,
} from './directeur.validation.js';

const router = Router();

/** Limiteur pour les opérations d'écriture */
const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: 'Trop d’opérations. Réessayez plus tard.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Lecture ───────────────────────────────────────────────
router.get(
  '/',
  validateRequest(listDirecteursSchema),
  directeurController.list
);

router.get(
  '/:id',
  validateRequest(directeurIdSchema),
  directeurController.getById
);

// ─── Écriture ──────────────────────────────────────────────
router.post(
  '/',
  writeLimiter,
  validateRequest(createDirecteurSchema),
  directeurController.create
);

router.put(
  '/:id',
  writeLimiter,
  validateRequest(updateDirecteurSchema),
  directeurController.update
);

router.patch(
  '/:id/toggle',
  writeLimiter,
  validateRequest(toggleDirecteurSchema),
  directeurController.toggle
);

router.patch(
  '/:id/change-password',
  writeLimiter,
  validateRequest(changeDirecteurPasswordSchema),
  directeurController.changePassword
);

// ─── Suppression ───────────────────────────────────────────
router.delete(
  '/:id',
  writeLimiter,
  validateRequest(directeurIdSchema),
  directeurController.hardDelete
);

export default router;

// ============================================
// MÉTADONNÉES POUR LE LOADER DYNAMIQUE (server.ts)
// ============================================
export const publicRoute = false;
export const basePath = '/directeurs';
export const roles: string[] = ['DIRECTEUR','SUPER_ADMIN', 'ADMIN'];  // rôles TENANT
export const disableAudit = false;