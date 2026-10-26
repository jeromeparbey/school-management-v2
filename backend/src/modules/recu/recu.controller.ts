// backend/src/modules/recu/recu.controller.ts

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { recuService } from './recu.service';
import { recuPDFService } from './recu-pdf.service';
import { AppError } from '../../utils/AppError';

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────

interface Ctx {
  schemaName: string;
  etablissementId: string;
  userId: string;
}

type FormatImpression = 'A4' | 'A5' | '80MM';

const VALID_FORMATS: FormatImpression[] = ['A4', 'A5', '80MM'];

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

function sendSuccess<T>(res: Response, data?: T, message?: string, status = 200) {
  return res.status(status).json({
    success: true,
    status,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    timestamp: new Date().toISOString(),
  });
}

function requireAuthContext(req: Request): Ctx {
  const schemaName = req.user?.schemaName;
  const etablissementId = req.user?.etablissementId;
  const userId = req.user?.userId;

  if (req.user?.scope === 'GLOBAL')
    throw new AppError('Endpoint réservé aux établissements', 403);
  if (!schemaName || !etablissementId)
    throw new AppError('Établissement non identifié', 400);
  if (!userId) throw new AppError('Non authentifié', 401);

  return { schemaName, etablissementId, userId };
}

function getParam(req: Request, name: string): string {
  const v = req.params[name];
  if (typeof v !== 'string' || v.length === 0)
    throw new AppError(`Paramètre "${name}" invalide`, 400);
  return v;
}

/**
 * Valide et normalise le format d'impression depuis la query string.
 * Retourne 'A4' par défaut si absent ou invalide.
 */
function parseFormat(req: Request): FormatImpression {
  const raw = (req.query.format as string | undefined)?.toUpperCase();
  if (raw && VALID_FORMATS.includes(raw as FormatImpression)) {
    return raw as FormatImpression;
  }
  return 'A4';
}

/**
 * Retourne le dossier de sortie des PDF.
 */
function getRecusOutputDir(): string {
  const dir = path.join(process.cwd(), 'recus');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// ──────────────────────────────────────────
// CONTROLLER
// ──────────────────────────────────────────

export class RecuController {
  // ──────────────────────────────────────────
  // GÉNÉRATION
  // ──────────────────────────────────────────

  /**
   * POST /recus/generer
   * Génère un reçu à partir d'un paiement existant.
   */
  generer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await recuService.generer(ctx, req.body);
      sendSuccess(res, data, 'Reçu généré avec succès', 201);
    } catch (e) {
      next(e);
    }
  };

  // ──────────────────────────────────────────
  // LECTURE
  // ──────────────────────────────────────────

  /**
   * GET /recus
   * Liste paginée des reçus avec filtres.
   */
  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const q: any = (req as any).validated?.query ?? req.query;

      const result = await recuService.findAll(ctx, {
        page: q.page ?? 1,
        limit: q.limit ?? 50,
        search: q.search,
        eleveId: q.eleveId,
        dateDebut: q.dateDebut,
        dateFin: q.dateFin,
        sortBy: q.sortBy ?? 'datePaiement',
        sortOrder: q.sortOrder ?? 'desc',
      });

      res.json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  };

  /**
   * GET /recus/:id
   * Détail d'un reçu.
   */
  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const data = await recuService.findById(ctx, getParam(req, 'id'));
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  /**
   * GET /recus/by-numero/:numero
   * Récupérer un reçu par son numéro (ex: REC-2025-000001).
   */
  getByNumero = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const numero = getParam(req, 'numero');
      const data = await recuService.findByNumero(ctx, numero);
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  /**
   * GET /recus/by-eleve/:eleveId
   * Liste des reçus d'un élève.
   */
  listByEleve = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const eleveId = getParam(req, 'eleveId');
      const data = await recuService.findByEleve(ctx, eleveId);
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  // ──────────────────────────────────────────
  // PDF MULTI-FORMAT
  // ──────────────────────────────────────────

  /**
   * GET /recus/:id/pdf?format=A4|A5|80MM
   * Télécharge le PDF du reçu au format spécifié.
   *
   * - A4 : format officiel (210 × 297 mm)
   * - A5 : format compact (148 × 210 mm)
   * - 80MM : ticket thermique (80 mm)
   *
   * Le PDF est généré à la volée si non existant.
   */
  downloadPDF = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');
      const format = parseFormat(req);

      // 1. Récupérer le reçu complet (avec snapshot)
      const recu = await recuService.findById(ctx, id);

      // 2. Déterminer le dossier de sortie
      const outputDir = getRecusOutputDir();

      // 3. Générer le PDF
      const pdfPath = await recuPDFService.genererPDF(
        recu as any,
        format,
        outputDir
      );

      // 4. Vérifier que le fichier existe réellement
      if (!fs.existsSync(pdfPath)) {
        throw new AppError('Erreur lors de la génération du PDF', 500);
      }

      // 5. Marquer le reçu comme imprimé (incrémente compteur + stocke chemin)
      try {
        await recuService.marquerImprime(ctx, id, format);
      } catch (err) {
        // Best-effort : ne pas bloquer le téléchargement si le marquage échoue
        console.warn('marquerImprime failed:', err);
      }

      // 6. Envoyer le fichier
      const fileName = `${recu.numeroRecu}-${format}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${fileName}"`
      );
      res.setHeader('Content-Length', String(fs.statSync(pdfPath).size));

      res.sendFile(pdfPath);
    } catch (e) {
      next(e);
    }
  };

  /**
   * GET /recus/:id/pdf/preview?format=A4|A5|80MM
   * Aperçu du PDF sans marquer comme imprimé (utile pour UI).
   */
  previewPDF = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');
      const format = parseFormat(req);

      const recu = await recuService.findById(ctx, id);
      const outputDir = getRecusOutputDir();

      const pdfPath = await recuPDFService.genererPDF(
        recu as any,
        format,
        outputDir
      );

      if (!fs.existsSync(pdfPath)) {
        throw new AppError('Erreur lors de la génération du PDF', 500);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${recu.numeroRecu}-${format}-preview.pdf"`
      );

      res.sendFile(pdfPath);
    } catch (e) {
      next(e);
    }
  };

  // ──────────────────────────────────────────
  // VÉRIFICATION PUBLIQUE
  // ──────────────────────────────────────────

  /**
   * GET /recus/verifier/:code?schema=tenant_xxx
   * Vérifie l'authenticité d'un reçu par son code de vérification.
   *
   * ⚠️ Route PUBLIQUE : pas d'authentification requise.
   * Le schemaName doit être passé en query string.
   */
  verifier = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const code = getParam(req, 'code');
      const schemaName =
        (req.query.schema as string | undefined) ||
        (req.body?.schema as string | undefined);

      if (!schemaName) {
        throw new AppError(
          'Le paramètre "schema" est requis pour vérifier un reçu',
          400
        );
      }

      const data = await recuService.verifier(
        { schemaName, etablissementId: '', userId: '' },
        code
      );

      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  // ──────────────────────────────────────────
  // SUPPRESSION
  // ──────────────────────────────────────────

  /**
   * DELETE /recus/:id/hard
   * Suppression définitive d'un reçu (usage rare, admin uniquement).
   */
  hardDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');

      // Supprimer également les PDF physiques
      try {
        const recu = await recuService.findById(ctx, id);
        const outputDir = getRecusOutputDir();

        const formats: FormatImpression[] = ['A4', 'A5', '80MM'];
        for (const format of formats) {
          const pdfPath = path.join(
            outputDir,
            `${recu.numeroRecu}-${format}.pdf`
          );
          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
          }
        }
      } catch (err) {
        console.warn('Impossible de supprimer les PDF:', err);
      }

      const result = await recuService.hardDelete(ctx, id);
      sendSuccess(res, result, 'Reçu supprimé définitivement');
    } catch (e) {
      next(e);
    }
  };
}

// ──────────────────────────────────────────
// EXPORT
// ──────────────────────────────────────────

export const recuController = new RecuController();