// backend/src/modules/echeance/echeance.controller.ts

import { Request, Response, NextFunction } from 'express';
import { echeanceService } from './echeance.service.js';
import { AppError } from '../../utils/AppError.js';

interface Ctx {
  schemaName: string;
  etablissementId: string;
}

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

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

/** Coercition sûre d'un entier positif avec fallback. */
function getIntQuery(
  raw: unknown,
  fallback: number,
  opts?: { min?: number; max?: number }
): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  const min = opts?.min ?? 1;
  const max = opts?.max ?? Number.MAX_SAFE_INTEGER;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

/** Coercition booléenne (pour estPayee notamment). */
function getBoolQuery(raw: unknown): boolean | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (typeof raw === 'boolean') return raw;
  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  return undefined;
}

// ──────────────────────────────────────────
// CONSTANTES DE VALIDATION
// ──────────────────────────────────────────

const STATUTS_ELEVE_VALIDES = [
  'PAYEE',
  'PARTIELLE',
  'IMPAYEE',
  'EN_RETARD',
  'all',
] as const;

const SORT_BY_ELEVES_VALIDES = ['restant', 'nom', 'statut', 'paye'] as const;

const SORT_BY_ECHEANCES_VALIDES = [
  'ordre',
  'nom',
  'montant',
  'dateLimite',
  'createdAt',
] as const;

// ──────────────────────────────────────────
// CONTROLLER
// ──────────────────────────────────────────

export class EcheanceController {
  // ══════════════════════════════════════════
  // CREATE
  // ══════════════════════════════════════════

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await echeanceService.create(ctx, req.body);
      sendSuccess(res, data, 'Échéance créée avec succès', 201);
    } catch (e) {
      next(e);
    }
  };

  // ══════════════════════════════════════════
  // LIST (échéances)
  // ══════════════════════════════════════════

  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const raw: any = (req as any).validated?.query ?? req.query;

      const page = getIntQuery(raw.page, 1, { min: 1 });
      const limit = getIntQuery(raw.limit, 50, { min: 1, max: 200 });

      const sortBy =
        typeof raw.sortBy === 'string' &&
        (SORT_BY_ECHEANCES_VALIDES as readonly string[]).includes(raw.sortBy)
          ? raw.sortBy
          : 'ordre';

      const sortOrder = raw.sortOrder === 'desc' ? 'desc' : 'asc';

      const result = await echeanceService.findAll(ctx, {
        page,
        limit,
        search: typeof raw.search === 'string' ? raw.search : undefined,
        planScolariteId:
          typeof raw.planScolariteId === 'string'
            ? raw.planScolariteId
            : undefined,
        estPayee: getBoolQuery(raw.estPayee),
        sortBy,
        sortOrder,
      });

      res.json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  };

  // ══════════════════════════════════════════
  // GET BY ID
  // ══════════════════════════════════════════

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await echeanceService.findById(ctx, getParam(req, 'id'));
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  // ══════════════════════════════════════════
  // LIST BY PLAN
  // ══════════════════════════════════════════

  listByPlan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const planScolariteId = getParam(req, 'planScolariteId');
      const data = await echeanceService.findByPlan(ctx, planScolariteId);
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  // ══════════════════════════════════════════
  // 🆕 LIST ELEVES D'UNE ÉCHÉANCE (vue classe)
  // ══════════════════════════════════════════

  listEleves = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');
      const raw: any = (req as any).validated?.query ?? req.query;

      const page = getIntQuery(raw.page, 1, { min: 1 });
      const limit = getIntQuery(raw.limit, 50, { min: 1, max: 200 });

      const statut =
        typeof raw.statut === 'string' &&
        (STATUTS_ELEVE_VALIDES as readonly string[]).includes(raw.statut)
          ? (raw.statut as (typeof STATUTS_ELEVE_VALIDES)[number])
          : 'all';

      const sortBy =
        typeof raw.sortBy === 'string' &&
        (SORT_BY_ELEVES_VALIDES as readonly string[]).includes(raw.sortBy)
          ? (raw.sortBy as (typeof SORT_BY_ELEVES_VALIDES)[number])
          : 'restant';

      const sortOrder = raw.sortOrder === 'asc' ? 'asc' : 'desc';

      const result = await echeanceService.findEleves(ctx, id, {
        page,
        limit,
        search: typeof raw.search === 'string' ? raw.search.trim() : undefined,
        statut,
        sortBy,
        sortOrder,
      });

      // On renvoie directement { echeance, eleves, stats, pagination }
      sendSuccess(res, result);
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
      const data = await echeanceService.update(
        ctx,
        getParam(req, 'id'),
        req.body
      );
      sendSuccess(res, data, 'Échéance mise à jour');
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
      const result = await echeanceService.hardDelete(
        ctx,
        getParam(req, 'id')
      );
      sendSuccess(res, result, 'Échéance supprimée définitivement');
    } catch (e) {
      next(e);
    }
  };
}

export const echeanceController = new EcheanceController();