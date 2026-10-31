// backend/src/modules/anneeScolaire/anneeScolaire.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { anneeScolaireController } from './anneeScolaire.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  createAnneeScolaireSchema,
  updateAnneeScolaireSchema,
  anneeScolaireIdSchema,
  listAnneesScolairesSchema,
} from './anneeScolaire.validation.js';

const router = Router();

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

// Écriture
router.post('/', writeLimiter, validateRequest(createAnneeScolaireSchema), anneeScolaireController.create);

// Lecture
router.get('/', validateRequest(listAnneesScolairesSchema), anneeScolaireController.list);
router.get('/active', anneeScolaireController.getActive);
router.get('/:id', validateRequest(anneeScolaireIdSchema), anneeScolaireController.getById);

// Écriture
router.put('/:id', writeLimiter, validateRequest(updateAnneeScolaireSchema), anneeScolaireController.update);

// Suppression
router.delete('/:id', writeLimiter, validateRequest(anneeScolaireIdSchema), anneeScolaireController.hardDelete);

export default router;

export const publicRoute = false;
export const basePath = '/annees-scolaires';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE'];