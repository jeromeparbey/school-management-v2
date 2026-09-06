// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 Erreur:', err);

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 400,
      message: 'Erreur de validation',
      errors: err.errors,
      timestamp: new Date().toISOString(),
    });
  }

  // Erreurs Prisma
  if (err.code && err.code.startsWith('P')) {
    const prismaErrors: Record<string, { status: number; message: string }> = {
      P2002: { status: 409, message: 'Un enregistrement avec ces données existe déjà' },
      P2025: { status: 404, message: 'Enregistrement non trouvé' },
      P2003: { status: 400, message: 'Violation de contrainte de clé étrangère' },
      P2014: { status: 400, message: 'Violation de contrainte de relation' },
    };

    const prismaError = prismaErrors[err.code];
    if (prismaError) {
      return res.status(prismaError.status).json({
        status: prismaError.status,
        message: prismaError.message,
        code: err.code,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 401,
      message: 'Token invalide ou expiré',
      timestamp: new Date().toISOString(),
    });
  }

  // Erreur par défaut
  const status = err.status || 500;
  const response: any = {
    status,
    message: err.message || 'Erreur interne du serveur',
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};