// backend/src/modules/anneeScolaire/anneeScolaire.controller.ts

import { Request, Response, NextFunction } from 'express';
import { anneeScolaireService } from './anneeScolaire.service.js';
import { AppError } from '../../utils/AppError.js';

interface AnneeScolaireContext {
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

function requireAuthContext(req: Request): AnneeScolaireContext {
  const schemaName = req.user?.schemaName;
  const etablissementId = req.user?.etablissementId;
  const scope = req.user?.scope;

  if (scope === 'GLOBAL') throw new AppError('Endpoint réservé aux établissements', 403);
  if (!schemaName || !etablissementId) throw new AppError('Établissement non identifié', 400);
  return { schemaName, etablissementId };
}

function getParam(req: Request, name: string): string {
  const v = req.params[name];
  if (typeof v !== 'string' || v.length === 0) throw new AppError(`Paramètre "${name}" invalide`, 400);
  return v;
}

export class AnneeScolaireController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await anneeScolaireService.create(ctx, req.body);
      sendSuccess(res, data, 'Année scolaire créée', 201);
    } catch (e) { next(e); }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;
      const result = await anneeScolaireService.findAll(ctx, {
        page: q.page ?? 1,
        limit: q.limit ?? 20,
        search: q.search,
        estActive: q.estActive,
        estArchive: q.estArchive,
        sortBy: q.sortBy ?? 'dateDebut',
        sortOrder: q.sortOrder ?? 'desc',
      });
      res.json({ success: true, ...result });
    } catch (e) { next(e); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await anneeScolaireService.findById(ctx, getParam(req, 'id'));
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await anneeScolaireService.findActive(ctx);
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await anneeScolaireService.update(ctx, getParam(req, 'id'), req.body);
      sendSuccess(res, data, 'Année scolaire mise à jour');
    } catch (e) { next(e); }
  };

  hardDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const result = await anneeScolaireService.hardDelete(ctx, getParam(req, 'id'));
      sendSuccess(res, result, 'Année scolaire supprimée');
    } catch (e) { next(e); }
  };
}

export const anneeScolaireController = new AnneeScolaireController();