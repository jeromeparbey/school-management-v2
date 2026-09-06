// backend/src/modules/auth/auth.service.ts

import { AuthRepository } from './auth.repository';
import { AuthUtils } from './auth.utils';
import { 
  IOtpStore, 
  IResetTokenStore,
  LoginRequest,
  RegisterRequest,
  UserResponse,
  TokensResponse 
} from './auth.types';
import { AppError } from '../../utils/AppError';
import { EmailService } from '../../services/email.service';

export class AuthService {
  private repository: AuthRepository;
  private emailService: EmailService;

  constructor() {
    this.repository = new AuthRepository();
    this.emailService = new EmailService();
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: RegisterRequest): Promise<{
    user: UserResponse;
    tokens: TokensResponse;
  }> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.repository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Un utilisateur avec cet email existe déjà', 409);
    }

    // Valider la force du mot de passe
    const passwordValidation = AuthUtils.isStrongPassword(data.motDePasse);
    if (!passwordValidation.valid) {
      throw new AppError(
        `Mot de passe faible: ${passwordValidation.errors.join(', ')}`,
        400
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await AuthUtils.hashPassword(data.motDePasse);

    // Créer l'utilisateur
    const user = await this.repository.create({
      email: data.email,
      motDePasse: hashedPassword,
      prenom: data.prenom,
      nom: data.nom,
      role: data.role || 'ENSEIGNANT',
      telephone: data.telephone
    });

    // Générer l'OTP
    const otp = AuthUtils.generateOtp();
    await this.storeOtp(user.id, otp);

    // Envoyer l'OTP par email
    await this.emailService.sendOtpEmail(user.email, otp, user.prenom);

    // Générer les tokens
    const tokens = this.generateTokens(user.id, user.role);

    // Sauvegarder le refresh token
    await this.repository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: AuthUtils.sanitizeUser(user),
      tokens
    };
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(data: LoginRequest): Promise<{
    user: UserResponse;
    tokens: TokensResponse;
  }> {
    // Trouver l'utilisateur
    const user = await this.repository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Vérifier si le compte est actif
    if (!user.estActif) {
      throw new AppError('Compte désactivé. Contactez l\'administrateur.', 403);
    }

    // Vérifier le mot de passe
    const isValidPassword = await AuthUtils.verifyPassword(
      data.motDePasse,
      user.motDePasse
    );
    if (!isValidPassword) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Mettre à jour la dernière connexion
    await this.repository.updateLastLogin(user.id);

    // Générer les tokens
    const tokens = this.generateTokens(user.id, user.role);

    // Sauvegarder le refresh token
    await this.repository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: AuthUtils.sanitizeUser(user),
      tokens
    };
  }

  /**
   * Vérification de l'OTP
   */
  async verifyOtp(userId: string, otp: string): Promise<boolean> {
    const storedOtp = await this.getStoredOtp(userId);
    if (!storedOtp) {
      throw new AppError('OTP invalide ou expiré', 400);
    }

    // Vérifier les tentatives
    if (storedOtp.attempts >= 3) {
      await this.clearOtp(userId);
      throw new AppError('Trop de tentatives. Veuillez demander un nouveau code.', 400);
    }

    // Vérifier l'OTP
    if (storedOtp.otp !== otp) {
      storedOtp.attempts += 1;
      await this.storeOtp(userId, storedOtp.otp, storedOtp.attempts);
      throw new AppError('OTP invalide', 400);
    }

    // Vérifier l'expiration
    if (Date.now() > storedOtp.expiresAt) {
      await this.clearOtp(userId);
      throw new AppError('OTP expiré. Veuillez demander un nouveau code.', 400);
    }

    // Marquer l'email comme vérifié
    await this.repository.verifyEmail(userId);
    await this.clearOtp(userId);

    return true;
  }

  /**
   * Renvoyer un nouvel OTP
   */
  async resendOtp(userId: string): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    if (user.emailVerifie) {
      throw new AppError('Email déjà vérifié', 400);
    }

    // Générer un nouvel OTP
    const otp = AuthUtils.generateOtp();
    await this.storeOtp(userId, otp);

    // Envoyer le nouvel OTP
    await this.emailService.sendOtpEmail(user.email, otp, user.prenom);
  }

  /**
   * Rafraîchir les tokens
   */
  async refreshTokens(refreshToken: string): Promise<TokensResponse> {
    // Vérifier le refresh token
    const decoded = AuthUtils.verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret'
    ) as { userId: string };

    // Vérifier que le refresh token existe en base
    const user = await this.repository.findByRefreshToken(refreshToken);
    if (!user) {
      throw new AppError('Refresh token invalide', 401);
    }

    // Générer de nouveaux tokens
    const tokens = this.generateTokens(user.id, user.role);

    // Mettre à jour le refresh token
    await this.repository.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  /**
   * Déconnexion
   */
  async logout(userId: string): Promise<void> {
    await this.repository.updateRefreshToken(userId, null);
  }

  /**
   * Demande de réinitialisation du mot de passe
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe
      return;
    }

    // Générer un token de réinitialisation
    const resetToken = AuthUtils.generateResetToken();
    await this.storeResetToken(user.id, resetToken);

    // Envoyer l'email de réinitialisation
    await this.emailService.sendResetPasswordEmail(
      user.email,
      resetToken,
      user.prenom
    );
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Valider le nouveau mot de passe
    const passwordValidation = AuthUtils.isStrongPassword(newPassword);
    if (!passwordValidation.valid) {
      throw new AppError(
        `Mot de passe faible: ${passwordValidation.errors.join(', ')}`,
        400
      );
    }

    // Vérifier le token
    const resetData = await this.getStoredResetToken(token);
    if (!resetData) {
      throw new AppError('Token de réinitialisation invalide', 400);
    }

    if (resetData.used) {
      await this.clearResetToken(token);
      throw new AppError('Ce token a déjà été utilisé', 400);
    }

    if (Date.now() > resetData.expiresAt) {
      await this.clearResetToken(token);
      throw new AppError('Le token a expiré. Veuillez refaire une demande.', 400);
    }

    // Mettre à jour le mot de passe
    const hashedPassword = await AuthUtils.hashPassword(newPassword);
    await this.repository.updatePassword(resetData.userId, hashedPassword);

    // Marquer le token comme utilisé
    resetData.used = true;
    await this.storeResetToken(resetData.userId, token, resetData.used);

    // Invalider tous les refresh tokens existants
    await this.repository.updateRefreshToken(resetData.userId, null);

    // Envoyer une confirmation
    const user = await this.repository.findById(resetData.userId);
    if (user) {
      await this.emailService.sendPasswordChangedEmail(user.email, user.prenom);
    }
  }

  /**
   * Changer le mot de passe (utilisateur connecté)
   */
  async changePassword(
    userId: string,
    ancienMotDePasse: string,
    nouveauMotDePasse: string
  ): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Vérifier l'ancien mot de passe
    const isValidPassword = await AuthUtils.verifyPassword(
      ancienMotDePasse,
      user.motDePasse
    );
    if (!isValidPassword) {
      throw new AppError('Ancien mot de passe incorrect', 400);
    }

    // Valider le nouveau mot de passe
    const passwordValidation = AuthUtils.isStrongPassword(nouveauMotDePasse);
    if (!passwordValidation.valid) {
      throw new AppError(
        `Mot de passe faible: ${passwordValidation.errors.join(', ')}`,
        400
      );
    }

    // Mettre à jour le mot de passe
    const hashedPassword = await AuthUtils.hashPassword(nouveauMotDePasse);
    await this.repository.updatePassword(userId, hashedPassword);

    // Invalider tous les refresh tokens existants pour forcer une reconnexion
    await this.repository.updateRefreshToken(userId, null);

    // Envoyer une notification
    await this.emailService.sendPasswordChangedEmail(user.email, user.prenom);
  }

  /**
   * Obtenir les informations de l'utilisateur connecté
   */
  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await this.repository.getUserInfo(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }
    return user;
  }

  /**
   * Mettre à jour le profil de l'utilisateur
   */
  async updateProfile(
    userId: string,
    data: {
      prenom?: string;
      nom?: string;
      telephone?: string;
      photoProfil?: string;
    }
  ): Promise<UserResponse> {
    const user = await this.repository.updateProfile(userId, data);
    return AuthUtils.sanitizeUser(user);
  }

  /**
   * Stocker l'OTP
   */
  private async storeOtp(userId: string, otp: string, attempts: number = 0): Promise<void> {
    const otpStore = global.otpStore || new Map();
    global.otpStore = otpStore;

    otpStore.set(userId, {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      attempts
    });
  }

  /**
   * Récupérer l'OTP stocké
   */
  private async getStoredOtp(userId: string): Promise<IOtpStore | null> {
    const otpStore = global.otpStore || new Map();
    return otpStore.get(userId) || null;
  }

  /**
   * Effacer l'OTP
   */
  private async clearOtp(userId: string): Promise<void> {
    const otpStore = global.otpStore || new Map();
    otpStore.delete(userId);
  }

  /**
   * Stocker le token de réinitialisation
   */
  private async storeResetToken(
    userId: string,
    token: string,
    used: boolean = false
  ): Promise<void> {
    const resetTokenStore = global.resetTokenStore || new Map();
    global.resetTokenStore = resetTokenStore;

    resetTokenStore.set(token, {
      userId,
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 heures
      used
    });
  }

  /**
   * Récupérer le token de réinitialisation stocké
   */
  private async getStoredResetToken(token: string): Promise<IResetTokenStore & { userId: string } | null> {
    const resetTokenStore = global.resetTokenStore || new Map();
    return resetTokenStore.get(token) || null;
  }

  /**
   * Effacer le token de réinitialisation
   */
  private async clearResetToken(token: string): Promise<void> {
    const resetTokenStore = global.resetTokenStore || new Map();
    resetTokenStore.delete(token);
  }

  /**
   * Générer les tokens d'accès et de rafraîchissement
   */
  private generateTokens(userId: string, role: string): TokensResponse {
    return {
      accessToken: AuthUtils.generateAccessToken(userId, role),
      refreshToken: AuthUtils.generateRefreshToken(userId)
    };
  }
}