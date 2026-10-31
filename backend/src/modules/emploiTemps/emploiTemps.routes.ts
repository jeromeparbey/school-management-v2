// backend/src/modules/emploiTemps/emploiTemps.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { emploiTempsController } from './emploiTemps.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  createEmploiTempsSchema,
  updateEmploiTempsSchema,
  emploiTempsIdSchema,
  listEmploisTempsSchema,
  checkConflitsSchema,
} from './emploiTemps.validation.js';

const router = Router();

const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 150,                     // EDT = modifs fréquentes
  handler: (_req, res) => {
    res.status(429).json({ status: 429, message: 'Trop d’opérations.', timestamp: new Date().toISOString() });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ───────────────────────────────────────────
// CHECK CONFLITS (avant create/update)
// ───────────────────────────────────────────
router.post('/check-conflits', writeLimiter, validateRequest(checkConflitsSchema), emploiTempsController.checkConflits);

// ───────────────────────────────────────────
// LECTURE
// ───────────────────────────────────────────
router.get('/', validateRequest(listEmploisTempsSchema), emploiTempsController.list);
router.get('/by-classe/:classeId', emploiTempsController.listByClasse);
router.get('/by-enseignant/:enseignantId', emploiTempsController.listByEnseignant);
router.get('/by-eleve/:eleveId', emploiTempsController.listByEleve);
router.get('/:id', validateRequest(emploiTempsIdSchema), emploiTempsController.getById);

// ───────────────────────────────────────────
// ÉCRITURE
// ───────────────────────────────────────────
router.post('/', writeLimiter, validateRequest(createEmploiTempsSchema), emploiTempsController.create);
router.put('/:id', writeLimiter, validateRequest(updateEmploiTempsSchema), emploiTempsController.update);
router.patch('/:id/toggle', writeLimiter, validateRequest(emploiTempsIdSchema), emploiTempsController.toggleActif);
router.post('/:id/dupliquer', writeLimiter, validateRequest(emploiTempsIdSchema), emploiTempsController.dupliquer);

// ───────────────────────────────────────────
// SUPPRESSION
// ───────────────────────────────────────────
router.delete('/:id', writeLimiter, validateRequest(emploiTempsIdSchema), emploiTempsController.softDelete);
router.delete('/:id/hard', writeLimiter, validateRequest(emploiTempsIdSchema), emploiTempsController.hardDelete);

export default router;

export const publicRoute = false;
export const basePath = '/emplois-temps';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE', 'ENSEIGNANT', 'ELEVE', 'PARENT'];