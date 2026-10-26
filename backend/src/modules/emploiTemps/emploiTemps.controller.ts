// backend/src/modules/emploiTemps/emploiTemps.controller.ts

import { Request, Response, NextFunction } from 'express';
import { emploiTempsService } from './emploiTemps.service';
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

export class EmploiTempsController {
  checkConflits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await emploiTempsService.checkConflits(ctx, req.body);
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await emploiTempsService.create(ctx, req.body);
      sendSuccess(res, data, 'Créneau d\'emploi du temps créé', 201);
    } catch (e) { next(e); }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;
      const result = await emploiTempsService.findAll(ctx, {
        page: q.page ?? 1,
        limit: q.limit ?? 100,
        search: q.search,
        classeId: q.classeId,
        enseignantId: q.enseignantId,
        matiereId: q.matiereId,
        anneeScolaireId: q.anneeScolaireId,
        jour: q.jour,
        estActive: q.estActive,
        sortBy: q.sortBy ?? 'heureDebut',
        sortOrder: q.sortOrder ?? 'asc',
      });
      res.json({ success: true, ...result });
    } catch (e) { next(e); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await emploiTempsService.findById(ctx, getParam(req, 'id'));
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  listByClasse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const classeId = getParam(req, 'classeId');
      const q: any = (req as any).validated?.query ?? req.query;
      const data = await emploiTempsService.findByClasse(
        ctx,
        classeId,
        q.anneeScolaireId
      );
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  listByEnseignant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const enseignantId = getParam(req, 'enseignantId');
      const q: any = (req as any).validated?.query ?? req.query;
      const data = await emploiTempsService.findByEnseignant(
        ctx,
        enseignantId,
        q.anneeScolaireId
      );
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  listByEleve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const eleveId = getParam(req, 'eleveId');
      const data = await emploiTempsService.findByEleve(ctx, eleveId);
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await emploiTempsService.update(ctx, getParam(req, 'id'), req.body);
      sendSuccess(res, data, 'Créneau mis à jour');
    } catch (e) { next(e); }
  };

  toggleActif = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await emploiTempsService.toggleActif(ctx, getParam(req, 'id'));
      sendSuccess(res, data, data.estActive ? 'Créneau activé' : 'Créneau désactivé');
    } catch (e) { next(e); }
  };

  dupliquer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const body = req.body ?? {};
      const data = await emploiTempsService.dupliquer(
        ctx,
        getParam(req, 'id'),
        body.targetJour
      );
      sendSuccess(res, data, 'Créneau dupliqué', 201);
    } catch (e) { next(e); }
  };

  softDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const result = await emploiTempsService.softDelete(ctx, getParam(req, 'id'));
      sendSuccess(res, result, 'Créneau désactivé');
    } catch (e) { next(e); }
  };

  hardDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const result = await emploiTempsService.hardDelete(ctx, getParam(req, 'id'));
      sendSuccess(res, result, 'Créneau supprimé définitivement');
    } catch (e) { next(e); }
  };
}

export const emploiTempsController = new EmploiTempsController();