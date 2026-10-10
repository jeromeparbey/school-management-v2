// backend/src/types/express.d.ts

import type { RoleUtilisateur } from '@prisma/client';

export type RoleGlobal = 'SUPER_ADMIN' | 'ADMIN_SYSTEME';
export type UserScope = 'GLOBAL' | 'TENANT';

export interface AuthUserPayload {
  userId: string;
  email?: string;
  role: RoleUtilisateur | RoleGlobal;
  type: 'access';
  scope: UserScope;
  etablissementId?: string;
  schemaName?: string;
}

declare global {
  namespace Express {
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