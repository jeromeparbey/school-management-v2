// backend/src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { globalPrisma } from '../config/global-db';
import { getTenantClient } from '../config/tenant-db';
import { AuthUtils } from '../modules/auth/auth.utils';
import type { UserScope } from '../types/express';

// ============================================
// HELPERS
// ============================================

function sendAuthError(
  res: Response,
  status: number,
  message: string,
  code: string
): Response {
  return res.status(status).json({
    status,
    message,
    code,
    timestamp: new Date().toISOString(),
  });
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

// ============================================
// AUTH MIDDLEWARE — Multi-scope (GLOBAL / TENANT)
// ============================================

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // ─── 1. Extraire le token ───
    const token = extractBearerToken(req);
    if (!token) {
      return void sendAuthError(
        res,
        401,
        "Token d'authentification requis",
        'MISSING_TOKEN'
      );
    }

    // ─── 2. Vérifier & décoder le JWT ───
    let payload: any;
    try {
      payload = AuthUtils.verifyAccessToken(token);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return void sendAuthError(res, 401, 'Token expiré', 'TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return void sendAuthError(res, 401, 'Token invalide', 'INVALID_TOKEN');
      }
      throw error;
    }

    // ─── 3. Vérifier le scope (obligatoire) ───
    const scope = payload.scope as UserScope | undefined;
    if (!scope) {
      return void sendAuthError(
        res,
        401,
        'Token invalide : scope manquant. Reconnectez-vous.',
        'MISSING_SCOPE'
      );
    }

    // ═══════════════════════════════════════════════════════
    // 4a. SCOPE = GLOBAL → SUPER_ADMIN / ADMIN_SYSTEME
    // ═══════════════════════════════════════════════════════
    if (scope === 'GLOBAL') {
      const user = await globalPrisma.utilisateurGlobal.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          estActif: true,
        },
      });

      if (!user) {
        return void sendAuthError(
          res,
          401,
          'Utilisateur non trouvé',
          'USER_NOT_FOUND'
        );
      }
      if (!user.estActif) {
        return void sendAuthError(
          res,
          403,
          "Compte désactivé. Contactez l'administrateur.",
          'ACCOUNT_DISABLED'
        );
      }

      // ✅ Injection dans req.user (standard Express)
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role as any,
        type: 'access',
        scope: 'GLOBAL',
      };

      return next();
    }

    // ═══════════════════════════════════════════════════════
    // 4b. SCOPE = TENANT → Utilisateur d'un établissement
    // ═══════════════════════════════════════════════════════
    if (scope === 'TENANT') {
      const schemaName = payload.schemaName as string | undefined;
      const etablissementId = payload.etablissementId as string | undefined;

      if (!schemaName) {
        return void sendAuthError(
          res,
          401,
          'Token invalide : schemaName manquant.',
          'MISSING_SCHEMA'
        );
      }
      if (!etablissementId) {
        return void sendAuthError(
          res,
          401,
          'Token invalide : etablissementId manquant.',
          'MISSING_ETABLISSEMENT'
        );
      }

      const tenantClient = await getTenantClient(schemaName);
      if (!tenantClient) {
        return void sendAuthError(
          res,
          500,
          `Client Prisma introuvable pour le tenant "${schemaName}".`,
          'TENANT_CLIENT_ERROR'
        );
      }

      const user = await tenantClient.utilisateur.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          estActif: true,
        },
      });

      if (!user) {
        return void sendAuthError(res, 401, 'Utilisateur non trouvé', 'USER_NOT_FOUND');
      }
      if (!user.estActif) {
        return void sendAuthError(
          res,
          403,
          "Compte désactivé. Contactez l'administrateur.",
          'ACCOUNT_DISABLED'
        );
      }

      // ✅ Injection dans req.user
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role as any,
        type: 'access',
        scope: 'TENANT',
        etablissementId,
        schemaName,
      };

      // Contexte tenant (utilisé par certains controllers)
      (req as any).tenant = { etablissementId, schemaName };

      return next();
    }

    // ─── Scope inconnu ───
    return void sendAuthError(
      res,
      401,
      `Scope inconnu : ${scope}`,
      'UNKNOWN_SCOPE'
    );
  } catch (error) {
    next(error);
  }
};

// ============================================
// AUTH OPTIONNEL
// ============================================

export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractBearerToken(req);
    if (!token) return next();

    const payload = AuthUtils.tryVerifyAccessToken(token);
    if (!payload || !payload.scope) return next();

    const scope = payload.scope as UserScope;

    if (scope === 'GLOBAL') {
      const user = await globalPrisma.utilisateurGlobal.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, estActif: true },
      });
      if (user && user.estActif) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role as any,
          type: 'access',
          scope: 'GLOBAL',
        };
      }
    } else if (scope === 'TENANT' && payload.schemaName && payload.etablissementId) {
      const tenantClient = await getTenantClient(payload.schemaName);
      if (tenantClient) {
        const user = await tenantClient.utilisateur.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, role: true, estActif: true },
        });
        if (user && user.estActif) {
          req.user = {
            userId: user.id,
            email: user.email,
            role: user.role as any,
            type: 'access',
            scope: 'TENANT',
            etablissementId: payload.etablissementId,
            schemaName: payload.schemaName,
          };
          (req as any).tenant = {
            etablissementId: payload.etablissementId,
            schemaName: payload.schemaName,
          };
        }
      }
    }
  } catch {
    // Silent
  }
  next();
};

// ============================================
// HELPERS POUR LES CONTROLLERS
// ============================================

export function getAuthUser(req: Request) {
  if (!req.user) {
    throw new Error('Utilisateur non authentifié');
  }
  return req.user;
}

export function getAuthUserId(req: Request): string | null {
  return req.user?.userId ?? null;
}