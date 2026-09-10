// backend/src/modules/auth/auth.utils.ts

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Utilisateur, RoleUtilisateur } from '@prisma/client';
import type { UserResponse, TokensResponse } from './auth.types';

// ============================================
// TYPES INTERNES
// ============================================

/** Payload du token d'accès JWT */
export interface AccessTokenPayload {
  userId: string;
  role: RoleUtilisateur;
  type: 'access';
}

/** Payload du refresh token JWT */
export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
}

/** Résultat de la validation d'un mot de passe */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/** Configuration JWT centralisée */
const JWT_CONFIG = {
  accessSecret: () => process.env.JWT_SECRET || 'default_secret',
  refreshSecret: () =>
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
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

  /**
   * Hasher un mot de passe avec bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Vérifier un mot de passe
   */
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

  /**
   * Vérifier si un mot de passe est assez fort
   */
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
   * Générer un token d'accès JWT
   */
  static generateAccessToken(
    userId: string,
    role: RoleUtilisateur | string
  ): string {
    const payload: AccessTokenPayload = {
      userId,
      role: role as RoleUtilisateur,
      type: 'access',
    };

    return jwt.sign(payload, JWT_CONFIG.accessSecret(), {
      expiresIn: JWT_CONFIG.accessExpiresIn(),
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    });
  }

  /**
   * Générer un refresh token JWT
   */
  static generateRefreshToken(userId: string): string {
    const payload: RefreshTokenPayload = {
      userId,
      type: 'refresh',
    };

    return jwt.sign(payload, JWT_CONFIG.refreshSecret(), {
      expiresIn: JWT_CONFIG.refreshExpiresIn(),
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    });
  }

  /**
   * Générer les deux tokens en une seule fois
   */
  static generateTokenPair(
    userId: string,
    role: RoleUtilisateur | string
  ): TokensResponse {
    return {
      accessToken: this.generateAccessToken(userId, role),
      refreshToken: this.generateRefreshToken(userId),
    };
  }

  // ------------------------------------------
  // JWT — VÉRIFICATION
  // ------------------------------------------

  /**
   * Vérifier et décoder un token d'accès
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

    return decoded;
  }

  /**
   * Vérifier et décoder un refresh token
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

    return decoded;
  }

  /**
   * Vérification générique (compatibilité avec l'ancien code)
   * @deprecated Utilisez verifyAccessToken / verifyRefreshToken
   */
  static verifyToken(token: string, secret: string): jwt.JwtPayload {
    return jwt.verify(token, secret) as jwt.JwtPayload;
  }

  /**
   * Vérifier un token sans lancer d'exception
   */
  static tryVerifyAccessToken(
    token: string
  ): AccessTokenPayload | null {
    try {
      return this.verifyAccessToken(token);
    } catch {
      return null;
    }
  }

  /**
   * Vérifier un refresh token sans lancer d'exception
   */
  static tryVerifyRefreshToken(
    token: string
  ): RefreshTokenPayload | null {
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

  /**
   * Vérifier si un email est valide
   */
  static isValidEmail(email: string): boolean {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Vérifier si un numéro de téléphone est valide (format international simple)
   */
  static isValidPhone(phone: string): boolean {
    if (typeof phone !== 'string') return false;
    const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;
    return phoneRegex.test(phone.trim());
  }

  /**
   * Vérifier si une chaîne est vide ou whitespace
   */
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
   * Retirer les champs sensibles d'un utilisateur
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
   * Masquer partiellement un email (pour logs)
   */
  static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const visible = local.slice(0, 2);
    const masked = '*'.repeat(Math.max(local.length - 2, 1));
    return `${visible}${masked}@${domain}`;
  }

  /**
   * Masquer un numéro de téléphone
   */
  static maskPhone(phone: string): string {
    if (phone.length <= 4) return '****';
    return phone.slice(0, 2) + '*'.repeat(phone.length - 4) + phone.slice(-2);
  }

  // ------------------------------------------
  // HACHAGE DIVERS
  // ------------------------------------------

  /**
   * Hasher une chaîne (SHA-256) — pour stockage de tokens en base par ex.
   */
  static hashString(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  /**
   * Comparer deux chaînes en temps constant (protection timing attack)
   */
  static safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Vérifier un OTP en temps constant
   */
  static safeCompareOtp(provided: string, stored: string): boolean {
    return this.safeCompare(provided, stored);
  }

  // ------------------------------------------
  // HELPERS TEMPS
  // ------------------------------------------

  /**
   * Convertir une durée "15m", "7d", "30d" en millisecondes
   */
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

  /**
   * Ajouter une durée à une date
   */
  static addDuration(date: Date, duration: string): Date {
    return new Date(date.getTime() + this.parseDurationToMs(duration));
  }
}