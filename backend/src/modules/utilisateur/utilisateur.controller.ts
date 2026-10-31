// backend/src/modules/utilisateur/utilisateur.controller.ts

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { utilisateurService, UtilisateurContext } from './utilisateur.service.js';
import { AppError } from '../../utils/AppError.js';
import { AuthUtils } from '../auth/auth.utils.js';
import { getTenantClient } from '../../config/tenant-db.js';
import type { RoleUtilisateur } from '@prisma/client';

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  status = 200
): Response {
  return res.status(status).json({
    success: true,
    status,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    timestamp: new Date().toISOString(),
  });
}

function requireAuthContext(req: Request): UtilisateurContext {
  const schemaName = req.user?.schemaName;
  const etablissementId = req.user?.etablissementId;
  const scope = req.user?.scope;

  if (scope === 'GLOBAL') {
    throw new AppError(
      'Cet endpoint est réservé aux utilisateurs d’un établissement',
      403
    );
  }
  if (!schemaName || !etablissementId) {
    throw new AppError('Établissement non identifié', 400);
  }
  return { schemaName, etablissementId };
}

function requireUserId(req: Request): string {
  const id = req.user?.userId;
  if (!id) throw new AppError('Non authentifié', 401);
  return id;
}

function getParam(req: Request, name: string): string {
  const v = req.params[name];
  if (typeof v !== 'string' || v.length === 0) {
    throw new AppError(`Paramètre "${name}" invalide`, 400);
  }
  return v;
}

/**
 * Supprime un fichier local si présent (sécurisé — vérifie qu'il est dans uploads/).
 */
function safeUnlink(relativeUrl: string | null | undefined): void {
  if (!relativeUrl) return;
  try {
    // relativeUrl ressemble à "/uploads/avatars/xxx.jpg"
    const rel = relativeUrl.replace(/^\/uploads\//, 'uploads/');
    const filePath = path.join(process.cwd(), rel);

    // Sécurité : on ne supprime que dans uploads/
    // ✅ CORRIGÉ : on ajoute path.sep pour empêcher "uploads-evil/..." de passer
    const uploadsRoot = path.join(process.cwd(), 'uploads');
    if (!filePath.startsWith(uploadsRoot + path.sep)) return;

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    // Nettoyage best-effort, on n'échoue pas la requête pour ça
    console.warn('safeUnlink:', (err as Error).message);
  }
}

/**
 * ✅ AJOUTÉ : nettoie le fichier qui vient d'être uploadé par multer
 * (stocké dans uploads/avatars/) quand une erreur survient après l'upload.
 */
function cleanupUploadedFile(req: Request): void {
  if (req.file?.path) {
    safeUnlink(`/uploads/avatars/${path.basename(req.file.path)}`);
  }
}

/**
 * ✅ AJOUTÉ : vérifie les "magic bytes" du fichier uploadé.
 * Le mimetype envoyé par le client est falsifiable ; on contrôle le contenu réel.
 * Formats acceptés : JPEG, PNG, GIF, WEBP.
 */
function isValidImageFile(filePath: string): boolean {
  let fd: number | undefined;
  try {
    fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(12);
    const bytesRead = fs.readSync(fd, buf, 0, 12, 0);
    if (bytesRead < 12) return false;

    // JPEG : FF D8 FF
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;

    // PNG : 89 50 4E 47 0D 0A 1A 0A
    if (
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a
    ) {
      return true;
    }

    // GIF : "GIF87a" ou "GIF89a"
    const gifHeader = buf.toString('ascii', 0, 6);
    if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') return true;

    // WEBP : "RIFF" .... "WEBP"
    if (
      buf.toString('ascii', 0, 4) === 'RIFF' &&
      buf.toString('ascii', 8, 12) === 'WEBP'
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  } finally {
    if (fd !== undefined) {
      try {
        fs.closeSync(fd);
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * Sauvegarde l'avatar d'un utilisateur + met à jour photoProfil en DB.
 * Supprime l'ancienne photo si elle existe.
 */
async function saveAvatar(
  schemaName: string,
  userId: string,
  filePath: string
): Promise<string> {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Tenant introuvable', 500);

  // Récupérer l'ancienne photo pour la supprimer
  const existing = await client.utilisateur.findUnique({
    where: { id: userId },
    select: { photoProfil: true },
  });

  // ✅ AJOUTÉ : utilisateur inexistant → 404 (le fichier uploadé sera nettoyé par le catch)
  if (!existing) {
    throw new AppError('Utilisateur introuvable', 404);
  }

  // URL relative publique (servie par /uploads)
  const relativeUrl = `/uploads/avatars/${path.basename(filePath)}`;

  await client.utilisateur.update({
    where: { id: userId },
    data: { photoProfil: relativeUrl },
  });

  // ✅ DÉPLACÉ : on supprime l'ancienne photo APRÈS la mise à jour en DB réussie
  // (avant, si l'update échouait, l'ancienne photo était déjà perdue)
  safeUnlink(existing.photoProfil);

  return relativeUrl;
}

// ──────────────────────────────────────────
// Constantes rôles
// ──────────────────────────────────────────

const ROLES_CREABLES: RoleUtilisateur[] = [
  'DIRECTEUR',
  'SECRETAIRE',
  'ENSEIGNANT',
  'SURVEILLANT',
  'PARENT',
  'ELEVE',
  'ADMIN',
  'BIBLIOTHECAIRE',
];

const ROLES_MODIFIABLES_PAR_ADMIN: RoleUtilisateur[] = [
  'SECRETAIRE',
  'ENSEIGNANT',
  'SURVEILLANT',
  'PARENT',
  'ELEVE',
  'BIBLIOTHECAIRE',
  'ADMIN',
];

// ──────────────────────────────────────────
// Controller
// ──────────────────────────────────────────

export class UtilisateurController {
  // ────────── CREATE ──────────

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const body = req.body ?? {};

      // Validations rapides
      if (!body.email || !AuthUtils.isValidEmail(body.email)) {
        throw new AppError('Email invalide', 400);
      }
      if (!body.motDePasse) throw new AppError('Mot de passe requis', 400);
      if (!body.prenom?.trim() || !body.nom?.trim()) {
        throw new AppError('Prénom et nom sont obligatoires', 400);
      }
      if (!body.role || !ROLES_CREABLES.includes(body.role)) {
        throw new AppError(
          `Rôle invalide. Valeurs possibles : ${ROLES_CREABLES.join(', ')}`,
          400
        );
      }
      if (body.telephone && !AuthUtils.isValidPhone(body.telephone)) {
        throw new AppError('Numéro de téléphone invalide', 400);
      }

      const result = await utilisateurService.create(ctx, {
        email: body.email,
        motDePasse: body.motDePasse,
        prenom: body.prenom,
        nom: body.nom,
        role: body.role,
        telephone: body.telephone,
        photoProfil: body.photoProfil,
        sexe: body.sexe,
        dateNaissance: body.dateNaissance,
        adresse: body.adresse,
        lieuNaissance: body.lieuNaissance,
        nationalite: body.nationalite,
        groupeSanguin: body.groupeSanguin,
        allergies: body.allergies,
        infoMedicale: body.infoMedicale,
        dateEmbauche: body.dateEmbauche,
        typeContrat: body.typeContrat,
        qualification: body.qualification,
        specialite: body.specialite,
        salaireBase: body.salaireBase,
        infosBancaires: body.infosBancaires,
        zoneSurveillance: body.zoneSurveillance,
      });

      sendSuccess(res, result, 'Utilisateur créé avec succès', 201);
    } catch (e) {
      next(e);
    }
  };

  // ────────── READ (list) ──────────

  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      // ⚠️ Les query params ont déjà été validés/coercés par validateRequest
      const q: any = (req as any).validated?.query ?? req.query;

      const result = await utilisateurService.findAll(ctx, {
        page: q.page ?? 1,
        limit: q.limit ?? 20,
        search: q.search,
        role: q.role,
        estActif: q.estActif,
        sortBy: q.sortBy ?? 'createdAt',
        sortOrder: q.sortOrder ?? 'desc',
      });

      res.json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  };

  // ────────── READ (by id) ──────────

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');
      const data = await utilisateurService.findById(ctx, id);
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  // ────────── READ (me) ──────────

  getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const userId = requireUserId(req);
      const data = await utilisateurService.findById(ctx, userId);
      sendSuccess(res, data);
    } catch (e) {
      next(e);
    }
  };

  // ────────── UPDATE ──────────

  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');
      const body = req.body ?? {};

      if (body.email !== undefined && !AuthUtils.isValidEmail(body.email)) {
        throw new AppError('Email invalide', 400);
      }
      if (body.telephone && !AuthUtils.isValidPhone(body.telephone)) {
        throw new AppError('Numéro de téléphone invalide', 400);
      }

      const data = await utilisateurService.update(ctx, id, {
        prenom: body.prenom,
        nom: body.nom,
        telephone: body.telephone,
        photoProfil: body.photoProfil,
        email: body.email,
        role: body.role,
        estActif: body.estActif,
        sexe: body.sexe,
        dateNaissance: body.dateNaissance,
        adresse: body.adresse,
        lieuNaissance: body.lieuNaissance,
        nationalite: body.nationalite,
        groupeSanguin: body.groupeSanguin,
        allergies: body.allergies,
        infoMedicale: body.infoMedicale,
        typeContrat: body.typeContrat,
        qualification: body.qualification,
        specialite: body.specialite,
        salaireBase: body.salaireBase,
        infosBancaires: body.infosBancaires,
        zoneSurveillance: body.zoneSurveillance,
      });

      sendSuccess(res, data, 'Utilisateur mis à jour avec succès');
    } catch (e) {
      next(e);
    }
  };

  // ────────── CHANGE PASSWORD (self) ──────────

  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const userId = requireUserId(req);
      const body = req.body ?? {};

      if (!body.ancienMotDePasse) {
        throw new AppError('Ancien mot de passe requis', 400);
      }
      if (!body.nouveauMotDePasse) {
        throw new AppError('Nouveau mot de passe requis', 400);
      }

      await utilisateurService.changePassword(
        ctx,
        userId,
        body.ancienMotDePasse,
        body.nouveauMotDePasse
      );

      sendSuccess(res, undefined, 'Mot de passe modifié avec succès');
    } catch (e) {
      next(e);
    }
  };

  // ────────── RESET PASSWORD (admin) ──────────

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');
      const body = req.body ?? {};

      if (!body.nouveauMotDePasse) {
        throw new AppError('Nouveau mot de passe requis', 400);
      }

      await utilisateurService.resetPasswordByAdmin(
        ctx,
        id,
        body.nouveauMotDePasse
      );

      sendSuccess(res, undefined, 'Mot de passe réinitialisé avec succès');
    } catch (e) {
      next(e);
    }
  };

  // ────────── TOGGLE ACTIF ──────────

  toggleActif = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');
      const body = req.body ?? {};

      if (typeof body.estActif !== 'boolean') {
        throw new AppError('estActif est obligatoire (boolean)', 400);
      }

      const data = await utilisateurService.toggleActif(
        ctx,
        id,
        body.estActif
      );

      sendSuccess(
        res,
        data,
        body.estActif ? 'Utilisateur activé' : 'Utilisateur désactivé'
      );
    } catch (e) {
      next(e);
    }
  };

  // ────────── SOFT DELETE ──────────

  softDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');

      const result = await utilisateurService.softDelete(ctx, id);
      sendSuccess(res, result, 'Utilisateur désactivé (soft delete)');
    } catch (e) {
      next(e);
    }
  };

  // ────────── HARD DELETE ──────────

  hardDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');

      const result = await utilisateurService.hardDelete(ctx, id);
      sendSuccess(res, result, 'Utilisateur supprimé définitivement');
    } catch (e) {
      next(e);
    }
  };

  // ──────────────────────────────────────────
  // PHOTO — SELF
  // ──────────────────────────────────────────

  /**
   * POST /utilisateurs/me/photo
   * Upload de SA propre photo (multipart/form-data, champ "photo")
   */
  uploadMyPhoto = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Vérifier le contexte tenant AVANT tout
      const ctx = requireAuthContext(req);
      const userId = requireUserId(req);

      if (!req.file) {
        throw new AppError(
          'Aucun fichier reçu. Envoyez un champ "photo" en multipart/form-data.',
          400
        );
      }

      // ✅ AJOUTÉ : vérification du contenu réel (magic bytes)
      if (!isValidImageFile(req.file.path)) {
        throw new AppError(
          'Fichier invalide : le contenu n’est pas une image JPG, PNG, WEBP ou GIF.',
          400
        );
      }

      const url = await saveAvatar(ctx.schemaName, userId, req.file.path);
      sendSuccess(res, { photoProfil: url }, 'Photo mise à jour');
    } catch (e) {
      // Nettoyer le fichier uploadé si erreur
      // ✅ CORRIGÉ : le chemin pointe maintenant vers uploads/avatars/
      cleanupUploadedFile(req);
      next(e);
    }
  };

  /**
   * DELETE /utilisateurs/me/photo
   * Supprime SA propre photo
   */
  deleteMyPhoto = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const userId = requireUserId(req);

      const client = await getTenantClient(ctx.schemaName);
      if (!client) throw new AppError('Tenant introuvable', 500);

      const user = await client.utilisateur.findUnique({
        where: { id: userId },
        select: { photoProfil: true },
      });

      // Supprimer le fichier physique si présent
      safeUnlink(user?.photoProfil);

      await client.utilisateur.update({
        where: { id: userId },
        data: { photoProfil: null },
      });

      sendSuccess(res, undefined, 'Photo supprimée');
    } catch (e) {
      next(e);
    }
  };

  // ──────────────────────────────────────────
  // PHOTO — ADMIN (sur un autre utilisateur)
  // ──────────────────────────────────────────

  /**
   * POST /utilisateurs/:id/photo
   * Upload de la photo d'un utilisateur (rôle admin requis côté route)
   */
  uploadUserPhoto = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');

      if (!req.file) {
        throw new AppError(
          'Aucun fichier reçu. Envoyez un champ "photo" en multipart/form-data.',
          400
        );
      }

      // ✅ AJOUTÉ : vérification du contenu réel (magic bytes)
      if (!isValidImageFile(req.file.path)) {
        throw new AppError(
          'Fichier invalide : le contenu n’est pas une image JPG, PNG, WEBP ou GIF.',
          400
        );
      }

      const url = await saveAvatar(ctx.schemaName, id, req.file.path);
      sendSuccess(res, { photoProfil: url }, 'Photo mise à jour');
    } catch (e) {
      // ✅ CORRIGÉ : le chemin pointe maintenant vers uploads/avatars/
      cleanupUploadedFile(req);
      next(e);
    }
  };

  /**
   * DELETE /utilisateurs/:id/photo
   * Supprime la photo d'un utilisateur (rôle admin requis côté route)
   */
  deleteUserPhoto = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const ctx = requireAuthContext(req);
      const id = getParam(req, 'id');

      const client = await getTenantClient(ctx.schemaName);
      if (!client) throw new AppError('Tenant introuvable', 500);

      const user = await client.utilisateur.findUnique({
        where: { id },
        select: { photoProfil: true },
      });

      if (!user) {
        throw new AppError('Utilisateur introuvable', 404);
      }

      safeUnlink(user.photoProfil);

      await client.utilisateur.update({
        where: { id },
        data: { photoProfil: null },
      });

      sendSuccess(res, undefined, 'Photo supprimée');
    } catch (e) {
      next(e);
    }
  };
}

// ──────────────────────────────────────────
// Export unique
// ──────────────────────────────────────────

export const utilisateurController = new UtilisateurController();