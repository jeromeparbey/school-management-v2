// backend/src/modules/planScolarite/planScolarite.controller.ts

import { Request, Response, NextFunction } from 'express';
import { planScolariteService } from './planScolarite.service.js';
import { AppError } from '../../utils/AppError.js';

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

export class PlanScolariteController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await planScolariteService.create(ctx, req.body);
      sendSuccess(res, data, 'Plan de scolarité créé avec succès', 201);
    } catch (e) { next(e); }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;
      const result = await planScolariteService.findAll(ctx, {
        page: q.page ?? 1,
        limit: q.limit ?? 50,
        search: q.search,
        anneeScolaireId: q.anneeScolaireId,
        niveauId: q.niveauId,
        classeId: q.classeId,
        estActif: q.estActif,
        sortBy: q.sortBy ?? 'createdAt',
        sortOrder: q.sortOrder ?? 'desc',
      });
      res.json({ success: true, ...result });
    } catch (e) { next(e); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await planScolariteService.findById(ctx, getParam(req, 'id'));
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await planScolariteService.update(ctx, getParam(req, 'id'), req.body);
      sendSuccess(res, data, 'Plan de scolarité mis à jour');
    } catch (e) { next(e); }
  };

  hardDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const result = await planScolariteService.hardDelete(ctx, getParam(req, 'id'));
      sendSuccess(res, result, 'Plan de scolarité supprimé définitivement');
    } catch (e) { next(e); }
  };
}

export const planScolariteController = new PlanScolariteController();