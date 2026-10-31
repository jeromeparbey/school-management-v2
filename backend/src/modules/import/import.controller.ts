// backend/src/modules/import/import.controller.ts

import { Request, Response, NextFunction } from 'express';
import { importService } from './import.service.js';
import { getImportTemplateCsv } from './import.excel.template.js';
import { AppError } from '../../utils/AppError.js';

function requireAuthContext(req: Request) {
  const schemaName = req.user?.schemaName;
  const etablissementId = req.user?.etablissementId;
  if (req.user?.scope === 'GLOBAL')
    throw new AppError('Endpoint réservé aux établissements', 403);
  if (!schemaName || !etablissementId)
    throw new AppError('Établissement non identifié', 400);
  return { schemaName, etablissementId };
}

export class ImportController {
  // POST /import/eleves
  importEleves = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ctx = requireAuthContext(req);
      const result = await importService.importEleves(ctx, req.body);

      res.status(200).json({
        success: true,
        status: 200,
        message: `Import terminé : ${result.succes}/${result.totalLignes} réussies`,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      next(e);
    }
  };

  // GET /import/template
  downloadTemplate = (req: Request, res: Response) => {
    const csv = getImportTemplateCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="template-import-eleves.csv"'
    );
    res.send('\uFEFF' + csv); // BOM pour Excel
  };
}

export const importController = new ImportController();