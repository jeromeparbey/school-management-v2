// backend/src/modules/auth/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest
} from './auth.types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  register = async (
    req: Request<{}, {}, RegisterRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.authService.register(req.body);

      res.status(201).json({
        status: 201,
        message: 'Inscription réussie. Veuillez vérifier votre email pour le code OTP.',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Connexion d'un utilisateur
   */
  login = async (
    req: Request<{}, {}, LoginRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.authService.login(req.body);

      res.json({
        status: 200,
        message: 'Connexion réussie',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Vérification de l'OTP
   */
  verifyOtp = async (
    req: Request<{}, {}, VerifyOtpRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.authService.verifyOtp(req.body.userId, req.body.otp);

      res.json({
        status: 200,
        message: 'Email vérifié avec succès',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Renvoyer un nouvel OTP
   */
  resendOtp = async (
    req: Request<{}, {}, { userId: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.authService.resendOtp(req.body.userId);

      res.json({
        status: 200,
        message: 'Un nouveau code OTP a été envoyé à votre email',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Rafraîchir les tokens
   */
  refreshToken = async (
    req: Request<{}, {}, RefreshTokenRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tokens = await this.authService.refreshTokens(req.body.refreshToken);

      res.json({
        status: 200,
        message: 'Tokens rafraîchis avec succès',
        data: tokens,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Déconnexion
   */
  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      if (userId) {
        await this.authService.logout(userId);
      }

      res.json({
        status: 200,
        message: 'Déconnexion réussie',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Demande de réinitialisation du mot de passe
   */
  forgotPassword = async (
    req: Request<{}, {}, ForgotPasswordRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.authService.forgotPassword(req.body.email);

      res.json({
        status: 200,
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Réinitialiser le mot de passe
   */
  resetPassword = async (
    req: Request<{}, {}, ResetPasswordRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.authService.resetPassword(
        req.body.token,
        req.body.nouveauMotDePasse
      );

      res.json({
        status: 200,
        message: 'Mot de passe réinitialisé avec succès',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Changer le mot de passe (utilisateur connecté)
   */
  changePassword = async (
    req: Request<{}, {}, ChangePasswordRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status: 401,
          message: 'Non authentifié',
          timestamp: new Date().toISOString()
        });
      }

      await this.authService.changePassword(
        userId,
        req.body.ancienMotDePasse,
        req.body.nouveauMotDePasse
      );

      res.json({
        status: 200,
        message: 'Mot de passe changé avec succès',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir les informations de l'utilisateur connecté
   */
  getCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status: 401,
          message: 'Non authentifié',
          timestamp: new Date().toISOString()
        });
      }

      const user = await this.authService.getCurrentUser(userId);

      res.json({
        status: 200,
        data: user,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mettre à jour le profil de l'utilisateur
   */
  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status: 401,
          message: 'Non authentifié',
          timestamp: new Date().toISOString()
        });
      }

      const user = await this.authService.updateProfile(userId, req.body);

      res.json({
        status: 200,
        message: 'Profil mis à jour avec succès',
        data: user,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };
}