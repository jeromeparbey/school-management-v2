// backend/src/middleware/validateRequest.ts

import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

/**
 * Middleware de validation Zod.
 *
 * Supporte 2 formats :
 *  1. { body, query, params } → chaque partie validée séparément
 *  2. Directement req.body (legacy)
 *
 * ⚠️ Express 5 : req.query et req.params sont en lecture seule.
 *    On ne peut PAS les réassigner. On stocke les valeurs validées
 *    dans `req.validated` (nouveau champ custom).
 */
export const validateRequest =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // On tente d'abord le format { body, query, params }
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (result.success) {
        const data = result.data as any;

        // ✅ req.body est réassignable (Express l'autorise)
        if (data.body !== undefined) req.body = data.body;

        // ✅ On stocke les valeurs validées dans req.validated
        //    (car req.query et req.params ne sont pas réassignables en Express 5)
        (req as any).validated = {
          body: data.body ?? req.body,
          query: data.query ?? req.query,
          params: data.params ?? req.params,
        };

        return next();
      }

      // Fallback : essayer directement sur req.body (legacy)
      const fallback = schema.safeParse(req.body);
      if (fallback.success) {
        req.body = fallback.data;
        return next();
      }

      // ❌ Aucun pattern ne marche → remonter les erreurs
      const issues = result.error.issues;
      res.status(400).json({
        status: 400,
        message: 'Données invalides',
        errors: issues.map((issue) => ({
          champ: issue.path.join('.') || 'body',
          message: issue.message,
        })),
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 400,
          message: 'Données invalides',
          errors: error.issues.map((issue) => ({
            champ: issue.path.join('.') || 'body',
            message: issue.message,
          })),
        });
        return;
      }
      next(error);
    }
  };