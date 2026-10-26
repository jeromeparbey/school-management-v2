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
import { globalPrisma } from '../../config/global-db';

// ============================================
// INITIALISATION DES STORES GLOBAUX
// ============================================

if (!globalThis.otpStore) {
  globalThis.otpStore = new Map<string, IOtpStore>();
}
if (!globalThis.resetTokenStore) {
  globalThis.resetTokenStore = new Map<string, IResetTokenStore>();
}
// ⭐ AJOUT : store OTP dédié au reset password (clé = `${schemaName}:${userId}`)
if (!globalThis.resetOtpStore) {
  globalThis.resetOtpStore = new Map<string, IOtpStore>();
}

// ============================================
// CONTEXTE D'AUTHENTIFICATION TENANT
// ============================================

export interface AuthContext {
  schemaName: string;
  etablissementId: string;
}

export interface OptionalAuthContext {
  schemaName?: string;
  etablissementId?: string;
}

export interface EtablissementDTO {
  id: string;
  nom: string;
  code: string;
  logo: string | null;
  ville: string | null;
  pays: string;
  devise: string;
  type: string;
  planAbonnement: string;
  fuseauHoraire: string;
  formatDate: string;
  telephone: string | null;
  email: string | null;
}

export interface UnifiedLoginResult {
  user: UserResponse;
  etablissement: EtablissementDTO | null;
  tokens: TokensResponse;
  scope: 'TENANT' | 'GLOBAL';
}

// ============================================
// TYPES D'ENTRÉE POUR INSCRIPTIONS SPÉCIALISÉES
// ============================================

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

  // ──────────────────────────────────────────
  // HELPERS PRIVÉS
  // ──────────────────────────────────────────

  private async loadEtablissement(
    etablissementId: string
  ): Promise<EtablissementDTO | null> {
    try {
      const etab = await globalPrisma.etablissement.findUnique({
        where: { id: etablissementId },
        select: {
          id: true,
          nom: true,
          code: true,
          logo: true,
          ville: true,
          pays: true,
          devise: true,
          type: true,
          planAbonnement: true,
          fuseauHoraire: true,
          formatDate: true,
          telephone: true,
          email: true,
        },
      });
      return etab as EtablissementDTO | null;
    } catch {
      return null;
    }
  }

  // ──────────────────────────────────────────
  // INSCRIPTION GÉNÉRIQUE
  // ──────────────────────────────────────────

  async register(
    ctx: AuthContext,
    data: RegisterRequest
  ): Promise<{
    user: UserResponse;
    etablissement: EtablissementDTO | null;
    tokens: TokensResponse;
  }> {
    const { schemaName, etablissementId } = ctx;
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

    const user = await this.repository.create(schemaName, {
      email,
      motDePasse: hashedPassword,
      prenom: data.prenom,
      nom: data.nom,
      role: data.role ?? 'ENSEIGNANT',
      telephone: data.telephone,
    });

    const otp = AuthUtils.generateOtp();
    this.storeOtp(user.id, otp);

    try {
      await this.emailService.sendOtpEmail(user.email, otp, user.prenom);
    } catch (err) {
      console.error('⚠️ Échec envoi OTP:', err);
    }

    const tokens = this.generateTokens(user.id, user.email, user.role, ctx);
    await this.repository.updateRefreshToken(
      schemaName,
      user.id,
      tokens.refreshToken
    );

    const etablissement = await this.loadEtablissement(etablissementId);

    return {
      user: AuthUtils.sanitizeUser(user as any),
      etablissement,
      tokens,
    };
  }

  // ──────────────────────────────────────────
  // INSCRIPTION — ÉLÈVE
  // ──────────────────────────────────────────

  async registerEleve(
    ctx: AuthContext,
    data: RegisterEleveRequest
  ): Promise<{
    user: UserResponse;
    etablissement: EtablissementDTO | null;
    tokens: TokensResponse;
    matricule: string;
  }> {
    const { schemaName, etablissementId } = ctx;
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

    const tokens = this.generateTokens(user.id, user.email, user.role, ctx);
    await this.repository.updateRefreshToken(
      schemaName,
      user.id,
      tokens.refreshToken
    );

    const etablissement = await this.loadEtablissement(etablissementId);

    return {
      user: AuthUtils.sanitizeUser(user as any),
      etablissement,
      tokens,
      matricule: eleve.matricule,
    };
  }

  // ──────────────────────────────────────────
  // INSCRIPTION — SURVEILLANT
  // ──────────────────────────────────────────

  async registerSurveillant(
    ctx: AuthContext,
    data: RegisterSurveillantRequest
  ): Promise<{
    user: UserResponse;
    etablissement: EtablissementDTO | null;
    tokens: TokensResponse;
    matricule: string;
  }> {
    const { schemaName, etablissementId } = ctx;
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

    const tokens = this.generateTokens(user.id, user.email, user.role, ctx);
    await this.repository.updateRefreshToken(
      schemaName,
      user.id,
      tokens.refreshToken
    );

    const etablissement = await this.loadEtablissement(etablissementId);

    return {
      user: AuthUtils.sanitizeUser(user as any),
      etablissement,
      tokens,
      matricule: surveillant.matricule,
    };
  }

  // ══════════════════════════════════════════
  // 🎯 CONNEXION UNIFIÉE (TOUS RÔLES)
  // ══════════════════════════════════════════

  async login(
    ctx: AuthContext | null,
    data: LoginRequest
  ): Promise<UnifiedLoginResult> {
    const email = data.email.toLowerCase().trim();

    // ÉTAPE 1 : Tentative SUPER_ADMIN
    const superAdmin = await this.findSuperAdminInCatalog(email);

    if (superAdmin) {
      const isValid = await AuthUtils.verifyPassword(
        data.motDePasse,
        superAdmin.motDePasse
      );

      if (!isValid) {
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      if (!superAdmin.estActif) {
        throw new AppError('Compte super-admin désactivé', 403);
      }

      try {
        await globalPrisma.utilisateurGlobal.update({
          where: { id: superAdmin.id },
          data: { derniereConnexion: new Date() },
        });
      } catch (err) {
        console.error('⚠️ Échec mise à jour derniereConnexion:', err);
      }

      const tokens = this.generateSuperAdminTokens(
        superAdmin.id,
        superAdmin.email
      );

      try {
        await globalPrisma.utilisateurGlobal.update({
          where: { id: superAdmin.id },
          data: { jetonActualisation: tokens.refreshToken },
        });
      } catch (err) {
        console.error('⚠️ Échec persistance refresh token SA:', err);
      }

      return {
        user: this.sanitizeSuperAdmin(superAdmin),
        etablissement: null,
        tokens,
        scope: 'GLOBAL',
      };
    }

    // ÉTAPE 2 : Tentative utilisateur tenant
    if (!ctx?.schemaName) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    const { schemaName, etablissementId } = ctx;
    const user = await this.repository.findByEmail(schemaName, email);

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

    const tokens = this.generateTokens(user.id, user.email, user.role, ctx);
    await this.repository.updateRefreshToken(
      schemaName,
      user.id,
      tokens.refreshToken
    );

    const etablissement = await this.loadEtablissement(etablissementId);

    return {
      user: AuthUtils.sanitizeUser(user as any),
      etablissement,
      tokens,
      scope: 'TENANT',
    };
  }

  // ──────────────────────────────────────────
  // CONNEXION — ÉLÈVE
  // ──────────────────────────────────────────

  async loginEleve(
    ctx: AuthContext,
    data: LoginRequest
  ): Promise<{
    user: UserResponse;
    etablissement: EtablissementDTO | null;
    tokens: TokensResponse;
    eleve: {
      id: string;
      matricule: string;
      statut: string;
    };
  }> {
    const { schemaName, etablissementId } = ctx;
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

    const tokens = this.generateTokens(user.id, user.email, user.role, ctx);
    await this.repository.updateRefreshToken(
      schemaName,
      user.id,
      tokens.refreshToken
    );

    const etablissement = await this.loadEtablissement(etablissementId);

    return {
      user: AuthUtils.sanitizeUser(user as any),
      etablissement,
      tokens,
      eleve: {
        id: userWithEleve.eleve.id,
        matricule: userWithEleve.eleve.matricule,
        statut: userWithEleve.eleve.statut,
      },
    };
  }

  // ──────────────────────────────────────────
  // CONNEXION — SURVEILLANT
  // ──────────────────────────────────────────

  async loginSurveillant(
    ctx: AuthContext,
    data: LoginRequest
  ): Promise<{
    user: UserResponse;
    etablissement: EtablissementDTO | null;
    tokens: TokensResponse;
    surveillant: {
      id: string;
      matricule: string;
      zoneSurveillance: string | null;
    };
  }> {
    const { schemaName, etablissementId } = ctx;
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

    const tokens = this.generateTokens(user.id, user.email, user.role, ctx);
    await this.repository.updateRefreshToken(
      schemaName,
      user.id,
      tokens.refreshToken
    );

    const etablissement = await this.loadEtablissement(etablissementId);

    return {
      user: AuthUtils.sanitizeUser(user as any),
      etablissement,
      tokens,
      surveillant: {
        id: userWithSurv.surveillant.id,
        matricule: userWithSurv.surveillant.matricule,
        zoneSurveillance: userWithSurv.surveillant.zoneSurveillance,
      },
    };
  }

  // ──────────────────────────────────────────
  // OTP (vérification email)
  // ──────────────────────────────────────────

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

  // ──────────────────────────────────────────
  // TOKENS
  // ──────────────────────────────────────────

  async refreshTokens(
    ctx: AuthContext | null,
    refreshToken: string
  ): Promise<TokensResponse> {
    let decoded: { userId?: string; scope?: string };
    try {
      decoded = AuthUtils.verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Refresh token invalide ou expiré', 401);
    }

    if (!decoded?.userId) {
      throw new AppError('Refresh token invalide', 401);
    }

    if (decoded.scope === 'GLOBAL') {
      const superAdmin = await globalPrisma.utilisateurGlobal.findFirst({
        where: {
          id: decoded.userId,
          jetonActualisation: refreshToken,
          role: 'SUPER_ADMIN',
        },
      });

      if (!superAdmin) {
        throw new AppError('Refresh token révoqué', 401);
      }

      if (!superAdmin.estActif) {
        throw new AppError('Compte super-admin désactivé', 403);
      }

      const tokens = this.generateSuperAdminTokens(
        superAdmin.id,
        superAdmin.email
      );

      await globalPrisma.utilisateurGlobal.update({
        where: { id: superAdmin.id },
        data: { jetonActualisation: tokens.refreshToken },
      });

      return tokens;
    }

    if (!ctx?.schemaName) {
      throw new AppError(
        'Contexte tenant requis pour rafraîchir ce token',
        400
      );
    }

    const user = await this.repository.findByRefreshToken(
      ctx.schemaName,
      refreshToken
    );
    if (!user) {
      throw new AppError('Refresh token révoqué', 401);
    }

    const tokens = this.generateTokens(
      user.id,
      user.email,
      user.role,
      ctx as AuthContext
    );
    await this.repository.updateRefreshToken(
      ctx.schemaName,
      user.id,
      tokens.refreshToken
    );

    return tokens;
  }

  async logout(ctx: AuthContext | null, userId: string): Promise<void> {
    if (ctx?.schemaName) {
      try {
        await this.repository.updateRefreshToken(ctx.schemaName, userId, null);
      } catch {
        /* ignore */
      }
    }

    try {
      await globalPrisma.utilisateurGlobal.update({
        where: { id: userId },
        data: { jetonActualisation: null },
      });
    } catch {
      /* pas un super-admin, ou inexistant — ignore */
    }
  }

  // ──────────────────────────────────────────
  // MOT DE PASSE
  // ──────────────────────────────────────────

  /**
   * ⭐ MODIFIÉ — Envoie un OTP à 6 chiffres par email (au lieu d'un lien).
   *
   * Retourne `{ email, etablissementId }` pour que le controller puisse
   * renvoyer ces infos au frontend (la page `/verify-reset-otp` en a besoin).
   *
   * ⚠️ Anti-énumération : si l'email n'existe pas, on retourne quand même
   * un résultat neutre (pas d'erreur, pas d'OTP envoyé).
   */
  async forgotPassword(
    ctx: AuthContext,
    email: string
  ): Promise<{ email: string; etablissementId: string }> {
    const { schemaName, etablissementId } = ctx;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.repository.findByEmail(schemaName, normalizedEmail);

    if (!user) {
      // Ne pas révéler que l'email n'existe pas
      return { email: normalizedEmail, etablissementId };
    }

    // ⭐ Génère un OTP dédié reset (store séparé)
    const otp = AuthUtils.generateOtp();
    this.storeResetOtp(schemaName, user.id, otp);

    try {
      await this.emailService.sendOtpEmail(
        user.email,
        otp,
        user.prenom
      );
    } catch (err) {
      console.error('⚠️ Échec envoi OTP reset:', err);
    }

    return { email: normalizedEmail, etablissementId };
  }

  /**
   * ⭐ AJOUT — Vérifie l'OTP de reset password.
   * Si valide → génère un `resetToken` (utilisable une seule fois,
   * 24h) et le retourne au frontend.
   *
   * Ne marque PAS `emailVerifie = true` (ce n'est pas le but).
   */
  async verifyResetOtp(
    ctx: AuthContext,
    email: string,
    otp: string
  ): Promise<{ resetToken: string; etablissementId: string }> {
    const { schemaName, etablissementId } = ctx;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.repository.findByEmail(schemaName, normalizedEmail);
    if (!user) {
      throw new AppError('Code invalide ou expiré', 400);
    }

    const stored = this.getStoredResetOtp(schemaName, user.id);
    if (!stored) {
      throw new AppError('Code invalide ou expiré', 400);
    }

    if (Date.now() > stored.expiresAt) {
      this.clearResetOtp(schemaName, user.id);
      throw new AppError('Code expiré. Veuillez refaire une demande.', 400);
    }

    if (stored.attempts >= this.OTP_MAX_ATTEMPTS) {
      this.clearResetOtp(schemaName, user.id);
      throw new AppError(
        'Trop de tentatives. Veuillez refaire une demande.',
        400
      );
    }

    if (stored.otp !== otp) {
      stored.attempts += 1;
      this.storeResetOtp(schemaName, user.id, stored.otp, stored.attempts);
      throw new AppError('Code invalide', 400);
    }

    // OTP OK → on génère le token de reset
    const resetToken = AuthUtils.generateResetToken();
    this.storeResetToken(user.id, resetToken);
    this.clearResetOtp(schemaName, user.id);

    return { resetToken, etablissementId };
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

  // ──────────────────────────────────────────
  // PROFIL
  // ──────────────────────────────────────────

  async getCurrentUser(
    ctx: AuthContext,
    userId: string
  ): Promise<{
    user: UserResponse;
    etablissement: EtablissementDTO | null;
  }> {
    const superAdmin = await globalPrisma.utilisateurGlobal.findFirst({
      where: {
        id: userId,
        role: 'SUPER_ADMIN',
      },
    });

    if (superAdmin) {
      return {
        user: this.sanitizeSuperAdmin(superAdmin),
        etablissement: null,
      };
    }

    const user = await this.repository.getUserInfo(ctx.schemaName, userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }
    const etablissement = await this.loadEtablissement(ctx.etablissementId);
    return {
      user: user as unknown as UserResponse,
      etablissement,
    };
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

  // ──────────────────────────────────────────
  // PROFIL ÉLÈVE / SURVEILLANT
  // ──────────────────────────────────────────

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

  // ──────────────────────────────────────────
  // UTILITAIRE
  // ──────────────────────────────────────────

  async findUserInSchema(schemaName: string, email: string): Promise<boolean> {
    return this.repository.emailExists(schemaName, email);
  }

  private async findSuperAdminInCatalog(email: string): Promise<{
    id: string;
    email: string;
    motDePasse: string;
    prenom: string;
    nom: string;
    role: string;
    estActif: boolean;
    emailVerifie: boolean;
    telephone: string | null;
    photoProfil: string | null;
    derniereConnexion: Date | null;
    etablissementId: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    try {
      const sa = await globalPrisma.utilisateurGlobal.findFirst({
        where: {
          email,
          role: 'SUPER_ADMIN',
        },
      });

      if (!sa) return null;

      return {
        id: sa.id,
        email: sa.email,
        motDePasse: sa.motDePasse,
        prenom: sa.prenom,
        nom: sa.nom,
        role: sa.role,
        estActif: sa.estActif,
        emailVerifie: sa.emailVerifie,
        telephone: sa.telephone,
        photoProfil: sa.photoProfil,
        derniereConnexion: sa.derniereConnexion,
        etablissementId: sa.etablissementId,
        createdAt: sa.createdAt,
        updatedAt: sa.updatedAt,
      };
    } catch {
      return null;
    }
  }

  private sanitizeSuperAdmin(sa: any): UserResponse {
    return AuthUtils.sanitizeGlobalUser(sa);
  }

  // ──────────────────────────────────────────
  // STORES OTP INSCRIPTION (privés)
  // ──────────────────────────────────────────

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

  // ──────────────────────────────────────────
  // ⭐ STORES OTP RESET PASSWORD (privés)
  // Clé = `${schemaName}:${userId}` pour éviter les collisions
  // entre tenants et avec l'OTP d'inscription.
  // ──────────────────────────────────────────

  private storeResetOtp(
    schemaName: string,
    userId: string,
    otp: string,
    attempts = 0
  ): void {
    const key = `${schemaName}:${userId}`;
    globalThis.resetOtpStore.set(key, {
      otp,
      expiresAt: Date.now() + this.OTP_TTL_MS,
      attempts,
    });
  }

  private getStoredResetOtp(
    schemaName: string,
    userId: string
  ): IOtpStore | null {
    const key = `${schemaName}:${userId}`;
    return globalThis.resetOtpStore.get(key) ?? null;
  }

  private clearResetOtp(schemaName: string, userId: string): void {
    const key = `${schemaName}:${userId}`;
    globalThis.resetOtpStore.delete(key);
  }

  // ──────────────────────────────────────────
  // STORES RESET TOKEN (privés)
  // ──────────────────────────────────────────

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

  // ──────────────────────────────────────────
  // TOKENS JWT
  // ──────────────────────────────────────────

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

  private generateSuperAdminTokens(
    userId: string,
    email: string
  ): TokensResponse {
    return {
      accessToken: AuthUtils.generateAccessToken({
        userId,
        email,
        role: 'SUPER_ADMIN' as any,
        scope: 'GLOBAL',
      }),
      refreshToken: AuthUtils.generateRefreshToken({
        userId,
        scope: 'GLOBAL',
      }),
    };
  }
}

// Singleton
export const authService = new AuthService();