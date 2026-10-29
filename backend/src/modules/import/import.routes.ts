// backend/src/modules/import/import.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { importController } from './import.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { importElevesSchema } from './import.validation';

const router = Router();

const importLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { status: 429, message: 'Trop d\'imports.' },
});

// POST /import/eleves — Import complet
router.post(
  '/eleves',
  importLimiter,
  validateRequest(importElevesSchema),
  importController.importEleves
);

// GET /import/template — Télécharger le template CSV
router.get('/template', importController.downloadTemplate);

export default router;

export const publicRoute = false;
export const basePath = '/import';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE'];