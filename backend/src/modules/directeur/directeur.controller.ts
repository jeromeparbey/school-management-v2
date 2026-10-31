// backend/src/modules/directeur/directeur.controller.ts

import { Request, Response, NextFunction } from 'express';
import { directeurService } from './directeur.service.js';
import { AppError } from '../../utils/AppError.js';
import { globalPrisma } from '../../config/global-db.js';
import { getTenantClient } from '../../config/tenant-db.js';

// ============================================================
// HELPERS
// ============================================================

/**
 * Résout le `schemaName` pour une requête ciblée (getById, update, delete...).
 *
 *  - Scope TENANT → schemaName est dans le JWT.
 *  - Scope GLOBAL (SUPER_ADMIN) :
 *      • Si `etablissementId` est fourni (query/body/params) → utilise-le.
 *      • Sinon → cherche automatiquement dans TOUS les schémas le directeur
 *        dont l'ID est `req.params.id` (fallback "auto-discovery").
 */
async function resolveSchemaNameForDirecteur(req: Request): Promise<string> {
  const user = req.user;
  if (!user) {
    throw new AppError('Non authentifié', 401);
  }

  // ── Scope TENANT : schemaName dans le JWT
  if (user.scope === 'TENANT' && user.schemaName) {
    return user.schemaName;
  }

  // ── Scope GLOBAL (SUPER_ADMIN)
  if (user.scope === 'GLOBAL') {
    const explicitEtablissementId =
      (req.query.etablissementId as string) ||
      (req.body?.etablissementId as string) ||
      (req.params.etablissementId as string);

    // 1. Si etablissementId fourni → lookup direct
    if (explicitEtablissementId) {
      const etab = await globalPrisma.etablissement.findUnique({
        where: { id: explicitEtablissementId },
        select: { schemaName: true, statutProvisionnement: true, estActif: true },
      });
      if (!etab) throw new AppError('Établissement introuvable', 404);
      if (!etab.estActif) throw new AppError('Établissement inactif', 403);
      if (etab.statutProvisionnement !== 'TERMINE') {
        throw new AppError("L'établissement n'est pas encore provisionné", 400);
      }
      return etab.schemaName;
    }

    // 2. Sinon → chercher le directeur dans TOUS les schémas (auto-discovery)
    const directeurId = req.params.id;
    if (!directeurId || typeof directeurId !== 'string') {
      throw new AppError(
        "Paramètre 'id' requis ou 'etablissementId' manquant.",
        400
      );
    }

    const schemaName = await findSchemaNameByDirecteurId(directeurId);
    if (!schemaName) {
      throw new AppError('Directeur introuvable dans tous les établissements', 404);
    }
    return schemaName;
  }

  throw new AppError('Scope utilisateur inconnu', 400);
}

/**
 * Cherche dans TOUS les établissements provisionnés le schéma qui contient
 * un Utilisateur DIRECTEUR avec l'ID donné.
 * Retourne le `schemaName` ou `null`.
 */
async function findSchemaNameByDirecteurId(
  directeurId: string
): Promise<string | null> {
  const etablissements = await globalPrisma.etablissement.findMany({
    where: { estActif: true, statutProvisionnement: 'TERMINE' },
    select: { schemaName: true },
  });

  for (const etab of etablissements) {
    try {
      const tenantClient = await getTenantClient(etab.schemaName);
      if (!tenantClient) continue;

      const found = await tenantClient.utilisateur.findFirst({
        where: { id: directeurId, role: 'DIRECTEUR' },
        select: { id: true },
      });
      if (found) return etab.schemaName;
    } catch (err) {
      console.warn(
        `⚠️ [findSchemaNameByDirecteurId] ${etab.schemaName}:`,
        (err as Error).message
      );
      continue;
    }
  }
  return null;
}

function getIdParam(req: Request): string {
  const id = req.params.id;
  if (typeof id !== 'string' || id.length === 0) {
    throw new AppError('Paramètre "id" invalide', 400);
  }
  return id;
}

// ============================================================
// CONTROLLER
// ============================================================

export const directeurController = {
  // ─────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) throw new AppError('Non authentifié', 401);

      // Le SUPER_ADMIN DOIT fournir `etablissementId` pour créer (il faut savoir où)
      let schemaName: string;

      if (user.scope === 'TENANT' && user.schemaName) {
        schemaName = user.schemaName;
      } else if (user.scope === 'GLOBAL') {
        const etablissementId =
          (req.body?.etablissementId as string) ||
          (req.query.etablissementId as string);

        if (!etablissementId) {
          throw new AppError(
            "Pour créer un directeur, un SUPER_ADMIN doit fournir 'etablissementId' (body ou query).",
            400
          );
        }
        const etab = await globalPrisma.etablissement.findUnique({
          where: { id: etablissementId },
          select: { schemaName: true, statutProvisionnement: true, estActif: true },
        });
        if (!etab) throw new AppError('Établissement introuvable', 404);
        if (!etab.estActif) throw new AppError('Établissement inactif', 403);
        if (etab.statutProvisionnement !== 'TERMINE') {
          throw new AppError("L'établissement n'est pas encore provisionné", 400);
        }
        schemaName = etab.schemaName;
      } else {
        throw new AppError('Scope utilisateur inconnu', 400);
      }

      const { etablissementId, ...data } = req.body;
      const result = await directeurService.create(schemaName, data);
      res.status(201).json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },

  // ─────────────────────────────────────────────────────
  // LIST — 2 modes selon le scope
  // ─────────────────────────────────────────────────────
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) throw new AppError('Non authentifié', 401);

      // ── Mode SUPER_ADMIN (GLOBAL) → liste globale
      if (user.scope === 'GLOBAL') {
        const { etablissementId, page, limit, search, estActif } =
          req.query as any;

        const result = await directeurService.findAllGlobal({
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 50,
          search: search as string | undefined,
          estActif: estActif !== undefined ? estActif === 'true' : undefined,
          etablissementId: etablissementId as string | undefined,
        });
        return void res.json({ success: true, ...result });
      }

      // ── Mode TENANT → liste locale
      const schemaName = await resolveSchemaNameForDirecteur(req);
      const { etablissementId, ...query } = req.query;
      const result = await directeurService.findAll(schemaName, query);
      res.json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  },

  // ─────────────────────────────────────────────────────
  // DETAIL — auto-discovery pour SUPER_ADMIN
  // ─────────────────────────────────────────────────────
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const schemaName = await resolveSchemaNameForDirecteur(req);
      const id = getIdParam(req);
      const data = await directeurService.findById(schemaName, id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  // ─────────────────────────────────────────────────────
  // UPDATE — auto-discovery pour SUPER_ADMIN
  // ─────────────────────────────────────────────────────
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const schemaName = await resolveSchemaNameForDirecteur(req);
      const id = getIdParam(req);
      const { etablissementId, ...data } = req.body;

      const result = await directeurService.update(schemaName, id, data);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },

  // ─────────────────────────────────────────────────────
  // TOGGLE — auto-discovery pour SUPER_ADMIN
  // ─────────────────────────────────────────────────────
  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const schemaName = await resolveSchemaNameForDirecteur(req);
      const id = getIdParam(req);
      const data = await directeurService.toggleActif(
        schemaName,
        id,
        req.body.estActif
      );
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  // ─────────────────────────────────────────────────────
  // CHANGE PASSWORD — auto-discovery pour SUPER_ADMIN
  // ─────────────────────────────────────────────────────
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const schemaName = await resolveSchemaNameForDirecteur(req);
      const id = getIdParam(req);
      const data = await directeurService.changePassword(
        schemaName,
        id,
        req.body.nouveauMotDePasse
      );
      res.json({ success: true, data, message: 'Mot de passe changé' });
    } catch (e) {
      next(e);
    }
  },

  // ─────────────────────────────────────────────────────
  // DELETE — auto-discovery pour SUPER_ADMIN
  // ─────────────────────────────────────────────────────
  async hardDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const schemaName = await resolveSchemaNameForDirecteur(req);
      const id = getIdParam(req);
      await directeurService.hardDelete(schemaName, id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
};