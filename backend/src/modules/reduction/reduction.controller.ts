// backend/src/modules/reduction/reduction.controller.ts

import { Request, Response, NextFunction } from 'express';
import { reductionService } from './reduction.service.js';
import { AppError } from '../../utils/AppError.js';

interface Ctx {
  schemaName: string;
  etablissementId: string;
  userId: string;
}

function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  status = 200
) {
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
  const userId = req.user?.userId;

  if (req.user?.scope === 'GLOBAL')
    throw new AppError('Endpoint réservé aux établissements', 403);
  if (!schemaName || !etablissementId)
    throw new AppError('Établissement non identifié', 400);
  if (!userId) throw new AppError('Non authentifié', 401);

  return { schemaName, etablissementId, userId };
}

function getParam(req: Request, name: string): string {
  const v = req.params[name];
  if (typeof v !== 'string' || v.length === 0)
    throw new AppError(`Paramètre "${name}" invalide`, 400);
  return v;
}

export class ReductionController {
  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await reductionService.create(ctx, req.body);
      sendSuccess(res, data, 'Réduction créée avec succès', 201);
    } catch (e) {
      next(e);
    }
  };

  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;
      const result = await reductionService.findAll(ctx, {
        page: q.page ?? 1,
        limit: q.limit ?? 50,
        search: q.search,
        eleveId: q.eleveId,
        assignmentScolariteId: q.assignmentScolariteId,
        type: q.type,
        approuvePar: q.approuvePar,
        dateDebut: q.dateDebut,
        dateFin: q.dateFin,
        sortBy: q.sortBy ?? 'createdAt',
        sortOrder: q.sortOrder ?? 'desc',
      });
      res.json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await reductionService.findById(ctx, getParam(req, 'id'));
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  listByEleve = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const eleveId = getParam(req, 'eleveId');
      const data = await reductionService.findByEleve(ctx, eleveId);
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await reductionService.update(
        ctx,
        getParam(req, 'id'),
        req.body
      );
      sendSuccess(res, data, 'Réduction mise à jour');
    } catch (e) {
      next(e);
    }
  };

  hardDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const result = await reductionService.hardDelete(
        ctx,
        getParam(req, 'id')
      );
      sendSuccess(res, result, 'Réduction supprimée définitivement');
    } catch (e) {
      next(e);
    }
  };

  stats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;
      const data = await reductionService.stats(ctx, {
        dateDebut: q.dateDebut,
        dateFin: q.dateFin,
      });
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };
}

export const reductionController = new ReductionController();