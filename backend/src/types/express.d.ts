// backend/src/types/express.d.ts

import type { RoleUtilisateur } from '@prisma/client';

/**
 * Payload décodé du JWT d'accès.
 * Correspond au payload signé dans AuthUtils.generateAccessToken()
 */
export interface AuthUserPayload {
  userId: string;
  role: RoleUtilisateur;
  type: 'access';
}

declare global {
  namespace Express {
    /**
     * On étend l'interface User d'Express (utilisée par req.user)
     * pour inclure notre payload JWT personnalisé.
     */
    interface User extends AuthUserPayload {}

    interface Request {
      /** Corps brut de la requête (utile pour vérification de signature webhook) */
      rawBody?: Buffer;
    }
  }
}

export {};