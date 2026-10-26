// backend/src/modules/affectation/affectation.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { affectationController } from './affectation.controller';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createAffectationSchema,
  updateAffectationSchema,
  affectationIdSchema,
  listAffectationsSchema,
} from './affectation.validation';

const router = Router();

const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  handler: (_req, res) => {
    res.status(429).json({ status: 429, message: 'Trop d’opérations.', timestamp: new Date().toISOString() });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/', validateRequest(listAffectationsSchema), affectationController.list);
router.get('/by-enseignant/:enseignantId', affectationController.listByEnseignant);
router.get('/by-classe/:classeId', affectationController.listByClasse);
router.get('/:id', validateRequest(affectationIdSchema), affectationController.getById);
router.post('/', writeLimiter, validateRequest(createAffectationSchema), affectationController.create);
router.put('/:id', writeLimiter, validateRequest(updateAffectationSchema), affectationController.update);
router.delete('/:id', writeLimiter, validateRequest(affectationIdSchema), affectationController.softDelete);
router.delete('/:id/hard', writeLimiter, validateRequest(affectationIdSchema), affectationController.hardDelete);

export default router;

export const publicRoute = false;
export const basePath = '/affectations';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE'];