// src/middleware/audit.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export const auditMiddleware = (basePath: string, moduleName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const user = (req as any).user;

    res.send = function (body: any) {
      // Enregistrer l'audit après la réponse
      if (user) {
        const logData = {
          utilisateurId: user.id,
          action: `${req.method} ${basePath}`,
          entite: moduleName,
          entiteId: req.params.id || req.body?.id || null,
          ancienneValeur: req.method === 'PUT' || req.method === 'PATCH' ? JSON.stringify(req.body) : null,
          nouvelleValeur: req.method === 'POST' ? JSON.stringify(req.body) : null,
          description: `Action ${req.method} sur ${moduleName}`,
          ipAdresse: req.ip,
          userAgent: req.headers['user-agent'],
          statut: res.statusCode >= 400 ? 'ECHEC' : 'SUCCES',
          metadonnees: {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
          },
        };

        // Log asynchrone sans bloquer la réponse
        prisma.logAudit.create({ data: logData }).catch((error) => {
          console.error('Erreur lors de la création du log d\'audit:', error);
        });
      }

      return originalSend.call(this, body);
    };

    next();
  };
};