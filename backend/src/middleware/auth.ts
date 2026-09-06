// backend/src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 401,
        message: 'Token d\'authentification requis',
        code: 'MISSING_TOKEN',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'default_secret';

    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, secret) as { userId: string; role: string };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          status: 401,
          message: 'Token expiré',
          code: 'TOKEN_EXPIRED',
          timestamp: new Date().toISOString()
        });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          status: 401,
          message: 'Token invalide',
          code: 'INVALID_TOKEN',
          timestamp: new Date().toISOString()
        });
      }
      throw error;
    }

    // Vérifier que l'utilisateur existe et est actif
    const user = await prisma.utilisateur.findUnique({
      where: { 
        id: decoded.userId,
        estActif: true
      },
      select: {
        id: true,
        email: true,
        role: true,
        estActif: true
      }
    });

    if (!user) {
      return res.status(401).json({
        status: 401,
        message: 'Utilisateur non trouvé ou compte désactivé',
        code: 'USER_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware optionnel (ne bloque pas si pas de token)
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'default_secret';
      const decoded = jwt.verify(token, secret) as { userId: string; role: string };
      
      const user = await prisma.utilisateur.findUnique({
        where: { id: decoded.userId, estActif: true },
        select: { id: true, email: true, role: true }
      });

      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignorer les erreurs pour le middleware optionnel
  }
  next();
};