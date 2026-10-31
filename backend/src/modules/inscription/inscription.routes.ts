// backend/src/modules/inscription/inscription.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { inscriptionController } from './inscription.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  createInscriptionSchema,
  updateInscriptionSchema,
  inscriptionIdSchema,
  listInscriptionsSchema,
  inscrireEtPayerSchema,
  previewInscriptionSchema,
} from './inscription.validation.js';

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
// 🆕 ROUTES SPÉCIFIQUES (avant /:id — ordre CRITIQUE)
// ══════════════════════════════════════════

// Aperçu avant inscription (élève + classe + plan + résumé financier)
router.get(
  '/preview',
  validateRequest(previewInscriptionSchema),
  inscriptionController.preview
);

// Inscription + paiement atomique (transaction)
router.post(
  '/inscrire-et-payer',
  writeLimiter,
  validateRequest(inscrireEtPayerSchema),
  inscriptionController.inscrireEtPayer
);

// ══════════════════════════════════════════
// CRUD STANDARD
// ══════════════════════════════════════════

// LIST
router.get(
  '/',
  validateRequest(listInscriptionsSchema),
  inscriptionController.list
);

// CREATE (simple, sans paiement)
router.post(
  '/',
  writeLimiter,
  validateRequest(createInscriptionSchema),
  inscriptionController.create
);

// GET BY ID (avec détails complets)
router.get(
  '/:id',
  validateRequest(inscriptionIdSchema),
  inscriptionController.getById
);

// UPDATE
router.put(
  '/:id',
  writeLimiter,
  validateRequest(updateInscriptionSchema),
  inscriptionController.update
);

// SOFT DELETE
router.delete(
  '/:id',
  writeLimiter,
  validateRequest(inscriptionIdSchema),
  inscriptionController.softDelete
);

// HARD DELETE
router.delete(
  '/:id/hard',
  writeLimiter,
  validateRequest(inscriptionIdSchema),
  inscriptionController.hardDelete
);

export default router;

export const publicRoute = false;
export const basePath = '/inscriptions';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE', 'ENSEIGNANT', 'ELEVE', 'PARENT'];