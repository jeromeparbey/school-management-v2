// backend/src/modules/affectation/affectation.controller.ts

import { Request, Response, NextFunction } from 'express';
import { affectationService } from './affectation.service';
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

export class AffectationController {
  // ══════════════════════════════════════════
  // ⭐ GET /moi/affectation/me
  // Retourne les affectations de l'enseignant connecté.
  // L'enseignantId provient EXCLUSIVEMENT de `req.user.enseignantId` (JWT).
  // Impossible de lire les affectations d'un autre enseignant via cette route.
  // ══════════════════════════════════════════

  getMine = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);

      const enseignantId = req.user?.enseignantId;
      if (!enseignantId) {
        throw new AppError(
          'Aucun profil enseignant lié à ce compte utilisateur',
          404
        );
      }

      const q: any = (req as any).validated?.query ?? req.query;
      const anneeScolaireId =
        typeof q.anneeScolaireId === 'string' ? q.anneeScolaireId : undefined;

      const data = await affectationService.findByEnseignant(
        ctx,
        enseignantId,
        anneeScolaireId
      );

      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  // ══════════════════════════════════════════
  // Routes admin existantes (inchangées)
  // ══════════════════════════════════════════

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await affectationService.create(ctx, req.body);
      sendSuccess(res, data, 'Affectation créée avec succès', 201);
    } catch (e) { next(e); }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;
      const result = await affectationService.findAll(ctx, {
        page: q.page ?? 1,
        limit: q.limit ?? 50,
        search: q.search,
        enseignantId: q.enseignantId,
        classeId: q.classeId,
        matiereId: q.matiereId,
        anneeScolaireId: q.anneeScolaireId,
        estActive: q.estActive,
        estPrincipal: q.estPrincipal,
        sortBy: q.sortBy ?? 'createdAt',
        sortOrder: q.sortOrder ?? 'desc',
      });
      res.json({ success: true, ...result });
    } catch (e) { next(e); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await affectationService.findById(ctx, getParam(req, 'id'));
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  listByEnseignant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const enseignantId = getParam(req, 'enseignantId');
      const q: any = (req as any).validated?.query ?? req.query;
      const data = await affectationService.findByEnseignant(
        ctx,
        enseignantId,
        q.anneeScolaireId
      );
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  listByClasse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const classeId = getParam(req, 'classeId');
      const data = await affectationService.findByClasse(ctx, classeId);
      sendSuccess(res, data);
    } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await affectationService.update(ctx, getParam(req, 'id'), req.body);
      sendSuccess(res, data, 'Affectation mise à jour');
    } catch (e) { next(e); }
  };

  softDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const result = await affectationService.softDelete(ctx, getParam(req, 'id'));
      sendSuccess(res, result, 'Affectation désactivée');
    } catch (e) { next(e); }
  };

  hardDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const result = await affectationService.hardDelete(ctx, getParam(req, 'id'));
      sendSuccess(res, result, 'Affectation supprimée définitivement');
    } catch (e) { next(e); }
  };
}

export const affectationController = new AffectationController();