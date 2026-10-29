// backend/src/modules/enseignant/enseignant.routes.ts

import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { enseignantController } from './enseignant.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { AppError } from '../../utils/AppError';
import {
  createEnseignantSchema,
  updateEnseignantSchema,
  enseignantIdSchema,
  listEnseignantsSchema,
} from './enseignant.validation';

const router = Router();

// ──────────────────────────────────────────
// RATE LIMITING
// ──────────────────────────────────────────

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

// ──────────────────────────────────────────
// MIDDLEWARE AD HOC — /me
// ──────────────────────────────────────────

/**
 * Autorise /enseignants/me pour :
 *   - ENSEIGNANT (lit sa propre fiche, ID issu du JWT)
 *   - DIRECTEUR / ADMIN / SECRETAIRE (utile pour debug)
 *
 * ⚠️ Ce middleware est posé AVANT le middleware global du loader
 * (rôles DIRECTEUR|ADMIN|SECRETAIRE). Voir note dans `module-loader.ts` :
 * si le loader applique `roles` à toutes les routes du module, il faut
 * soit créer un module séparé, soit déclarer ici les rôles élargis.
 */
function allowSelf(req: Request, _res: Response, next: NextFunction) {
  const role = req.user?.role;
  if (
    role === 'ENSEIGNANT' ||
    role === 'DIRECTEUR' ||
    role === 'ADMIN' ||
    role === 'SECRETAIRE'
  ) {
    return next();
  }
  return next(new AppError('Accès refusé', 403));
}

// ══════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════

// ⭐ /me AVANT /:id (sinon "me" serait interprété comme un ID)
router.get('/me', allowSelf, enseignantController.getMe);

// ── Admin ──
router.get(
  '/',
  validateRequest(listEnseignantsSchema),
  enseignantController.list
);
router.get(
  '/:id',
  validateRequest(enseignantIdSchema),
  enseignantController.getById
);
router.post(
  '/',
  writeLimiter,
  validateRequest(createEnseignantSchema),
  enseignantController.create
);
router.put(
  '/:id',
  writeLimiter,
  validateRequest(updateEnseignantSchema),
  enseignantController.update
);
router.delete(
  '/:id',
  writeLimiter,
  validateRequest(enseignantIdSchema),
  enseignantController.softDelete
);
router.delete(
  '/:id/hard',
  writeLimiter,
  validateRequest(enseignantIdSchema),
  enseignantController.hardDelete
);

export default router;

export const publicRoute = false;
export const basePath = '/enseignants';

// ⚠️ Le loader applique ces rôles à TOUTES les routes du module.
// /me reste bloqué pour ENSEIGNANT → voir `enseignant-self.routes.ts`
// ou adapter `module-loader.ts` pour supporter des rôles par route.
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE', 'ENSEIGNANT', 'ELEVE', 'PARENT'];