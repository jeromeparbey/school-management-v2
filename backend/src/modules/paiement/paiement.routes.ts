// backend/src/modules/paiement/paiement.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { paiementController } from './paiement.controller';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createPaiementSchema,
  updatePaiementSchema,
  annulerPaiementSchema,
  paiementIdSchema,
  listPaiementsSchema,
} from './paiement.validation';

const router = Router();

const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,                     // Paiements = plus fréquent
  handler: (_req, res) => {
    res.status(429).json({ status: 429, message: 'Trop d’opérations.', timestamp: new Date().toISOString() });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Lecture
router.get('/', validateRequest(listPaiementsSchema), paiementController.list);
router.get('/stats', paiementController.stats);
router.get('/by-eleve/:eleveId', paiementController.listByEleve);
router.get('/:id', validateRequest(paiementIdSchema), paiementController.getById);

// Écriture
router.post('/', writeLimiter, validateRequest(createPaiementSchema), paiementController.create);
router.put('/:id', writeLimiter, validateRequest(updatePaiementSchema), paiementController.update);
router.post('/:id/annuler', writeLimiter, validateRequest(annulerPaiementSchema), paiementController.annuler);

// Suppression
router.delete('/:id/hard', writeLimiter, validateRequest(paiementIdSchema), paiementController.hardDelete);

export default router;

export const publicRoute = false;
export const basePath = '/paiements';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE', 'ENSEIGNANT', 'ELEVE', 'PARENT'];