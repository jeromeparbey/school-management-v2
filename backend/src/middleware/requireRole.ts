// backend/src/middleware/requireRole.ts

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * ⚠️ Ne PAS redéclarer `Express.Request.user` ici.
 * Le type est centralisé dans `backend/src/types/express.d.ts`.
 *
 * Champs disponibles sur `req.user` (via AuthUserPayload) :
 *   - userId: string
 *   - email?: string
 *   - role: RoleUtilisateur | RoleGlobal
 *   - type: 'access'
 *   - scope: 'GLOBAL' | 'TENANT'
 *   - etablissementId?: string
 *   - schemaName?: string
 */

// ─────────────────────────────────────────────────────────
// Options
// ─────────────────────────────────────────────────────────

interface RequireRoleOptions {
  /**
   * Si fourni, exige que l'utilisateur soit de ce scope.
   * - 'GLOBAL' : SUPER_ADMIN / ADMIN_SYSTEME (catalogue)
   * - 'TENANT' : utilisateurs d'un établissement (DIRECTEUR, ENSEIGNANT, ...)
   *
   * ⚠️ Si `strictScope` est fourni et que `req.user.scope` est `undefined`
   * (ex: ancien token JWT émis avant l'ajout du scope), l'accès est REFUSÉ.
   */
  strictScope?: 'GLOBAL' | 'TENANT';
}

// ─────────────────────────────────────────────────────────
// requireRole — autorisation par rôle (+ scope optionnel)
// ─────────────────────────────────────────────────────────

/**
 * Middleware d'autorisation par rôle.
 *
 * @example
 * router.use(authMiddleware, requireRole(['SUPER_ADMIN']));
 * router.use(
 *   authMiddleware,
 *   requireRole(['SUPER_ADMIN', 'ADMIN_SYSTEME'], { strictScope: 'GLOBAL' })
 * );
 * router.use(
 *   authMiddleware,
 *   requireRole(['DIRECTEUR', 'SECRETAIRE'], { strictScope: 'TENANT' })
 * );
 */
export const requireRole = (
  rolesAutorises: string[],
  options?: RequireRoleOptions
) => {
  // Garde-fou au moment de la construction du middleware
  if (!rolesAutorises || rolesAutorises.length === 0) {
    throw new Error(
      '[requireRole] rolesAutorises ne peut pas être vide (sinon = tout le monde passe)'
    );
  }

  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // 1. Authentification obligatoire (authMiddleware doit passer AVANT)
      if (!req.user) {
        throw new AppError('Non authentifié', 401);
      }

      const { role, scope } = req.user;

      // 2. Vérification du scope (GLOBAL vs TENANT) si demandé
      if (options?.strictScope) {
        if (!scope) {
          // Sécurité : token ancien sans `scope` → on refuse
          throw new AppError(
            'Token invalide : scope utilisateur manquant. Reconnectez-vous.',
            401
          );
        }
        if (scope !== options.strictScope) {
          throw new AppError(
            `Accès réservé aux utilisateurs de scope ${options.strictScope}`,
            403
          );
        }
      }

      // 3. Vérification du rôle
      if (!role || !rolesAutorises.includes(role)) {
        throw new AppError(
          `Accès refusé. Rôles autorisés : ${rolesAutorises.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error as Error);
    }
  };
};

// ─────────────────────────────────────────────────────────
// requireAllRoles — exige TOUS les rôles listés
// ─────────────────────────────────────────────────────────

/**
 * Variante : exige TOUS les rôles listés.
 * Utile si un utilisateur peut cumuler plusieurs rôles
 * (ex: un utilisateur qui serait à la fois DIRECTEUR et ENSEIGNANT).
 *
 * ⚠️ Suppose que `req.user.roles` existe (tableau multi-rôles).
 * Sinon fallback sur `req.user.role` (rôle unique).
 */
export const requireAllRoles = (roles: string[]) => {
  if (!roles || roles.length === 0) {
    throw new Error('[requireAllRoles] roles ne peut pas être vide');
  }

  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('Non authentifié', 401);
      }

      // Support multi-rôles futur : si `roles` existe, on l'utilise,
      // sinon on retombe sur le rôle unique.
      const userRoles: string[] =
        (req.user as unknown as { roles?: string[] }).roles ??
        [req.user.role].filter(Boolean);

      const ok = roles.every((r) => userRoles.includes(r));
      if (!ok) {
        throw new AppError(
          `Accès refusé. Tous les rôles suivants sont requis : ${roles.join(', ')}`,
          403
        );
      }

      next();
    } catch (e) {
      next(e as Error);
    }
  };
};