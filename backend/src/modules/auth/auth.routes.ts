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
  // Schémas spécialisés
  registerEleveSchema,
  registerSurveillantSchema,
  loginEleveSchema,
  loginSurveillantSchema,
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

/** Connexion élèves : 8 tentatives / 15 min */
const loginEleveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: rateLimitHandler(
    'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  ),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/** Connexion surveillants : 5 tentatives / 15 min */
const loginSurveillantLimiter = rateLimit({
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

/** Inscription élève : 5 / heure */
const registerEleveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: rateLimitHandler(
    "Trop d'inscriptions d'élèves depuis cette adresse. Réessayez plus tard."
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

/** Inscription surveillant : 3 / heure */
const registerSurveillantLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: rateLimitHandler(
    "Trop d'inscriptions de surveillants depuis cette adresse. Réessayez plus tard."
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

/** Renvoi OTP : 3 / heure */
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

/** Refresh token : 30 / 15 min */
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
// ROUTES PUBLIQUES — INSCRIPTION
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
 * @route   POST /api/v1/auth/register/eleve
 * @desc    Inscription d'un élève
 * @access  Public
 */
router.post(
  '/register/eleve',
  registerEleveLimiter,
  validateRequest(registerEleveSchema),
  authController.registerEleve
);

/**
 * @route   POST /api/v1/auth/register/surveillant
 * @desc    Inscription d'un surveillant
 * @access  Private (ADMIN / DIRECTEUR)
 */
router.post(
  '/register/surveillant',
  registerSurveillantLimiter,
  authMiddleware,
  validateRequest(registerSurveillantSchema),
  authController.registerSurveillant
);

// ============================================
// ROUTES PUBLIQUES — CONNEXION
// ============================================

/**
 * @route   POST /api/v1/auth/login/super-admin
 * @desc    Connexion d'un SUPER_ADMIN (catalogue global)
 * @access  Public
 * ⚠️ DOIT être placée AVANT /login (sinon Express matche /login en premier)
 */
router.post(
  '/login/super-admin',
  loginLimiter,
  validateRequest(loginSchema),
  authController.loginSuperAdmin
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Connexion d'un utilisateur (rôle détecté automatiquement)
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  validateRequest(loginSchema),
  authController.login
);

/**
 * @route   POST /api/v1/auth/login/eleve
 * @desc    Connexion d'un élève
 * @access  Public
 */
router.post(
  '/login/eleve',
  loginEleveLimiter,
  validateRequest(loginEleveSchema),
  authController.loginEleve
);

/**
 * @route   POST /api/v1/auth/login/surveillant
 * @desc    Connexion d'un surveillant
 * @access  Public
 */
router.post(
  '/login/surveillant',
  loginSurveillantLimiter,
  validateRequest(loginSurveillantSchema),
  authController.loginSurveillant
);

// ============================================
// ROUTES PUBLIQUES — OTP & TOKENS
// ============================================

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Vérification de l'OTP
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
 * @access  Public
 */
router.post(
  '/refresh',
  refreshLimiter,
  validateRequest(refreshTokenSchema),
  authController.refreshToken
);

// ============================================
// ROUTES PUBLIQUES — MOT DE PASSE
// ============================================

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

// ============================================
// ROUTES PUBLIQUES — DÉCONNEXION
// ============================================

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Déconnexion
 * @access  Public
 */
router.post('/logout', authController.logout);

// ============================================
// ROUTES PROTÉGÉES — PROFIL
// ============================================

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtenir les informations de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * @route   PUT /api/v1/auth/me
 * @desc    Mettre à jour le profil
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
 * @desc    Changer le mot de passe
 * @access  Private
 */
router.post(
  '/change-password',
  authMiddleware,
  validateRequest(changePasswordSchema),
  authController.changePassword
);

// ============================================
// ROUTES PROTÉGÉES — PROFIL ÉLÈVE / SURVEILLANT
// ============================================

/**
 * @route   GET /api/v1/auth/me/eleve
 * @desc    Récupérer le profil élève
 * @access  Private (ELEVE)
 */
router.get(
  '/me/eleve',
  authMiddleware,
  authController.getEleveProfile
);

/**
 * @route   GET /api/v1/auth/me/surveillant
 * @desc    Récupérer le profil surveillant
 * @access  Private (SURVEILLANT)
 */
router.get(
  '/me/surveillant',
  authMiddleware,
  authController.getSurveillantProfile
);

// ============================================
// EXPORT
// ============================================

export default router;

/**
 * Métadonnées pour le chargeur dynamique de routes (server.ts).
 */
export const publicRoute = false;
export const basePath = '/auth';
export const roles: string[] = [];
export const disableAudit = false;