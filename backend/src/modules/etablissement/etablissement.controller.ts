// backend/src/modules/catalogue/etablissement/etablissement.controller.ts

import { Request, Response, NextFunction } from 'express';
import { etablissementService } from './etablissement.service';
import { AppError } from '../../utils/AppError';

/**
 * Helper : garantit qu'un paramètre de route est bien une string unique.
 * Express peut typer req.params.x en `string | string[]` → on sécurise.
 */
const getStringParam = (value: string | string[] | undefined, name: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new AppError(`Paramètre "${name}" invalide`, 400);
  }
  return value;
};

export const etablissementController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await etablissementService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

 async list(req: Request, res: Response, next: NextFunction) {
  try {
    // ⚠️ En Express 5, req.query n'est pas réassignable.
    //    On utilise les valeurs validées par validateRequest.
    const query = (req as any).validated?.query ?? req.query;
    const result = await etablissementService.findAll(query);
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
},

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getStringParam(req.params.id, 'id');
      const data = await etablissementService.findById(id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getStringParam(req.params.id, 'id');
      const data = await etablissementService.update(id, req.body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getStringParam(req.params.id, 'id');
      const data = await etablissementService.toggleActif(id, req.body.estActif);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getStringParam(req.params.id, 'id');
      const data = await etablissementService.archive(id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async hardDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getStringParam(req.params.id, 'id');
      await etablissementService.hardDelete(id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },

  async reprovisionner(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getStringParam(req.params.id, 'id');
      const data = await etablissementService.reprovisionner(id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async stats(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await etablissementService.stats();
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};