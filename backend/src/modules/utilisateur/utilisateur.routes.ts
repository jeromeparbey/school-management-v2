// backend/src/modules/utilisateur/utilisateur.routes.ts

import { Router } from 'express';
import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { utilisateurController } from './utilisateur.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { AppError } from '../../utils/AppError.js';
import {
  createUtilisateurSchema,
  updateUtilisateurSchema,
  utilisateurIdSchema,
  listUtilisateursSchema,
  toggleUtilisateurSchema,
  changePasswordSchema,
  resetPasswordSchema,
} from './utilisateur.validation.js';

const router = Router();

// ───────────────────────────────────────────
// MULTER — configuration avatars
// ⚠️ CORRIGÉ : on utilise le MÊME dossier que server.ts
// (backend/uploads/avatars) au lieu de process.cwd()
// ───────────────────────────────────────────

// ESM : reconstruire __filename et __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Remonte de modules/utilisateur/ → modules/ → src/ → backend/
const BACKEND_ROOT = path.resolve(__dirname, '../../..');
const avatarsDir = path.join(BACKEND_ROOT, 'uploads', 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
  console.log(`📁 Dossier avatars créé : ${avatarsDir}`);
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarsDir),
  filename: (_req, file, cb) => {
    const ext =
      MIME_TO_EXT[file.mimetype] ??
      path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${randomUUID()}${ext}`;
    cb(null, name);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Format non supporté. Utilisez JPG, PNG, WEBP ou GIF.'));
  },
});

/**
 * Middleware d'upload d'avatar (champ "photo").
 * Convertit les erreurs multer en AppError 400.
 */
const handleAvatarUpload: RequestHandler = (req, res, next) => {
  const single = uploadAvatar.single('photo') as unknown as RequestHandler;

  single(req, res, (err?: unknown) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Fichier trop volumineux (5 Mo maximum).', 400));
      }
      return next(new AppError(`Erreur d’upload : ${err.message}`, 400));
    }

    const message =
      err instanceof Error ? err.message : 'Erreur lors de l’upload du fichier';
    return next(new AppError(message, 400));
  });
};

// ───────────────────────────────────────────
// RATE LIMITERS
// ───────────────────────────────────────────
const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  handler: (_req, res) => {
    res.status(429).json({
      status: 429,
      message: 'Trop d’opérations. Réessayez plus tard.',
      timestamp: new Date().toISOString(),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ═══════════════════════════════════════════
// ROUTES "SELF"
// ═══════════════════════════════════════════
router.get('/me', utilisateurController.getMe);

router.patch(
  '/me/password',
  writeLimiter,
  validateRequest(changePasswordSchema),
  utilisateurController.changePassword
);

// ─── Photo — SELF ───
router.post(
  '/me/photo',
  writeLimiter,
  handleAvatarUpload,
  utilisateurController.uploadMyPhoto
);

router.delete(
  '/me/photo',
  writeLimiter,
  utilisateurController.deleteMyPhoto
);

// ───────────────────────────────────────────
// LECTURE
// ───────────────────────────────────────────
router.get(
  '/',
  validateRequest(listUtilisateursSchema),
  utilisateurController.list
);

router.get(
  '/:id',
  validateRequest(utilisateurIdSchema),
  utilisateurController.getById
);

// ───────────────────────────────────────────
// ÉCRITURE
// ───────────────────────────────────────────
router.post(
  '/',
  writeLimiter,
  validateRequest(createUtilisateurSchema),
  utilisateurController.create
);

router.put(
  '/:id',
  writeLimiter,
  validateRequest(updateUtilisateurSchema),
  utilisateurController.update
);

router.patch(
  '/:id/toggle',
  writeLimiter,
  validateRequest(toggleUtilisateurSchema),
  utilisateurController.toggleActif
);

router.patch(
  '/:id/reset-password',
  writeLimiter,
  validateRequest(resetPasswordSchema),
  utilisateurController.resetPassword
);

// ─── Photo — ADMIN ───
router.post(
  '/:id/photo',
  writeLimiter,
  validateRequest(utilisateurIdSchema),
  handleAvatarUpload,
  utilisateurController.uploadUserPhoto
);

router.delete(
  '/:id/photo',
  writeLimiter,
  validateRequest(utilisateurIdSchema),
  utilisateurController.deleteUserPhoto
);

// ───────────────────────────────────────────
// SUPPRESSION
// ───────────────────────────────────────────
router.delete(
  '/:id',
  writeLimiter,
  validateRequest(utilisateurIdSchema),
  utilisateurController.softDelete
);

router.delete(
  '/:id/hard',
  writeLimiter,
  validateRequest(utilisateurIdSchema),
  utilisateurController.hardDelete
);

export default router;

// ============================================
// MÉTADONNÉES POUR LE LOADER DYNAMIQUE
// ============================================
export const publicRoute = false;
export const basePath = '/utilisateurs';
export const roles: string[] = [
  'SUPER_ADMIN',
  'ADMIN_SYSTEME',
  'DIRECTEUR',
  'ADMIN',
  'SECRETAIRE',
];