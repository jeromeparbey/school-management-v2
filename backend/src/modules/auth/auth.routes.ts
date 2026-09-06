// backend/src/modules/auth/auth.routes.ts

import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { authMiddleware } from '../../middleware/auth';
import { 
  loginSchema,
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema
} from './auth.validation';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const authController = new AuthController();

// Limiteurs de taux spécifiques
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    status: 429,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
    timestamp: new Date().toISOString()
  },
  skipSuccessfulRequests: true
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10,
  message: {
    status: 429,
    message: 'Trop d\'inscriptions. Réessayez plus tard.',
    timestamp: new Date().toISOString()
  }
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3,
  message: {
    status: 429,
    message: 'Trop de demandes de réinitialisation. Réessayez dans 1 heure.',
    timestamp: new Date().toISOString()
  }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: {
    status: 429,
    message: 'Trop de tentatives. Réessayez dans 15 minutes.',
    timestamp: new Date().toISOString()
  }
});

// ============================================
// ROUTES PUBLIQUES (sans authentification)
// ============================================

/**
 * @route POST /api/v1/auth/register
 * @description Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post(
  '/register',
  registerLimiter,
  validateRequest(registerSchema),
  authController.register
);

/**
 * @route POST /api/v1/auth/login
 * @description Connexion d'un utilisateur
 * @access Public
 */
router.post(
  '/login',
  loginLimiter,
  validateRequest(loginSchema),
  authController.login
);

/**
 * @route POST /api/v1/auth/verify-otp
 * @description Vérification de l'OTP pour l'activation du compte
 * @access Public
 */
router.post(
  '/verify-otp',
  otpLimiter,
  validateRequest(verifyOtpSchema),
  authController.verifyOtp
);

/**
 * @route POST /api/v1/auth/resend-otp
 * @description Renvoyer un nouvel OTP
 * @access Public
 */
router.post(
  '/resend-otp',
  otpLimiter,
  validateRequest(resendOtpSchema),
  authController.resendOtp
);

/**
 * @route POST /api/v1/auth/refresh
 * @description Rafraîchir les tokens
 * @access Public
 */
router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  authController.refreshToken
);

/**
 * @route POST /api/v1/auth/forgot-password
 * @description Demande de réinitialisation du mot de passe
 * @access Public
 */
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @route POST /api/v1/auth/reset-password
 * @description Réinitialiser le mot de passe
 * @access Public
 */
router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

// ============================================
// ROUTES PROTÉGÉES (authentification requise)
// ============================================

/**
 * @route POST /api/v1/auth/logout
 * @description Déconnexion de l'utilisateur
 * @access Private
 */
router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

/**
 * @route GET /api/v1/auth/me
 * @description Obtenir les informations de l'utilisateur connecté
 * @access Private
 */
router.get(
  '/me',
  authMiddleware,
  authController.getCurrentUser
);

/**
 * @route PUT /api/v1/auth/me
 * @description Mettre à jour le profil de l'utilisateur connecté
 * @access Private
 */
router.put(
  '/me',
  authMiddleware,
  validateRequest(updateProfileSchema),
  authController.updateProfile
);

/**
 * @route POST /api/v1/auth/change-password
 * @description Changer le mot de passe
 * @access Private
 */
router.post(
  '/change-password',
  authMiddleware,
  validateRequest(changePasswordSchema),
  authController.changePassword
);

// Exporter le routeur
export default router;

// Exporter les métadonnées pour le chargement dynamique
export const publicRoute = true;
export const basePath = '/auth';
export const roles = [];
export const disableAudit = false;