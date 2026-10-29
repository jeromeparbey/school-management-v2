// backend/src/modules/import/export.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { exportController } from './export.controller';

const router = Router();

const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  handler: (_req, res) => {
    res.status(429).json({
      status: 429,
      message: 'Trop d\'exports.',
      timestamp: new Date().toISOString(),
    });
  },
});

// GET /import/export/eleves.xlsx
router.get(
  '/eleves.xlsx',
  exportLimiter,
  exportController.exportEleves
);

// GET /import/export/eleves.csv
router.get('/eleves.csv', exportLimiter, exportController.exportEleves);

export default router;

export const publicRoute = false;
export const basePath = '/import/export';
export const roles: string[] = ['DIRECTEUR', 'ADMIN', 'SECRETAIRE'];