// backend/src/modules/periode/periode.controller.ts

import { Request, Response, NextFunction } from 'express';
import { periodeService } from './periode.service';
import { AppError } from '../../utils/AppError';

interface Ctx {
  schemaName: string;
  etablissementId: string;
}

function sendSuccess<T>(res: Response, data?: T, message?: string, status = 200) {
  return res.status(status).json({
    success: true,
    status,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    timestamp: new Date().toISOString(),
  });
}

function requireAuthContext(req: Request): Ctx {
  const schemaName = req.user?.schemaName;
  const etablissementId = req.user?.etablissementId;
  if (req.user?.scope === 'GLOBAL')
    throw new AppError('Endpoint réservé aux établissements', 403);
  if (!schemaName || !etablissementId)
    throw new AppError('Établissement non identifié', 400);
  return { schemaName, etablissementId };
}

function getParam(req: Request, name: string): string {
  const v = req.params[name];
  if (typeof v !== 'string' || v.length === 0)
    throw new AppError(`Paramètre "${name}" invalide`, 400);
  return v;
}

export class PeriodeController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await periodeService.create(ctx, req.body);
      sendSuccess(res, data, 'Période créée avec succès', 201);
    } catch (e) { next(e); }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;
      const result = await periodeService.findAll(ctx, {
        page: q.page ?? 1,
        limit: q.limit ?? 50,
        search: q.search,
        anneeScolaireId: q.anneeScolaireId,
        type: q.type,
        estActive: q.estActive,
        estCloturee: q.estCloturee,
        sortBy: q.sortBy ?? 'ordre',
        sortOrder: q.sortOrder ?? 'asc',
      });
      res.json({ success: true, ...result });
    } catch (e) { next(e); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await periodeService.findById(ctx, getParam(req, 'id'));
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await periodeService.update(ctx, getParam(req, 'id'), req.body);
      sendSuccess(res, data, 'Période mise à jour');
    } catch (e) { next(e); }
  };

  hardDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const result = await periodeService.hardDelete(ctx, getParam(req, 'id'));
      sendSuccess(res, result, 'Période supprimée définitivement');
    } catch (e) { next(e); }
  };
}

export const periodeController = new PeriodeController();