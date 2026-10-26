// backend/src/modules/recu/recu.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { recuController } from './recu.controller';
import { validateRequest } from '../../middleware/validateRequest';
import {
  genererRecuSchema,
  recuIdSchema,
  listRecusSchema,
} from './recu.validation';

const router = Router();

const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,
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
// ROUTES PUBLIQUES (avant tout)
// ═══════════════════════════════════════════

/**
 * Vérification publique d'un reçu par son code.
 * ⚠️ Doit être déclarée AVANT /:id pour ne pas être interprétée comme un id.
 */
router.get('/verifier/:code', recuController.verifier);

// ═══════════════════════════════════════════
// LECTURE
// ═══════════════════════════════════════════

router.get('/', validateRequest(listRecusSchema), recuController.list);
router.get('/by-eleve/:eleveId', recuController.listByEleve);
router.get('/by-numero/:numero', recuController.getByNumero);

// PDF multi-format
router.get('/:id/pdf', validateRequest(recuIdSchema), recuController.downloadPDF);
router.get(
  '/:id/pdf/preview',
  validateRequest(recuIdSchema),
  recuController.previewPDF
);

// Détail (en dernier pour ne pas avaler /pdf et /verifier)
router.get('/:id', validateRequest(recuIdSchema), recuController.getById);

// ═══════════════════════════════════════════
// GÉNÉRATION
// ═══════════════════════════════════════════

router.post(
  '/generer',
  writeLimiter,
  validateRequest(genererRecuSchema),
  recuController.generer
);

// ═══════════════════════════════════════════
// SUPPRESSION
// ═══════════════════════════════════════════

router.delete(
  '/:id/hard',
  writeLimiter,
  validateRequest(recuIdSchema),
  recuController.hardDelete
);

export default router;

export const publicRoute = false;
export const basePath = '/recus';
export const roles: string[] = [
  'DIRECTEUR',
  'ADMIN',
  'SECRETAIRE',
  'PARENT',
  'ELEVE',
];