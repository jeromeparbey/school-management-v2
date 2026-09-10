// backend/src/modules/auth/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from './auth.service';
import { AuthUtils } from './auth.utils';
import { AppError } from '../../utils/AppError';
import type {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from './auth.types';
import type { RoleUtilisateur } from '@prisma/client';

// ============================================
// TYPES DE RÉPONSES API (uniformisation)
// ============================================

interface ApiSuccess<T = unknown> {
  status: number;
  message?: string;
  data?: T;
  timestamp: string;
}

interface ApiError {
  status: number;
  message: string;
  errors?: unknown;
  timestamp: string;
}

// ============================================
// HELPERS INTERNES
// ============================================

const ROLES_VALIDES: RoleUtilisateur[] = [
  'DIRECTEUR',
  'SECRETAIRE',
  'ENSEIGNANT',
  'PARENT',
  'ADMIN',
];

/** Réponse succès uniforme */
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

/** Valider que l'utilisateur est authentifié et retourne son ID */
function requireUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError('Non authentifié', 401);
  }
  return userId;
}

/** Valider un corps de requête non vide */
function requireBody<T>(body: T | undefined | null): T {
  if (!body || typeof body !== 'object') {
    throw new AppError('Corps de requête manquant', 400);
  }
  return body;
}

// ============================================
// CONTRÔLEUR
// ============================================

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    // ✅ Utilisation du singleton partagé
    this.authService = authService;
  }

  // ------------------------------------------
  // INSCRIPTION
  // ------------------------------------------

  register = async (
    req: Request<{}, {}, RegisterRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = requireBody(req.body);

      // Validation minimale
      if (!body.email || !AuthUtils.isValidEmail(body.email)) {
        throw new AppError('Email invalide', 400);
      }
      if (!body.motDePasse || typeof body.motDePasse !== 'string') {
        throw new AppError('Mot de passe requis', 400);
      }
      if (!body.prenom?.trim() || !body.nom?.trim()) {
        throw new AppError('Prénom et nom sont obligatoires', 400);
      }
      if (body.role && !ROLES_VALIDES.includes(body.role)) {
        throw new AppError(
          `Rôle invalide. Valeurs possibles: ${ROLES_VALIDES.join(', ')}`,
          400
        );
      }
      if (body.telephone && !AuthUtils.isValidPhone(body.telephone)) {
        throw new AppError('Numéro de téléphone invalide', 400);
      }

      const result = await this.authService.register({
        email: body.email.trim().toLowerCase(),
        motDePasse: body.motDePasse,
        prenom: body.prenom.trim(),
        nom: body.nom.trim(),
        role: body.role,
        telephone: body.telephone?.trim(),
      });

      sendSuccess(
        res,
        result,
        'Inscription réussie. Veuillez vérifier votre email pour le code OTP.',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  // ------------------------------------------
  // CONNEXION
  // ------------------------------------------

  login = async (
    req: Request<{}, {}, LoginRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = requireBody(req.body);

      if (!body.email || !AuthUtils.isValidEmail(body.email)) {
        throw new AppError('Email invalide', 400);
      }
      if (!body.motDePasse) {
        throw new AppError('Mot de passe requis', 400);
      }

      const result = await this.authService.login({
        email: body.email.trim().toLowerCase(),
        motDePasse: body.motDePasse,
      });

      sendSuccess(res, result, 'Connexion réussie');
    } catch (error) {
      next(error);
    }
  };

  // ------------------------------------------
  // OTP
  // ------------------------------------------

  verifyOtp = async (
    req: Request<{}, {}, VerifyOtpRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = requireBody(req.body);

      if (!body.userId) {
        throw new AppError('userId requis', 400);
      }
      if (!body.otp || !/^\d{6}$/.test(body.otp)) {
        throw new AppError('Code OTP invalide (6 chiffres attendus)', 400);
      }

      await this.authService.verifyOtp(body.userId, body.otp);

      sendSuccess(res, undefined, 'Email vérifié avec succès');
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (
    req: Request<{}, {}, { userId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = requireBody(req.body);

      if (!body.userId) {
        throw new AppError('userId requis', 400);
      }

      await this.authService.resendOtp(body.userId);

      sendSuccess(
        res,
        undefined,
        'Un nouveau code OTP a été envoyé à votre email'
      );
    } catch (error) {
      next(error);
    }
  };

  // ------------------------------------------
  // TOKENS
  // ------------------------------------------

  refreshToken = async (
    req: Request<{}, {}, RefreshTokenRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = requireBody(req.body);

      // Accepter le token depuis le body OU depuis un cookie httpOnly
      const refreshToken =
        body.refreshToken ||
        (req.cookies?.refreshToken as string | undefined);

      if (!refreshToken) {
        throw new AppError('Refresh token requis', 400);
      }

      const tokens = await this.authService.refreshTokens(refreshToken);

      sendSuccess(res, tokens, 'Tokens rafraîchis avec succès');
    } catch (error) {
      next(error);
    }
  };

  // ------------------------------------------
  // DÉCONNEXION
  // ------------------------------------------

  /**
   * La déconnexion ne requiert PAS d'authentification stricte :
   * un access token expiré doit pouvoir invalider sa session.
   * Le userId est extrait du refresh token OU du contexte d'auth.
   */
  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // 1. Priorité : utilisateur déjà authentifié par middleware
      let userId = req.user?.userId;

      // 2. Sinon : tenter d'extraire l'userId du refresh token
      if (!userId) {
        const refreshToken =
          (req.body?.refreshToken as string | undefined) ||
          (req.cookies?.refreshToken as string | undefined);

        if (refreshToken) {
          const payload = AuthUtils.tryVerifyRefreshToken(refreshToken);
          if (payload?.userId) {
            userId = payload.userId;
          }
        }
      }

      if (userId) {
        await this.authService.logout(userId);
      }

      // Effacer le cookie httpOnly si présent
      res.clearCookie?.('refreshToken');

      sendSuccess(res, undefined, 'Déconnexion réussie');
    } catch (error) {
      next(error);
    }
  };

  // ------------------------------------------
  // MOT DE PASSE
  // ------------------------------------------

  forgotPassword = async (
    req: Request<{}, {}, ForgotPasswordRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = requireBody(req.body);

      if (!body.email || !AuthUtils.isValidEmail(body.email)) {
        throw new AppError('Email invalide', 400);
      }

      await this.authService.forgotPassword(body.email.trim().toLowerCase());

      // Réponse volontairement générique (sécurité)
      sendSuccess(
        res,
        undefined,
        'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
      );
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (
    req: Request<{}, {}, ResetPasswordRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = requireBody(req.body);

      if (!body.token || typeof body.token !== 'string') {
        throw new AppError('Token de réinitialisation requis', 400);
      }
      if (!body.nouveauMotDePasse) {
        throw new AppError('Nouveau mot de passe requis', 400);
      }

      await this.authService.resetPassword(
        body.token,
        body.nouveauMotDePasse
      );

      sendSuccess(res, undefined, 'Mot de passe réinitialisé avec succès');
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (
    req: Request<{}, {}, ChangePasswordRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const body = requireBody(req.body);

      if (!body.ancienMotDePasse) {
        throw new AppError('Ancien mot de passe requis', 400);
      }
      if (!body.nouveauMotDePasse) {
        throw new AppError('Nouveau mot de passe requis', 400);
      }
      if (body.ancienMotDePasse === body.nouveauMotDePasse) {
        throw new AppError(
          'Le nouveau mot de passe doit être différent de l\'ancien',
          400
        );
      }

      await this.authService.changePassword(
        userId,
        body.ancienMotDePasse,
        body.nouveauMotDePasse
      );

      sendSuccess(res, undefined, 'Mot de passe changé avec succès');
    } catch (error) {
      next(error);
    }
  };

  // ------------------------------------------
  // PROFIL
  // ------------------------------------------

  getCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const user = await this.authService.getCurrentUser(userId);

      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const body = requireBody(req.body);

      // Whitelist : empêcher la modification de champs sensibles
      const allowedFields = ['prenom', 'nom', 'telephone', 'photoProfil'];
      const updateData: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw new AppError('Aucun champ valide à mettre à jour', 400);
      }

      if (
        updateData.telephone &&
        !AuthUtils.isValidPhone(updateData.telephone as string)
      ) {
        throw new AppError('Numéro de téléphone invalide', 400);
      }

      const user = await this.authService.updateProfile(userId, updateData);

      sendSuccess(res, user, 'Profil mis à jour avec succès');
    } catch (error) {
      next(error);
    }
  };
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const authController = new AuthController();