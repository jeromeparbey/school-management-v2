// src/middleware/rbac.ts
import { Request, Response, NextFunction } from 'express';

export const rbacMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        status: 401,
        message: 'Non authentifié',
        timestamp: new Date().toISOString(),
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        status: 403,
        message: `Accès refusé. Rôle requis: ${allowedRoles.join(', ')}`,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};