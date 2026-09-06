// backend/src/modules/auth/auth.utils.ts

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthUtils {
  /**
   * Générer un OTP à 6 chiffres
   */
  static generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Générer un token de réinitialisation de mot de passe
   */
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hasher un mot de passe
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Vérifier un mot de passe
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Générer un token d'accès JWT
   */
  static generateAccessToken(userId: string, role: string): string {
    const secret = process.env.JWT_SECRET || 'default_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(
      { userId, role },
      secret,
      { expiresIn }
    );
  }

  /**
   * Générer un refresh token JWT
   */
  static generateRefreshToken(userId: string): string {
    const secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    return jwt.sign(
      { userId },
      secret,
      { expiresIn }
    );
  }

  /**
   * Vérifier et décoder un token JWT
   */
  static verifyToken(token: string, secret: string): any {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Décoder un token JWT sans vérifier la signature
   */
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Vérifier si un email est valide
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Vérifier si un mot de passe est assez fort
   */
  static isStrongPassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
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
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitizer les données utilisateur (enlever le mot de passe)
   */
  static sanitizeUser(user: any): any {
    const { motDePasse, jetonActualisation, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}