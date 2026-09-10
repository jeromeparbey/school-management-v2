// backend/src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { AuthUtils } from '../modules/auth/auth.utils';
import type { RoleUtilisateur } from '@prisma/client';

// ============================================
// TYPES
// ============================================

/**
 * Utilisateur authentifié injecté dans req.auth.
 */
export interface AuthUser {
  userId: string;
  email: string;
  role: RoleUtilisateur;
}

// ============================================
// EXTENSION DU TYPE Request (déclaration locale)
// ============================================

/**
 * On étend Request via une interface qui sera utilisée dans les middlewares.
 * Plus fiable que de toucher à Express.User global.
 */
export interface AuthRequest extends Request {
  auth?: AuthUser;
  rawBody?: Buffer;
}

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
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

// ============================================
// MIDDLEWARE PRINCIPAL
// ============================================

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return void sendAuthError(
        res,
        401,
        "Token d'authentification requis",
        'MISSING_TOKEN'
      );
    }

    let payload;
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

    const user = await prisma.utilisateur.findUnique({
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

    // ✅ On utilise req.auth (propriété custom) au lieu de req.user
    (req as AuthRequest).auth = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// ============================================
// MIDDLEWARE OPTIONNEL
// ============================================

export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return next();
    }

    const payload = AuthUtils.tryVerifyAccessToken(token);
    if (!payload) {
      return next();
    }

    const user = await prisma.utilisateur.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        estActif: true,
      },
    });

    if (user && user.estActif) {
      (req as AuthRequest).auth = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    }
  } catch {
    // Silent
  }
  next();
};

// ============================================
// MIDDLEWARE : VÉRIFICATION EMAIL
// ============================================

export const requireEmailVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.auth?.userId) {
      return void sendAuthError(res, 401, 'Non authentifié', 'UNAUTHENTICATED');
    }

    const user = await prisma.utilisateur.findUnique({
      where: { id: authReq.auth.userId },
      select: { emailVerifie: true },
    });

    if (!user?.emailVerifie) {
      return void sendAuthError(
        res,
        403,
        'Veuillez vérifier votre email avant de continuer.',
        'EMAIL_NOT_VERIFIED'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ============================================
// MIDDLEWARE : VÉRIFICATION DE RÔLES (RBAC)
// ============================================

export const requireRole =
  (...allowedRoles: RoleUtilisateur[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    if (!authReq.auth?.userId) {
      return void sendAuthError(res, 401, 'Non authentifié', 'UNAUTHENTICATED');
    }

    if (!allowedRoles.includes(authReq.auth.role)) {
      return void sendAuthError(
        res,
        403,
        'Accès refusé : permissions insuffisantes.',
        'FORBIDDEN'
      );
    }

    next();
  };

// ============================================
// HELPERS POUR LES CONTROLLERS
// ============================================

/**
 * Récupère l'utilisateur authentifié depuis la requête.
 * Lance une erreur si non authentifié.
 */
export function getAuthUser(req: Request): AuthUser {
  const authReq = req as AuthRequest;
  if (!authReq.auth) {
    throw new Error('Utilisateur non authentifié');
  }
  return authReq.auth;
}

/**
 * Récupère l'userId de l'utilisateur authentifié (ou null).
 */
export function getAuthUserId(req: Request): string | null {
  return (req as AuthRequest).auth?.userId ?? null;
}