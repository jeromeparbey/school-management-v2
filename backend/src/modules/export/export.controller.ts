// backend/src/modules/import/export.controller.ts

import { Request, Response, NextFunction } from 'express';
import { exportService } from './export.service';
import { AppError } from '../../utils/AppError';

function requireAuthContext(req: Request) {
  const schemaName = req.user?.schemaName;
  const etablissementId = req.user?.etablissementId;
  if (req.user?.scope === 'GLOBAL')
    throw new AppError('Endpoint réservé aux établissements', 403);
  if (!schemaName || !etablissementId)
    throw new AppError('Établissement non identifié', 400);
  return { schemaName, etablissementId };
}

export class ExportController {
  // GET /import/export/eleves.xlsx
  // GET /import/export/eleves.csv
  exportEleves = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const ctx = requireAuthContext(req);
      const format = req.path.endsWith('.xlsx') ? 'xlsx' : 'csv';

      const options = {
        inclureArchives: req.query.inclureArchives === 'true',
        inclureIdentite: req.query.inclureIdentite !== 'false',
        inclureClasse: req.query.inclureClasse !== 'false',
        inclurePlan: req.query.inclurePlan !== 'false',
        inclureEcheances: req.query.inclureEcheances !== 'false',
        inclureResponsables: req.query.inclureResponsables !== 'false',
        classeId: req.query.classeId as string | undefined,
        anneeScolaireId: req.query.anneeScolaireId as string | undefined,
        lignesVides: req.query.lignesVides
          ? parseInt(req.query.lignesVides as string, 10)
          : 20,
        limite: req.query.limite
          ? parseInt(req.query.limite as string, 10)
          : 5000,
      };

      const result = await exportService.exportEleves(
        ctx,
        options,
        format
      );

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${result.filename}"`
      );
      res.setHeader('Content-Length', result.buffer.length.toString());
      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).end(result.buffer);
    } catch (e) {
      next(e);
    }
  };
}

export const exportController = new ExportController();