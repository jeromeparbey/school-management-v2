// backend/src/types/express.d.ts

import type { RoleUtilisateur } from '@prisma/client';

// ============================================
// TYPES DE BASE
// ============================================

export type RoleGlobal = 'SUPER_ADMIN' | 'ADMIN_SYSTEME';
export type UserScope = 'GLOBAL' | 'TENANT';

/**
 * Payload décodé du JWT et injecté dans `req.user` par le middleware.
 *
 * ⚠️ Doit rester SYNCHRONISÉ avec `AccessTokenPayload` (auth.utils.ts).
 *
 * ⭐ Ajout : identifiants métier (enseignant, élève, parent, surveillant,
 * directeur, admin) pour permettre aux controllers de résoudre le profil
 * sans requête supplémentaire.
 */
export interface AuthUserPayload {
  userId: string;
  email?: string;
  role: RoleUtilisateur | RoleGlobal;
  type: 'access';
  scope: UserScope;
  etablissementId?: string;
  schemaName?: string;

  // ⭐ Identifiants métier (facultatifs, null si non applicable)
  enseignantId?: string | null;
  eleveId?: string | null;
  parentId?: string | null;
  surveillantId?: string | null;
  directeurId?: string | null;
  adminId?: string | null;
}

// ============================================
// AUGMENTATION DES TYPES EXPRESS
// ============================================

declare global {
  namespace Express {
    /**
     * ⭐ Passport expose `req.user` via cette interface.
     * En étendant `AuthUserPayload`, on rend `req.user.enseignantId`,
     * `req.user.eleveId`, etc. accessibles partout sans cast.
     */
    interface User extends AuthUserPayload {}

    interface Request {
      rawBody?: Buffer;

      /**
       * Résultat de la validation Zod.
       * Utilisé pour récupérer `query` et `params` validés,
       * car req.query/req.params sont en lecture seule (Express 5).
       */
      validated?: {
        body?: any;
        query?: any;
        params?: any;
      };

      tenant?: {
        etablissementId: string;
        schemaName: string;
      };
    }
  }
}

export {};