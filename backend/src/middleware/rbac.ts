// backend/src/middleware/rbac.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware RBAC (Role-Based Access Control).
 * Vérifie que `req.user.role` est dans la liste des rôles autorisés.
 */
export const rbacMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 1. Utilisateur authentifié ?
    if (!req.user) {
      res.status(401).json({
        status: 401,
        message: 'Non authentifié',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 2. Rôle autorisé ?
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 403,
        message: `Accès refusé. Rôle requis: ${allowedRoles.join(', ')}`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};