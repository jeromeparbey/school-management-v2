// backend/src/modules/mon-etablissement/mon-etablissement.controller.ts

import { Request, Response, NextFunction } from 'express';
import { monEtablissementService } from './mon-etablissement.service';
import { AppError } from '../../utils/AppError';

interface ApiSuccess<T = unknown> {
  status: number;
  message?: string;
  data?: T;
  timestamp: string;
}

function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  status = 200
): Response {
  const payload: ApiSuccess<T> = {
    status,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    timestamp: new Date().toISOString(),
  };
  return res.status(status).json(payload);
}

export class MonEtablissementController {
  /**
   * GET /mon-etablissement
   * Récupère l'établissement du directeur connecté.
   * Le `etablissementId` vient du JWT (req.user.etablissementId).
   */
  getMonEtablissement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const etablissementId = req.user?.etablissementId;

      if (!etablissementId) {
        throw new AppError(
          "Impossible d'identifier votre établissement",
          400
        );
      }

      const etablissement = await monEtablissementService.getMonEtablissement(
        etablissementId
      );

      sendSuccess(res, etablissement, 'Établissement récupéré');
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /mon-etablissement
   * Met à jour l'établissement du directeur connecté.
   * ⚠️ Champs immuables : code, schemaName, planAbonnement, maxUtilisateurs
   */
  updateMonEtablissement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const etablissementId = req.user?.etablissementId;

      if (!etablissementId) {
        throw new AppError(
          "Impossible d'identifier votre établissement",
          400
        );
      }

      const etablissement =
        await monEtablissementService.updateMonEtablissement(
          etablissementId,
          req.body
        );

      sendSuccess(
        res,
        etablissement,
        'Établissement mis à jour avec succès'
      );
    } catch (error) {
      next(error);
    }
  };
}

export const monEtablissementController = new MonEtablissementController();