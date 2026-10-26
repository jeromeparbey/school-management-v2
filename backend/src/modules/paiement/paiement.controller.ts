// backend/src/modules/paiement/paiement.controller.ts

import { Request, Response, NextFunction } from 'express';
import { paiementService } from './paiement.service';
import { AppError } from '../../utils/AppError';

interface Ctx {
  schemaName: string;
  etablissementId: string;
  userId: string;
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

export class PaiementController {
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await paiementService.create(ctx, req.body);
      sendSuccess(res, data, 'Paiement enregistré avec succès', 201);
    } catch (e) { next(e); }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;
      const result = await paiementService.findAll(ctx, {
        page: q.page ?? 1,
        limit: q.limit ?? 50,
        search: q.search,
        eleveId: q.eleveId,
        moyen: q.moyen,
        statut: q.statut,
        dateDebut: q.dateDebut,
        dateFin: q.dateFin,
        sortBy: q.sortBy ?? 'datePaiement',
        sortOrder: q.sortOrder ?? 'desc',
      });
      res.json({ success: true, ...result });
    } catch (e) { next(e); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await paiementService.findById(ctx, getParam(req, 'id'));
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  listByEleve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const eleveId = getParam(req, 'eleveId');
      const data = await paiementService.findByEleve(ctx, eleveId);
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await paiementService.update(ctx, getParam(req, 'id'), req.body);
      sendSuccess(res, data, 'Paiement mis à jour');
    } catch (e) { next(e); }
  };

  annuler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await paiementService.annuler(
        ctx,
        getParam(req, 'id'),
        req.body
      );
      sendSuccess(res, data, 'Paiement annulé');
    } catch (e) { next(e); }
  };

  stats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;
      const data = await paiementService.stats(ctx, {
        dateDebut: q.dateDebut,
        dateFin: q.dateFin,
      });
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  hardDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const result = await paiementService.hardDelete(ctx, getParam(req, 'id'));
      sendSuccess(res, result, 'Paiement supprimé définitivement');
    } catch (e) { next(e); }
  };
}

export const paiementController = new PaiementController();