// backend/src/modules/inscription/inscription.controller.ts

import { Request, Response, NextFunction } from 'express';
import { inscriptionService } from './inscription.service';
import { AppError } from '../../utils/AppError';

// ══════════════════════════════════════════
// TYPES & HELPERS
// ══════════════════════════════════════════

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

/**
 * ✅ requireAuthContext inclut désormais `userId`
 *    (nécessaire pour `inscrireEtPayer` → caissierId)
 */
function requireAuthContext(req: Request): Ctx {
  const schemaName = req.user?.schemaName;
  const etablissementId = req.user?.etablissementId;
 const userId = req.user?.userId;
 
  if (req.user?.scope === 'GLOBAL') {
    throw new AppError('Endpoint réservé aux établissements', 403);
  }
  if (!schemaName || !etablissementId) {
    throw new AppError('Établissement non identifié', 400);
  }
  if (!userId) {
    throw new AppError('Utilisateur non identifié', 401);
  }

  return { schemaName, etablissementId, userId };
}

function getParam(req: Request, name: string): string {
  const v = req.params[name];
  if (typeof v !== 'string' || v.length === 0) {
    throw new AppError(`Paramètre "${name}" invalide`, 400);
  }
  return v;
}

// ══════════════════════════════════════════
// CONTROLLER
// ══════════════════════════════════════════

export class InscriptionController {
  // ══════════════════════════════════════════
  // CREATE (simple)
  // ══════════════════════════════════════════

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await inscriptionService.create(ctx, req.body);
      sendSuccess(res, data, 'Inscription créée avec succès', 201);
    } catch (e) {
      next(e);
    }
  };

  // ══════════════════════════════════════════
  // 🆕 INSCRIRE + PAYER (transaction atomique)
  // ══════════════════════════════════════════

  inscrireEtPayer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await inscriptionService.inscrireEtPayer(ctx, req.body);
      sendSuccess(
        res,
        data,
        'Inscription + paiement enregistrés avec succès',
        201
      );
    } catch (e) {
      next(e);
    }
  };

  // ══════════════════════════════════════════
  // 🆕 PREVIEW (aperçu avant inscription)
  // ══════════════════════════════════════════

  preview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;

      const eleveId = q.eleveId;
      const classeId = q.classeId;
      const anneeScolaireId = q.anneeScolaireId;

      if (!eleveId || !classeId || !anneeScolaireId) {
        throw new AppError(
          'eleveId, classeId et anneeScolaireId sont requis',
          400
        );
      }

      const data = await inscriptionService.previewInscription(ctx, {
        eleveId,
        classeId,
        anneeScolaireId,
      });

      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  // ══════════════════════════════════════════
  // LIST
  // ══════════════════════════════════════════

  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;

      const result = await inscriptionService.findAll(ctx, {
        page: q.page ?? 1,
        limit: q.limit ?? 50,
        search: q.search,
        eleveId: q.eleveId,
        classeId: q.classeId,
        anneeScolaireId: q.anneeScolaireId,
        estActive: q.estActive,
        sortBy: q.sortBy ?? 'dateInscription',
        sortOrder: q.sortOrder ?? 'desc',
      });

      res.json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  };

  // ══════════════════════════════════════════
  // GET BY ID (avec détails complets)
  // ══════════════════════════════════════════

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await inscriptionService.findById(
        ctx,
        getParam(req, 'id')
      );
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  // ══════════════════════════════════════════
  // UPDATE
  // ══════════════════════════════════════════

  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await inscriptionService.update(
        ctx,
        getParam(req, 'id'),
        req.body
      );
      sendSuccess(res, data, 'Inscription mise à jour');
    } catch (e) {
      next(e);
    }
  };

  // ══════════════════════════════════════════
  // SOFT DELETE
  // ══════════════════════════════════════════

  softDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const result = await inscriptionService.softDelete(
        ctx,
        getParam(req, 'id')
      );
      sendSuccess(res, result, 'Inscription désactivée');
    } catch (e) {
      next(e);
    }
  };

  // ══════════════════════════════════════════
  // HARD DELETE
  // ══════════════════════════════════════════

  hardDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const result = await inscriptionService.hardDelete(
        ctx,
        getParam(req, 'id')
      );
      sendSuccess(res, result, 'Inscription supprimée définitivement');
    } catch (e) {
      next(e);
    }
  };
}

export const inscriptionController = new InscriptionController();