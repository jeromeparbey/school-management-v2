// backend/src/modules/auth/auth.utils.ts

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Utilisateur, RoleUtilisateur } from '@prisma/client';
import type { UserResponse, TokensResponse } from './auth.types';
import type { UserScope } from '../../types/express';

// ============================================
// TYPES INTERNES
// ============================================

/** Rôles du catalogue global */
export type RoleGlobal = 'SUPER_ADMIN' | 'ADMIN_SYSTEME';

/**
 * Payload du token d'accès JWT.
 * ⚠️ Doit rester SYNCHRONISÉ avec `types/express.d.ts` (AuthUserPayload).
 */
export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: RoleUtilisateur | RoleGlobal;
  type: 'access';

  /** Scope métier : catalogue global vs tenant */
  scope: UserScope;

  /** ID de l'établissement (uniquement si scope = 'TENANT') */
  etablissementId?: string;

  /** Nom du schéma PostgreSQL du tenant (uniquement si scope = 'TENANT') */
  schemaName?: string;
}

/**
 * Payload du refresh token JWT.
 */
export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
  scope: UserScope;
  etablissementId?: string;
  schemaName?: string;
}

/** Résultat de la validation d'un mot de passe */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Input pour générer un access token.
 */
export interface GenerateAccessTokenInput {
  userId: string;
  email: string;
  role: RoleUtilisateur | RoleGlobal;
  scope: UserScope;
  etablissementId?: string;
  schemaName?: string;
}

/**
 * Input pour générer un refresh token.
 */
export interface GenerateRefreshTokenInput {
  userId: string;
  scope: UserScope;
  etablissementId?: string;
  schemaName?: string;
}

/** Configuration JWT centralisée */
const JWT_CONFIG = {
  accessSecret: () => process.env.JWT_SECRET || 'default_secret',
  refreshSecret: () => process.env.JWT_REFRESH_SECRET || 'refresh_secret',
  accessExpiresIn: () =>
    (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  refreshExpiresIn: () =>
    (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'],
  issuer: process.env.JWT_ISSUER || 'school-management',
  audience: process.env.JWT_AUDIENCE || 'school-management-api',
} as const;

// ============================================
// CLASSE UTILITAIRE
// ============================================

export class AuthUtils {
  // ------------------------------------------
  // GÉNÉRATION DE CODES / TOKENS ALÉATOIRES
  // ------------------------------------------

  /**
   * Générer un OTP à 6 chiffres (cryptographiquement sûr)
   */
  static generateOtp(): string {
    const buffer = crypto.randomBytes(4);
    const num = buffer.readUInt32BE(0) % 1_000_000;
    return num.toString().padStart(6, '0');
  }

  /**
   * Générer un token de réinitialisation de mot de passe
   */
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Générer un identifiant de session unique
   */
  static generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // ------------------------------------------
  // MOTS DE PASSE
  // ------------------------------------------

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch {
      return false;
    }
  }

  static isStrongPassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (typeof password !== 'string' || password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\;'`~]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    if (password.length > 128) {
      errors.push('Le mot de passe ne doit pas dépasser 128 caractères');
    }

    return { valid: errors.length === 0, errors };
  }

  // ------------------------------------------
  // JWT — GÉNÉRATION
  // ------------------------------------------

  /**
   * Générer un token d'accès JWT.
   *
   * ⚠️ Nouvelle signature : accepte un objet au lieu de `(userId, role)`.
   * Cela permet d'injecter `scope`, `etablissementId` et `schemaName`.
   */
  static generateAccessToken(input: GenerateAccessTokenInput): string {
    const payload: AccessTokenPayload = {
      userId: input.userId,
      email: input.email,
      role: input.role,
      type: 'access',
      scope: input.scope,
      ...(input.etablissementId && { etablissementId: input.etablissementId }),
      ...(input.schemaName && { schemaName: input.schemaName }),
    };

    return jwt.sign(payload, JWT_CONFIG.accessSecret(), {
      expiresIn: JWT_CONFIG.accessExpiresIn(),
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    });
  }

  /**
   * Générer un refresh token JWT.
   *
   * ⚠️ Nouvelle signature : accepte un objet au lieu de `userId`.
   */
  static generateRefreshToken(input: GenerateRefreshTokenInput): string {
    const payload: RefreshTokenPayload = {
      userId: input.userId,
      type: 'refresh',
      scope: input.scope,
      ...(input.etablissementId && { etablissementId: input.etablissementId }),
      ...(input.schemaName && { schemaName: input.schemaName }),
    };

    return jwt.sign(payload, JWT_CONFIG.refreshSecret(), {
      expiresIn: JWT_CONFIG.refreshExpiresIn(),
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    });
  }

  /**
   * Générer les deux tokens en une seule fois.
   *
   * ⚠️ Nouvelle signature : accepte un objet.
   */
  static generateTokenPair(input: {
    userId: string;
    email: string;
    role: RoleUtilisateur | RoleGlobal;
    scope: UserScope;
    etablissementId?: string;
    schemaName?: string;
  }): TokensResponse {
    return {
      accessToken: this.generateAccessToken(input),
      refreshToken: this.generateRefreshToken({
        userId: input.userId,
        scope: input.scope,
        etablissementId: input.etablissementId,
        schemaName: input.schemaName,
      }),
    };
  }

  // ------------------------------------------
  // JWT — VÉRIFICATION
  // ------------------------------------------

  /**
   * Vérifier et décoder un token d'accès.
   * @throws JsonWebTokenError | TokenExpiredError
   */
  static verifyAccessToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, JWT_CONFIG.accessSecret(), {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    }) as AccessTokenPayload;

    if (decoded.type !== 'access') {
      throw new jwt.JsonWebTokenError('Type de token invalide');
    }

    if (!decoded.scope) {
      throw new jwt.JsonWebTokenError('Scope manquant dans le token');
    }

    return decoded;
  }

  /**
   * Vérifier et décoder un refresh token.
   * @throws JsonWebTokenError | TokenExpiredError
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    const decoded = jwt.verify(token, JWT_CONFIG.refreshSecret(), {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    }) as RefreshTokenPayload;

    if (decoded.type !== 'refresh') {
      throw new jwt.JsonWebTokenError('Type de token invalide');
    }

    if (!decoded.scope) {
      throw new jwt.JsonWebTokenError('Scope manquant dans le token');
    }

    return decoded;
  }

  /**
   * Vérification générique (compatibilité avec l'ancien code)
   * @deprecated Utilisez verifyAccessToken / verifyRefreshToken
   */
  static verifyToken(token: string, secret: string): jwt.JwtPayload {
    return jwt.verify(token, secret) as jwt.JwtPayload;
  }

  static tryVerifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      return this.verifyAccessToken(token);
    } catch {
      return null;
    }
  }

  static tryVerifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return this.verifyRefreshToken(token);
    } catch {
      return null;
    }
  }

  /**
   * Décoder un token sans vérifier la signature (debug uniquement)
   */
  static decodeToken(token: string): jwt.JwtPayload | null {
    const decoded = jwt.decode(token);
    return typeof decoded === 'object' ? (decoded as jwt.JwtPayload) : null;
  }

  /**
   * Vérifier si un token est expiré
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || typeof decoded.exp !== 'number') return true;
    return Date.now() >= decoded.exp * 1000;
  }

  // ------------------------------------------
  // VALIDATION
  // ------------------------------------------

  static isValidEmail(email: string): boolean {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  static isValidPhone(phone: string): boolean {
    if (typeof phone !== 'string') return false;
    const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;
    return phoneRegex.test(phone.trim());
  }

  static isEmpty(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    );
  }

  // ------------------------------------------
  // SANITIZATION
  // ------------------------------------------

  /**
   * Retirer les champs sensibles d'un utilisateur (tenant).
   */
  static sanitizeUser(user: Utilisateur): UserResponse {
    return {
      id: user.id,
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      role: user.role,
      estActif: user.estActif,
      emailVerifie: user.emailVerifie,
      telephone: user.telephone,
      photoProfil: user.photoProfil,
      derniereConnexion: user.derniereConnexion,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Retirer les champs sensibles d'un utilisateur GLOBAL (SUPER_ADMIN).
   */
  static sanitizeGlobalUser(user: {
    id: string;
    email: string;
    prenom: string;
    nom: string;
    role: string;
    estActif: boolean;
    emailVerifie: boolean;
    telephone: string | null;
    photoProfil: string | null;
    derniereConnexion: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponse {
    return {
      id: user.id,
      email: user.email,
      prenom: user.prenom,
      nom: user.nom,
      role: user.role as RoleUtilisateur,
      estActif: user.estActif,
      emailVerifie: user.emailVerifie,
      telephone: user.telephone,
      photoProfil: user.photoProfil,
      derniereConnexion: user.derniereConnexion,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const visible = local.slice(0, 2);
    const masked = '*'.repeat(Math.max(local.length - 2, 1));
    return `${visible}${masked}@${domain}`;
  }

  static maskPhone(phone: string): string {
    if (phone.length <= 4) return '****';
    return phone.slice(0, 2) + '*'.repeat(phone.length - 4) + phone.slice(-2);
  }

  // ------------------------------------------
  // HACHAGE DIVERS
  // ------------------------------------------

  static hashString(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  static safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  static safeCompareOtp(provided: string, stored: string): boolean {
    return this.safeCompare(provided, stored);
  }

  // ------------------------------------------
  // HELPERS TEMPS
  // ------------------------------------------

  static parseDurationToMs(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) throw new Error(`Durée invalide: ${duration}`);

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }

  static addDuration(date: Date, duration: string): Date {
    return new Date(date.getTime() + this.parseDurationToMs(duration));
  }
}