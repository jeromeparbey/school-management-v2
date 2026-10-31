// backend/src/modules/classe/classe.controller.ts

import { Request, Response, NextFunction } from 'express';
import { classeService } from './classe.service.js';
import { AppError } from '../../utils/AppError.js';

// ──────────────────────────────────────────
// Helpers (identiques au pattern utilisateur)
// ──────────────────────────────────────────

interface ClasseContext {
  schemaName: string;
  etablissementId: string;
}

function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  status = 200
): Response {
  return res.status(status).json({
    success: true,
    status,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    timestamp: new Date().toISOString(),
  });
}

function requireAuthContext(req: Request): ClasseContext {
  const schemaName = req.user?.schemaName;
  const etablissementId = req.user?.etablissementId;
  const scope = req.user?.scope;

  if (scope === 'GLOBAL') {
    throw new AppError(
      'Cet endpoint est réservé aux utilisateurs d’un établissement',
      403
    );
  }
  if (!schemaName || !etablissementId) {
    throw new AppError('Établissement non identifié', 400);
  }
  return { schemaName, etablissementId };
}

function getParam(req: Request, name: string): string {
  const v = req.params[name];
  if (typeof v !== 'string' || v.length === 0) {
    throw new AppError(`Paramètre "${name}" invalide`, 400);
  }
  return v;
}

// ──────────────────────────────────────────
// Controller
// ──────────────────────────────────────────

export class ClasseController {
  // ────────── CREATE ──────────

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const body = req.body ?? {};

      const data = await classeService.create(ctx, {
        nom: body.nom,
        code: body.code,
        capacite: body.capacite ?? null,
        salle: body.salle ?? null,
        anneeScolaireId: body.anneeScolaireId,
        niveauId: body.niveauId,
        estActive: body.estActive ?? true,
      });

      sendSuccess(res, data, 'Classe créée avec succès', 201);
    } catch (e) {
      next(e);
    }
  };

  // ────────── LIST ──────────

  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;

      const result = await classeService.findAll(ctx, {
        page: q.page ?? 1,
        limit: q.limit ?? 20,
        search: q.search,
        anneeScolaireId: q.anneeScolaireId,
        niveauId: q.niveauId,
        estActive: q.estActive,
        estArchive: q.estArchive,
        sortBy: q.sortBy ?? 'createdAt',
        sortOrder: q.sortOrder ?? 'desc',
      });

      res.json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  };

  // ────────── GET BY ID ──────────

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');
      const data = await classeService.findById(ctx, id);
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  // ────────── LIST BY ANNEE ──────────

  listByAnnee = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const anneeScolaireId = getParam(req, 'anneeScolaireId');

      const data = await classeService.listByAnnee(ctx, anneeScolaireId);
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  // ────────── LIST ELEVES ──────────

  listEleves = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');

      const data = await classeService.listEleves(ctx, id);
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  // ────────── STATISTIQUES ──────────

  statistiques = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');

      const data = await classeService.statistiques(ctx, id);
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  // ────────── UPDATE ──────────

  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');
      const body = req.body ?? {};

      const data = await classeService.update(ctx, id, {
        nom: body.nom,
        code: body.code,
        capacite: body.capacite,
        salle: body.salle,
        anneeScolaireId: body.anneeScolaireId,
        niveauId: body.niveauId,
        estActive: body.estActive,
        estArchive: body.estArchive,
      });

      sendSuccess(res, data, 'Classe mise à jour avec succès');
    } catch (e) {
      next(e);
    }
  };

  // ────────── SOFT DELETE ──────────

  softDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');

      const result = await classeService.softDelete(ctx, id);
      sendSuccess(res, result, 'Classe archivée (soft delete)');
    } catch (e) {
      next(e);
    }
  };

  // ────────── HARD DELETE ──────────

  hardDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');

      const result = await classeService.hardDelete(ctx, id);
      sendSuccess(res, result, 'Classe supprimée définitivement');
    } catch (e) {
      next(e);
    }
  };
}

// ──────────────────────────────────────────
// Export unique
// ──────────────────────────────────────────

export const classeController = new ClasseController();