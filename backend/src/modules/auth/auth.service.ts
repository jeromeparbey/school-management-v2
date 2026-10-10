// backend/src/modules/auth/auth.service.ts

import { authRepository, AuthRepository } from './auth.repository';
import type {
  CreateEleveInput,
  CreateSurveillantInput,
} from './auth.repository';
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

if (!globalThis.otpStore) {
  globalThis.otpStore = new Map<string, IOtpStore>();
}
if (!globalThis.resetTokenStore) {
  globalThis.resetTokenStore = new Map<string, IResetTokenStore>();
}

// ============================================
// CONTEXTE D'AUTHENTIFICATION TENANT
// ============================================

/**
 * Contexte obligatoire pour toute opération liée à un tenant.
 * Transporte le schéma Prisma ET l'ID du catalogue (Etablissement.id).
 *
 * - `schemaName` : utilisé par le repository pour cibler le bon schéma PG
 * - `etablissementId` : injecté dans le JWT (scope TENANT) pour permettre
 *   au authMiddleware de retrouver l'établissement sans requête supplémentaire.
 */
export interface AuthContext {
  schemaName: string;
  etablissementId: string;
}

// ============================================
// TYPES D'ENTRÉE POUR INSCRIPTIONS SPÉCIALISÉES
// ============================================

/** Inscription d'un élève */
export interface RegisterEleveRequest {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  telephone?: string;
  sexe: string;
  dateNaissance: string;
  lieuNaissance?: string;
  nationalite?: string;
  adresse?: string;
  groupeSanguin?: string;
  allergies?: string;
  infoMedicale?: string;
}

/** Inscription d'un surveillant */
export interface RegisterSurveillantRequest {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  telephone: string;
  sexe: string;
  dateNaissance?: string;
  adresse?: string;
  dateEmbauche: string;
  typeContrat: string;
  zoneSurveillance?: string;
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
  // INSCRIPTION GÉNÉRIQUE
  // ------------------------------------------

  async register(
    ctx: AuthContext,
    data: RegisterRequest
  ): Promise<{
    user: UserResponse;
    tokens: TokensResponse;
  }> {
    const { schemaName } = ctx;
    const email = data.email.toLowerCase().trim();

    // Vérifier l'unicité
    if (await this.repository.emailExists(schemaName, email)) {
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
    const user = await this.repository.create(schemaName, {
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

    try {
      await this.emailService.sendOtpEmail(user.email, otp, user.prenom);
    } catch (err) {
      console.error('⚠️ Échec envoi OTP:', err);
    }

    // Tokens
    const tokens = this.generateTokens(
      user.id,
      user.email,
      user.role,
      ctx
    );
    await this.repository.updateRefreshToken(
      schemaName,
      user.id,
      tokens.refreshToken
    );

    return {
      user: AuthUtils.sanitizeUser(user as any),
      tokens,
    };
  }

  // ------------------------------------------
  // INSCRIPTION — ÉLÈVE
  // ------------------------------------------

  async registerEleve(
    ctx: AuthContext,
    data: RegisterEleveRequest
  ): Promise<{
    user: UserResponse;
    tokens: TokensResponse;
    matricule: string;
  }> {
    const { schemaName } = ctx;
    const email = data.email.toLowerCase().trim();

    if (await this.repository.emailExists(schemaName, email)) {
      throw new AppError('Un utilisateur avec cet email existe déjà', 409);
    }

    const passwordValidation = AuthUtils.isStrongPassword(data.motDePasse);
    if (!passwordValidation.valid) {
      throw new AppError(
        `Mot de passe faible: ${passwordValidation.errors.join(', ')}`,
        400
      );
    }

    const hashedPassword = await AuthUtils.hashPassword(data.motDePasse);

    const { user, eleve } = await this.repository.createEleve(schemaName, {
      email,
      motDePasse: hashedPassword,
      prenom: data.prenom,
      nom: data.nom,
      telephone: data.telephone,
      sexe: data.sexe,
      dateNaissance: data.dateNaissance,
      lieuNaissance: data.lieuNaissance,
      nationalite: data.nationalite,
      adresse: data.adresse,
      groupeSanguin: data.groupeSanguin,
      allergies: data.allergies,
      infoMedicale: data.infoMedicale,
    } as CreateEleveInput);

    const otp = AuthUtils.generateOtp();
    this.storeOtp(user.id, otp);

    try {
      await this.emailService.sendOtpEmail(user.email, otp, user.prenom);
    } catch (err) {
      console.error('⚠️ Échec envoi OTP:', err);
    }

    const tokens = this.generateTokens(
      user.id,
      user.email,
      user.role,
      ctx
    );
    await this.repository.updateRefreshToken(
      schemaName,
      user.id,
      tokens.refreshToken
    );

    return {
      user: AuthUtils.sanitizeUser(user as any),
      tokens,
      matricule: eleve.matricule,
    };
  }

  // ------------------------------------------
  // INSCRIPTION — SURVEILLANT
  // ------------------------------------------

  async registerSurveillant(
    ctx: AuthContext,
    data: RegisterSurveillantRequest
  ): Promise<{
    user: UserResponse;
    tokens: TokensResponse;
    matricule: string;
  }> {
    const { schemaName } = ctx;
    const email = data.email.toLowerCase().trim();

    if (await this.repository.emailExists(schemaName, email)) {
      throw new AppError('Un utilisateur avec cet email existe déjà', 409);
    }

    const passwordValidation = AuthUtils.isStrongPassword(data.motDePasse);
    if (!passwordValidation.valid) {
      throw new AppError(
        `Mot de passe faible: ${passwordValidation.errors.join(', ')}`,
        400
      );
    }

    const hashedPassword = await AuthUtils.hashPassword(data.motDePasse);

    const { user, surveillant } = await this.repository.createSurveillant(
      schemaName,
      {
        email,
        motDePasse: hashedPassword,
        prenom: data.prenom,
        nom: data.nom,
        telephone: data.telephone,
        sexe: data.sexe,
        dateNaissance: data.dateNaissance,
        adresse: data.adresse,
        dateEmbauche: data.dateEmbauche,
        typeContrat: data.typeContrat,
        zoneSurveillance: data.zoneSurveillance,
      } as CreateSurveillantInput
    );

    const otp = AuthUtils.generateOtp();
    this.storeOtp(user.id, otp);

    try {
      await this.emailService.sendOtpEmail(user.email, otp, user.prenom);
    } catch (err) {
      console.error('⚠️ Échec envoi OTP:', err);
    }

    const tokens = this.generateTokens(
      user.id,
      user.email,
      user.role,
      ctx
    );
    await this.repository.updateRefreshToken(
      schemaName,
      user.id,
      tokens.refreshToken
    );

    return {
      user: AuthUtils.sanitizeUser(user as any),
      tokens,
      matricule: surveillant.matricule,
    };
  }

  // ------------------------------------------
  // CONNEXION GÉNÉRIQUE
  // ------------------------------------------

  async login(
    ctx: AuthContext,
    data: LoginRequest
  ): Promise<{
    user: UserResponse;
    tokens: TokensResponse;
  }> {
    const { schemaName } = ctx;
    const user = await this.repository.findByEmail(schemaName, data.email);

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

    await this.repository.updateLastLogin(schemaName, user.id);

    const tokens = this.generateTokens(
      user.id,
      user.email,
      user.role,
      ctx
    );
    await this.repository.updateRefreshToken(
      schemaName,
      user.id,
      tokens.refreshToken
    );

    return {
      user: AuthUtils.sanitizeUser(user as any),
      tokens,
    };
  }

  // ------------------------------------------
  // CONNEXION — ÉLÈVE
  // ------------------------------------------

  async loginEleve(
    ctx: AuthContext,
    data: LoginRequest
  ): Promise<{
    user: UserResponse;
    tokens: TokensResponse;
    eleve: {
      id: string;
      matricule: string;
      statut: string;
    };
  }> {
    const { schemaName } = ctx;
    const user = await this.repository.findByEmail(schemaName, data.email);

    if (!user) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    if (user.role !== 'ELEVE') {
      throw new AppError("Cet utilisateur n'est pas un élève", 403);
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

    const userWithEleve = await this.repository.findEleveByUserId(
      schemaName,
      user.id
    );
    if (!userWithEleve?.eleve) {
      throw new AppError('Profil élève introuvable', 404);
    }

    await this.repository.updateLastLogin(schemaName, user.id);

    const tokens = this.generateTokens(
      user.id,
      user.email,
      user.role,
      ctx
    );
    await this.repository.updateRefreshToken(
      schemaName,
      user.id,
      tokens.refreshToken
    );

    return {
      user: AuthUtils.sanitizeUser(user as any),
      tokens,
      eleve: {
        id: userWithEleve.eleve.id,
        matricule: userWithEleve.eleve.matricule,
        statut: userWithEleve.eleve.statut,
      },
    };
  }

  // ------------------------------------------
  // CONNEXION — SURVEILLANT
  // ------------------------------------------

  async loginSurveillant(
    ctx: AuthContext,
    data: LoginRequest
  ): Promise<{
    user: UserResponse;
    tokens: TokensResponse;
    surveillant: {
      id: string;
      matricule: string;
      zoneSurveillance: string | null;
    };
  }> {
    const { schemaName } = ctx;
    const user = await this.repository.findByEmail(schemaName, data.email);

    if (!user) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    if (user.role !== 'SURVEILLANT') {
      throw new AppError("Cet utilisateur n'est pas un surveillant", 403);
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

    const userWithSurv = await this.repository.findSurveillantByUserId(
      schemaName,
      user.id
    );
    if (!userWithSurv?.surveillant) {
      throw new AppError('Profil surveillant introuvable', 404);
    }

    await this.repository.updateLastLogin(schemaName, user.id);

    const tokens = this.generateTokens(
      user.id,
      user.email,
      user.role,
      ctx
    );
    await this.repository.updateRefreshToken(
      schemaName,
      user.id,
      tokens.refreshToken
    );

    return {
      user: AuthUtils.sanitizeUser(user as any),
      tokens,
      surveillant: {
        id: userWithSurv.surveillant.id,
        matricule: userWithSurv.surveillant.matricule,
        zoneSurveillance: userWithSurv.surveillant.zoneSurveillance,
      },
    };
  }

  // ------------------------------------------
  // OTP
  // ------------------------------------------

  async verifyOtp(
    ctx: AuthContext,
    userId: string,
    otp: string
  ): Promise<boolean> {
    const { schemaName } = ctx;
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

    await this.repository.verifyEmail(schemaName, userId);
    this.clearOtp(userId);

    return true;
  }

  async resendOtp(ctx: AuthContext, userId: string): Promise<void> {
    const { schemaName } = ctx;
    const user = await this.repository.findById(schemaName, userId);
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

  async refreshTokens(
    ctx: AuthContext,
    refreshToken: string
  ): Promise<TokensResponse> {
    const { schemaName } = ctx;

    let decoded: { userId?: string };
    try {
      // ⚠️ On utilise verifyRefreshToken (vérifie signature + type)
      decoded = AuthUtils.verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Refresh token invalide ou expiré', 401);
    }

    if (!decoded?.userId) {
      throw new AppError('Refresh token invalide', 401);
    }

    const user = await this.repository.findByRefreshToken(
      schemaName,
      refreshToken
    );
    if (!user) {
      throw new AppError('Refresh token révoqué', 401);
    }

    const tokens = this.generateTokens(
      user.id,
      user.email,
      user.role,
      ctx
    );
    await this.repository.updateRefreshToken(
      schemaName,
      user.id,
      tokens.refreshToken
    );

    return tokens;
  }

  async logout(ctx: AuthContext, userId: string): Promise<void> {
    await this.repository.updateRefreshToken(ctx.schemaName, userId, null);
  }

  // ------------------------------------------
  // MOT DE PASSE
  // ------------------------------------------

  async forgotPassword(ctx: AuthContext, email: string): Promise<void> {
    const { schemaName } = ctx;
    const user = await this.repository.findByEmail(schemaName, email);

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

  async resetPassword(
    ctx: AuthContext,
    token: string,
    newPassword: string
  ): Promise<void> {
    const { schemaName } = ctx;

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

    const hashedPassword = await AuthUtils.hashPassword(newPassword);
    await this.repository.updatePassword(
      schemaName,
      resetData.userId,
      hashedPassword
    );

    resetData.used = true;
    this.storeResetToken(resetData.userId, token, resetData.used);

    const user = await this.repository.findById(schemaName, resetData.userId);
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
    ctx: AuthContext,
    userId: string,
    ancienMotDePasse: string,
    nouveauMotDePasse: string
  ): Promise<void> {
    const { schemaName } = ctx;
    const user = await this.repository.findById(schemaName, userId);
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
    await this.repository.updatePassword(schemaName, userId, hashedPassword);

    try {
      await this.emailService.sendPasswordChangedEmail(user.email, user.prenom);
    } catch (err) {
      console.error('⚠️ Échec envoi email:', err);
    }
  }

  // ------------------------------------------
  // PROFIL
  // ------------------------------------------

  async getCurrentUser(
    ctx: AuthContext,
    userId: string
  ): Promise<UserResponse> {
    const user = await this.repository.getUserInfo(ctx.schemaName, userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }
    return user as unknown as UserResponse;
  }

  async updateProfile(
    ctx: AuthContext,
    userId: string,
    data: {
      prenom?: string;
      nom?: string;
      telephone?: string;
      photoProfil?: string;
    }
  ): Promise<UserResponse> {
    const user = await this.repository.updateProfile(
      ctx.schemaName,
      userId,
      data
    );
    return user as unknown as UserResponse;
  }

  // ------------------------------------------
  // PROFIL ÉLÈVE / SURVEILLANT
  // ------------------------------------------

  async getEleveProfile(ctx: AuthContext, userId: string) {
    const userWithEleve = await this.repository.findEleveByUserId(
      ctx.schemaName,
      userId
    );
    if (!userWithEleve?.eleve) {
      throw new AppError('Profil élève introuvable', 404);
    }
    return userWithEleve.eleve;
  }

  async getSurveillantProfile(ctx: AuthContext, userId: string) {
    const userWithSurv = await this.repository.findSurveillantByUserId(
      ctx.schemaName,
      userId
    );
    if (!userWithSurv?.surveillant) {
      throw new AppError('Profil surveillant introuvable', 404);
    }
    return userWithSurv.surveillant;
  }

  // ------------------------------------------
  // UTILITAIRE : trouver l'établissement d'un email
  // ------------------------------------------

  /**
   * Vérifie si un email existe dans un schéma donné (utile pour le controller)
   */
  async findUserInSchema(schemaName: string, email: string): Promise<boolean> {
    return this.repository.emailExists(schemaName, email);
  }

  // ------------------------------------------
  // STORES OTP (privés)
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
  // STORES RESET TOKEN (privés)
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

  /**
   * Génère une paire de tokens pour un utilisateur TENANT.
   *
   * ⚠️ Injecte automatiquement :
   *  - scope: 'TENANT'
   *  - etablissementId (depuis ctx)
   *  - schemaName (depuis ctx)
   */
  private generateTokens(
    userId: string,
    email: string,
    role: string,
    ctx: AuthContext
  ): TokensResponse {
    return {
      accessToken: AuthUtils.generateAccessToken({
        userId,
        email,
        role: role as any,
        scope: 'TENANT',
        etablissementId: ctx.etablissementId,
        schemaName: ctx.schemaName,
      }),
      refreshToken: AuthUtils.generateRefreshToken({
        userId,
        scope: 'TENANT',
        etablissementId: ctx.etablissementId,
        schemaName: ctx.schemaName,
      }),
    };
  }
}

// Singleton
export const authService = new AuthService();