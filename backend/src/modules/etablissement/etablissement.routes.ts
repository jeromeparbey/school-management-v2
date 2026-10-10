// backend/src/modules/etablissement/etablissement.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { etablissementController } from './etablissement.controller';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createEtablissementSchema,
  updateEtablissementSchema,
  etablissementIdSchema,
  listEtablissementsSchema,
  toggleEtablissementSchema,
  reprovisionnerEtablissementSchema,
} from './etablissement.validation';

// ⚠️ IMPORTANT :
// - Ce routeur est monté par le loader dynamique (server.ts).
// - Le loader applique AUTOMATIQUEMENT :
//     • authMiddleware      (authentification)
//     • rbacMiddleware      (rôles SUPER_ADMIN, ADMIN_SYSTEME)
// - Ne PAS remettre authMiddleware/requireRole ici → double exécution inutile.
// - `disableAudit = true` car la table `logs_audit` n'existe QUE dans
//   les schémas tenant, pas dans le catalogue global.

const router = Router();

/** Limiteur global pour les opérations d'écriture (provisioning = lourd) */
const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
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
  validateRequest(listEtablissementsSchema),
  etablissementController.list
);

router.get(
  '/stats',
  etablissementController.stats
);

router.get(
  '/:id',
  validateRequest(etablissementIdSchema),
  etablissementController.getById
);

// ─── Écriture ──────────────────────────────────────────────
router.post(
  '/',
  writeLimiter,
  validateRequest(createEtablissementSchema),
  etablissementController.create
);

router.put(
  '/:id',
  writeLimiter,
  validateRequest(updateEtablissementSchema),
  etablissementController.update
);

router.patch(
  '/:id/toggle',
  writeLimiter,
  validateRequest(toggleEtablissementSchema),
  etablissementController.toggle
);

router.patch(
  '/:id/archive',
  writeLimiter,
  validateRequest(etablissementIdSchema),
  etablissementController.archive
);

router.post(
  '/:id/reprovisionner',
  writeLimiter,
  validateRequest(reprovisionnerEtablissementSchema),
  etablissementController.reprovisionner
);

// ─── Suppression ───────────────────────────────────────────
router.delete(
  '/:id',
  writeLimiter,
  validateRequest(etablissementIdSchema),
  etablissementController.hardDelete
);

export default router;

// ============================================
// MÉTADONNÉES POUR LE LOADER DYNAMIQUE (server.ts)
// ============================================
export const publicRoute = false;
export const basePath = '/etablissements';
export const roles: string[] = ['SUPER_ADMIN', 'ADMIN_SYSTEME'];
export const disableAudit = true; // 🔥 CRUCIAL : la table `logs_audit` n'existe que dans les tenants