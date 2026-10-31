// backend/src/modules/niveau/niveau.controller.ts

import { Request, Response, NextFunction } from 'express';
import { niveauService } from './niveau.service.js';
import { AppError } from '../../utils/AppError.js';

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

interface NiveauContext {
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

function requireAuthContext(req: Request): NiveauContext {
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

export class NiveauController {
  // ────────── CREATE ──────────

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const body = req.body ?? {};

      const data = await niveauService.create(ctx, {
        nom: body.nom,
        code: body.code,
        description: body.description ?? null,
        ordre: body.ordre ?? 0,
      });

      sendSuccess(res, data, 'Niveau créé avec succès', 201);
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

      const result = await niveauService.findAll(ctx, {
        page: q.page ?? 1,
        limit: q.limit ?? 20,
        search: q.search,
        sortBy: q.sortBy ?? 'ordre',
        sortOrder: q.sortOrder ?? 'asc',
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

      const data = await niveauService.findById(ctx, id);
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

      const data = await niveauService.update(ctx, id, {
        nom: body.nom,
        code: body.code,
        description: body.description,
        ordre: body.ordre,
      });

      sendSuccess(res, data, 'Niveau mis à jour avec succès');
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

      const result = await niveauService.hardDelete(ctx, id);
      sendSuccess(res, result, 'Niveau supprimé définitivement');
    } catch (e) {
      next(e);
    }
  };
}

// ──────────────────────────────────────────
// Export unique
// ──────────────────────────────────────────

export const niveauController = new NiveauController();