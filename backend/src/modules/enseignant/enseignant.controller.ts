// backend/src/modules/enseignant/enseignant.controller.ts

import { Request, Response, NextFunction } from 'express';
import { enseignantService } from './enseignant.service';
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

export class EnseignantController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await enseignantService.create(ctx, req.body);
      sendSuccess(res, data, 'Enseignant créé avec succès', 201);
    } catch (e) { next(e); }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;
      const result = await enseignantService.findAll(ctx, {
        page: q.page ?? 1,
        limit: q.limit ?? 20,
        search: q.search,
        estActif: q.estActif,
        estArchive: q.estArchive,
        typeContrat: q.typeContrat,
        hasCompte: q.hasCompte,
        sortBy: q.sortBy ?? 'createdAt',
        sortOrder: q.sortOrder ?? 'desc',
      });
      res.json({ success: true, ...result });
    } catch (e) { next(e); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await enseignantService.findById(ctx, getParam(req, 'id'));
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await enseignantService.update(ctx, getParam(req, 'id'), req.body);
      sendSuccess(res, data, 'Enseignant mis à jour');
    } catch (e) { next(e); }
  };

  softDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const result = await enseignantService.softDelete(ctx, getParam(req, 'id'));
      sendSuccess(res, result, 'Enseignant archivé');
    } catch (e) { next(e); }
  };

  hardDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const result = await enseignantService.hardDelete(ctx, getParam(req, 'id'));
      sendSuccess(res, result, 'Enseignant supprimé définitivement');
    } catch (e) { next(e); }
  };
}

export const enseignantController = new EnseignantController();