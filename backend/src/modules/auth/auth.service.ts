// backend/src/modules/auth/auth.service.ts

import { authRepository, AuthRepository } from './auth.repository';
import { AuthUtils } from './auth.utils';
import type {
  IOtpStore,
  IResetTokenStore,
  LoginRequest,
  RegisterRequest,
  UserResponse,
  TokensResponse,
} from './auth.types';
import { AppError } from '../../utils/AppError';
import { EmailService } from '../../services/email.service';

// ============================================
// INITIALISATION DES STORES GLOBAUX
// ============================================
// On initialise une seule fois au chargement du module.
// Le typage vient de auth.types.ts (declare global).
if (!globalThis.otpStore) {
  globalThis.otpStore = new Map<string, IOtpStore>();
}
if (!globalThis.resetTokenStore) {
  globalThis.resetTokenStore = new Map<string, IResetTokenStore>();
}

// ============================================
// SERVICE
// ============================================

export class AuthService {
  private readonly repository: AuthRepository;
  private readonly emailService: EmailService;

  // Constantes de configuration
  private readonly OTP_TTL_MS = 15 * 60 * 1000; // 15 minutes
  private readonly OTP_MAX_ATTEMPTS = 3;
  private readonly RESET_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

  constructor() {
    this.repository = authRepository;
    this.emailService = new EmailService();
  }

  // ------------------------------------------
  // INSCRIPTION
  // ------------------------------------------

  async register(data: RegisterRequest): Promise<{
    user: UserResponse;
    tokens: TokensResponse;
  }> {
    const email = data.email.toLowerCase().trim();

    // Vérifier l'unicité
    if (await this.repository.emailExists(email)) {
      throw new AppError('Un utilisateur avec cet email existe déjà', 409);
    }

    // Valider le mot de passe
    const passwordValidation = AuthUtils.isStrongPassword(data.motDePasse);
    if (!passwordValidation.valid) {
      throw new AppError(
        `Mot de passe faible: ${passwordValidation.errors.join(', ')}`,
        400
      );
    }

    // Hasher
    const hashedPassword = await AuthUtils.hashPassword(data.motDePasse);

    // Créer
    const user = await this.repository.create({
      email,
      motDePasse: hashedPassword,
      prenom: data.prenom,
      nom: data.nom,
      role: data.role ?? 'ENSEIGNANT',
      telephone: data.telephone,
    });

    // OTP
    const otp = AuthUtils.generateOtp();
    this.storeOtp(user.id, otp);

    // Envoyer l'email (non bloquant en cas d'échec)
    try {
      await this.emailService.sendOtpEmail(user.email, otp, user.prenom);
    } catch (err) {
      console.error('⚠️ Échec envoi OTP:', err);
    }

    // Tokens
    const tokens = this.generateTokens(user.id, user.role);
    await this.repository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: AuthUtils.sanitizeUser(user),
      tokens,
    };
  }

  // ------------------------------------------
  // CONNEXION
  // ------------------------------------------

  async login(data: LoginRequest): Promise<{
    user: UserResponse;
    tokens: TokensResponse;
  }> {
    const user = await this.repository.findByEmail(data.email);

    // Message générique (pas de fuite d'info)
    if (!user) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    if (!user.estActif) {
      throw new AppError(
        "Compte désactivé. Contactez l'administrateur.",
        403
      );
    }

    const isValidPassword = await AuthUtils.verifyPassword(
      data.motDePasse,
      user.motDePasse
    );
    if (!isValidPassword) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    await this.repository.updateLastLogin(user.id);

    const tokens = this.generateTokens(user.id, user.role);
    await this.repository.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: AuthUtils.sanitizeUser(user),
      tokens,
    };
  }

  // ------------------------------------------
  // OTP
  // ------------------------------------------

  async verifyOtp(userId: string, otp: string): Promise<boolean> {
    const storedOtp = this.getStoredOtp(userId);

    if (!storedOtp) {
      throw new AppError('OTP invalide ou expiré', 400);
    }

    if (Date.now() > storedOtp.expiresAt) {
      this.clearOtp(userId);
      throw new AppError('OTP expiré. Veuillez demander un nouveau code.', 400);
    }

    if (storedOtp.attempts >= this.OTP_MAX_ATTEMPTS) {
      this.clearOtp(userId);
      throw new AppError(
        'Trop de tentatives. Veuillez demander un nouveau code.',
        400
      );
    }

    if (storedOtp.otp !== otp) {
      storedOtp.attempts += 1;
      this.storeOtp(userId, storedOtp.otp, storedOtp.attempts);
      throw new AppError('OTP invalide', 400);
    }

    await this.repository.verifyEmail(userId);
    this.clearOtp(userId);

    return true;
  }

  async resendOtp(userId: string): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }
    if (user.emailVerifie) {
      throw new AppError('Email déjà vérifié', 400);
    }

    const otp = AuthUtils.generateOtp();
    this.storeOtp(userId, otp);

    await this.emailService.sendOtpEmail(user.email, otp, user.prenom);
  }

  // ------------------------------------------
  // TOKENS
  // ------------------------------------------

  async refreshTokens(refreshToken: string): Promise<TokensResponse> {
    let decoded: { userId?: string };
    try {
      decoded = AuthUtils.verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refresh_secret'
      ) as { userId?: string };
    } catch {
      throw new AppError('Refresh token invalide ou expiré', 401);
    }

    if (!decoded?.userId) {
      throw new AppError('Refresh token invalide', 401);
    }

    const user = await this.repository.findByRefreshToken(refreshToken);
    if (!user) {
      throw new AppError('Refresh token révoqué', 401);
    }

    const tokens = this.generateTokens(user.id, user.role);
    await this.repository.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.repository.updateRefreshToken(userId, null);
  }

  // ------------------------------------------
  // MOT DE PASSE
  // ------------------------------------------

  async forgotPassword(email: string): Promise<void> {
    const user = await this.repository.findByEmail(email);

    // Sécurité : ne pas révéler l'existence de l'email
    if (!user) return;

    const resetToken = AuthUtils.generateResetToken();
    this.storeResetToken(user.id, resetToken);

    try {
      await this.emailService.sendResetPasswordEmail(
        user.email,
        resetToken,
        user.prenom
      );
    } catch (err) {
      console.error('⚠️ Échec envoi email reset:', err);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Valider le mot de passe
    const passwordValidation = AuthUtils.isStrongPassword(newPassword);
    if (!passwordValidation.valid) {
      throw new AppError(
        `Mot de passe faible: ${passwordValidation.errors.join(', ')}`,
        400
      );
    }

    const resetData = this.getStoredResetToken(token);
    if (!resetData) {
      throw new AppError('Token de réinitialisation invalide', 400);
    }

    if (resetData.used) {
      this.clearResetToken(token);
      throw new AppError('Ce token a déjà été utilisé', 400);
    }

    if (Date.now() > resetData.expiresAt) {
      this.clearResetToken(token);
      throw new AppError('Le token a expiré. Veuillez refaire une demande.', 400);
    }

    // Mettre à jour le mot de passe
    const hashedPassword = await AuthUtils.hashPassword(newPassword);
    await this.repository.updatePassword(resetData.userId, hashedPassword);

    // Marquer le token comme utilisé
    resetData.used = true;
    this.storeResetToken(resetData.userId, token, resetData.used);

    // Envoyer confirmation
    const user = await this.repository.findById(resetData.userId);
    if (user) {
      try {
        await this.emailService.sendPasswordChangedEmail(
          user.email,
          user.prenom
        );
      } catch (err) {
        console.error('⚠️ Échec envoi email confirmation:', err);
      }
    }
  }

  async changePassword(
    userId: string,
    ancienMotDePasse: string,
    nouveauMotDePasse: string
  ): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const isValid = await AuthUtils.verifyPassword(
      ancienMotDePasse,
      user.motDePasse
    );
    if (!isValid) {
      throw new AppError('Ancien mot de passe incorrect', 400);
    }

    const passwordValidation = AuthUtils.isStrongPassword(nouveauMotDePasse);
    if (!passwordValidation.valid) {
      throw new AppError(
        `Mot de passe faible: ${passwordValidation.errors.join(', ')}`,
        400
      );
    }

    const hashedPassword = await AuthUtils.hashPassword(nouveauMotDePasse);
    await this.repository.updatePassword(userId, hashedPassword);

    // Notification (non bloquant)
    try {
      await this.emailService.sendPasswordChangedEmail(user.email, user.prenom);
    } catch (err) {
      console.error('⚠️ Échec envoi email:', err);
    }
  }

  // ------------------------------------------
  // PROFIL
  // ------------------------------------------

  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await this.repository.getUserInfo(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }
    return user;
  }

  async updateProfile(
    userId: string,
    data: {
      prenom?: string;
      nom?: string;
      telephone?: string;
      photoProfil?: string;
    }
  ): Promise<UserResponse> {
    return this.repository.updateProfile(userId, data);
  }

  // ------------------------------------------
  // STORES OTP (privés, synchrones)
  // ------------------------------------------

  private storeOtp(userId: string, otp: string, attempts = 0): void {
    globalThis.otpStore.set(userId, {
      otp,
      expiresAt: Date.now() + this.OTP_TTL_MS,
      attempts,
    });
  }

  private getStoredOtp(userId: string): IOtpStore | null {
    return globalThis.otpStore.get(userId) ?? null;
  }

  private clearOtp(userId: string): void {
    globalThis.otpStore.delete(userId);
  }

  // ------------------------------------------
  // STORES RESET TOKEN (privés, synchrones)
  // ------------------------------------------

  private storeResetToken(
    userId: string,
    token: string,
    used = false
  ): void {
    globalThis.resetTokenStore.set(token, {
      token,
      userId,
      expiresAt: Date.now() + this.RESET_TOKEN_TTL_MS,
      used,
    });
  }

  private getStoredResetToken(token: string): IResetTokenStore | null {
    return globalThis.resetTokenStore.get(token) ?? null;
  }

  private clearResetToken(token: string): void {
    globalThis.resetTokenStore.delete(token);
  }

  // ------------------------------------------
  // TOKENS JWT
  // ------------------------------------------

  private generateTokens(userId: string, role: string): TokensResponse {
    return {
      accessToken: AuthUtils.generateAccessToken(userId, role),
      refreshToken: AuthUtils.generateRefreshToken(userId),
    };
  }
}

// Singleton
export const authService = new AuthService();