// backend/src/modules/auth/auth.routes.ts

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller';
import { authMiddleware } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validateRequest';
import {
  loginSchema,
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from './auth.validation';

const router = Router();

// ============================================
// RATE LIMITERS
// ============================================

/** Helper pour construire une réponse 429 uniforme */
const rateLimitHandler = (message: string) => ({
  status: 429,
  message,
  timestamp: new Date().toISOString(),
});

/** Connexion : 5 tentatives / 15 min (les succès ne comptent pas) */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: rateLimitHandler(
    'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  ),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/** Inscription : 10 / heure / IP */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: rateLimitHandler(
    "Trop d'inscriptions depuis cette adresse. Réessayez plus tard."
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

/** OTP (vérification + renvoi) : 5 / 15 min */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: rateLimitHandler(
    'Trop de tentatives. Réessayez dans 15 minutes.'
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

/** Renvoi OTP : encore plus strict, 3 / heure */
const resendOtpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: rateLimitHandler(
    "Trop de demandes d'OTP. Réessayez dans 1 heure."
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

/** Mot de passe oublié : 3 / heure */
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: rateLimitHandler(
    'Trop de demandes de réinitialisation. Réessayez dans 1 heure.'
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

/** Refresh token : 30 / 15 min (usage légitime fréquent) */
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: rateLimitHandler('Trop de rafraîchissements. Réessayez plus tard.'),
  standardHeaders: true,
  legacyHeaders: false,
});

/** Reset password : 5 / heure */
const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: rateLimitHandler(
    'Trop de tentatives de réinitialisation. Réessayez dans 1 heure.'
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// ROUTES PUBLIQUES
// ============================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post(
  '/register',
  registerLimiter,
  validateRequest(registerSchema),
  authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  validateRequest(loginSchema),
  authController.login
);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Vérification de l'OTP pour activer le compte
 * @access  Public
 */
router.post(
  '/verify-otp',
  otpLimiter,
  validateRequest(verifyOtpSchema),
  authController.verifyOtp
);

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Renvoyer un nouvel OTP
 * @access  Public
 */
router.post(
  '/resend-otp',
  resendOtpLimiter,
  validateRequest(resendOtpSchema),
  authController.resendOtp
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Rafraîchir les tokens d'accès
 * @access  Public (nécessite un refresh token valide dans le body ou cookie)
 */
router.post(
  '/refresh',
  refreshLimiter,
  validateRequest(refreshTokenSchema),
  authController.refreshToken
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Demande de réinitialisation du mot de passe
 * @access  Public
 */
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Réinitialiser le mot de passe à partir d'un token
 * @access  Public
 */
router.post(
  '/reset-password',
  resetPasswordLimiter,
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Déconnexion (fonctionne même avec un access token expiré)
 * @access  Public (le userId est extrait du refresh token)
 */
router.post('/logout', authController.logout);

// ============================================
// ROUTES PROTÉGÉES
// ============================================

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtenir les informations de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * @route   PUT /api/v1/auth/me
 * @desc    Mettre à jour le profil de l'utilisateur connecté
 * @access  Private
 */
router.put(
  '/me',
  authMiddleware,
  validateRequest(updateProfileSchema),
  authController.updateProfile
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Changer le mot de passe (utilisateur connecté)
 * @access  Private
 */
router.post(
  '/change-password',
  authMiddleware,
  validateRequest(changePasswordSchema),
  authController.changePassword
);

// ============================================
// EXPORT
// ============================================

export default router;

/**
 * Métadonnées pour le chargeur dynamique de routes (server.ts).
 *
 * ⚠️ IMPORTANT : `publicRoute: false` car ce routeur contient
 * des routes protégées par authMiddleware. Les routes publiques
 * ci-dessus gèrent leur propre auth (login, register, refresh...).
 *
 * Cela évite que le chargeur applique authMiddleware globalement
 * et casse les routes publiques.
 */
export const publicRoute = false;
export const basePath = '/auth';
export const roles: string[] = [];
export const disableAudit = false;