// backend/src/modules/niveau/niveau.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { niveauController } from './niveau.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  createNiveauSchema,
  updateNiveauSchema,
  niveauIdSchema,
  listNiveauxSchema,
} from './niveau.validation.js';

const router = Router();

// ───────────────────────────────────────────
// 🔍 DIAGNOSTIC — à retirer une fois OK
// ───────────────────────────────────────────
console.log('🔥 niveau.routes.ts — handlers:', {
  list: typeof niveauController?.list,
  create: typeof niveauController?.create,
  getById: typeof niveauController?.getById,
  update: typeof niveauController?.update,
  hardDelete: typeof niveauController?.hardDelete,
});

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

// ═══════════════════════════════════════════
// ÉCRITURE — POST / (LA ROUTE QUI MANQUAIT À VOTRE TEST)
// ═══════════════════════════════════════════
router.post(
  '/',
  writeLimiter,
  validateRequest(createNiveauSchema),
  niveauController.create
);

// ═══════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════
router.get(
  '/',
  validateRequest(listNiveauxSchema),
  niveauController.list
);

// ═══════════════════════════════════════════
// ROUTES AVEC :id (EN DERNIER — TRÈS IMPORTANT)
// ═══════════════════════════════════════════
router.get(
  '/:id',
  validateRequest(niveauIdSchema),
  niveauController.getById
);

router.put(
  '/:id',
  writeLimiter,
  validateRequest(updateNiveauSchema),
  niveauController.update
);

router.delete(
  '/:id',
  writeLimiter,
  validateRequest(niveauIdSchema),
  niveauController.hardDelete
);

// ───────────────────────────────────────────
// 🔍 DIAGNOSTIC FINAL — à retirer une fois OK
// ───────────────────────────────────────────
setImmediate(() => {
  const stack = (router as any).stack as Array<{
    route?: { path: string; methods: Record<string, boolean> };
  }>;
  const routes = stack
    .filter((l) => l.route)
    .map((l) => ({
      path: l.route!.path,
      methods: Object.keys(l.route!.methods),
    }));
  console.log('🔥 ROUTES ENREGISTRÉES dans niveau.routes.ts:', routes);
  const hasPost = routes.some(
    (r) => r.methods.includes('post') && r.path === '/'
  );
  console.log(hasPost ? '✅ POST / bien déclaré' : '❌ POST / MANQUANT');
});

export default router;

// ============================================
// MÉTADONNÉES POUR LE LOADER DYNAMIQUE
// ============================================
export const publicRoute = false;
export const basePath = '/niveaux';
export const roles: string[] = [
  'DIRECTEUR',
  'ADMIN',
  'SECRETAIRE',
  'ENSEIGNANT',
];