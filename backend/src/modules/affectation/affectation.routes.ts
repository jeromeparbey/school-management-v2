// backend/src/modules/affectation/affectation.routes.ts

import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { affectationController } from './affectation.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { AppError } from '../../utils/AppError.js';
import {
  createAffectationSchema,
  updateAffectationSchema,
  affectationIdSchema,
  listAffectationsSchema,
} from './affectation.validation.js';

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
 * Autorise /me pour :
 *   - ENSEIGNANT (lit ses propres affectations, ID issu du JWT)
 *   - DIRECTEUR / ADMIN / SECRETAIRE
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
router.get('/me', allowSelf, affectationController.getMine);

// ── Admin ──
router.get(
  '/',
  validateRequest(listAffectationsSchema),
  affectationController.list
);
router.get(
  '/by-enseignant/:enseignantId',
  affectationController.listByEnseignant
);
router.get('/by-classe/:classeId', affectationController.listByClasse);
router.get(
  '/:id',
  validateRequest(affectationIdSchema),
  affectationController.getById
);
router.post(
  '/',
  writeLimiter,
  validateRequest(createAffectationSchema),
  affectationController.create
);
router.put(
  '/:id',
  writeLimiter,
  validateRequest(updateAffectationSchema),
  affectationController.update
);
router.delete(
  '/:id',
  writeLimiter,
  validateRequest(affectationIdSchema),
  affectationController.softDelete
);
router.delete(
  '/:id/hard',
  writeLimiter,
  validateRequest(affectationIdSchema),
  affectationController.hardDelete
);

export default router;

export const publicRoute = false;
export const basePath = '/affectations';

// ⚠️ Le loader applique ces rôles à TOUTES les routes du module.
// /me reste bloqué pour ENSEIGNANT → créer `affectation-self.routes.ts`
// OU adapter `module-loader.ts` pour supporter des rôles par route.
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE' ,'ENSEIGNANT' ];