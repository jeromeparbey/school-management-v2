// backend/src/modules/auth/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import { authService, AuthService, AuthContext } from './auth.service';
import { AuthUtils } from './auth.utils';
import { AppError } from '../../utils/AppError';
import { globalPrisma } from '../../config/global-db';
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

// ============================================
// TYPES D'ENTRÉE SPÉCIALISÉS
// ============================================

interface RegisterEleveBody {
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

interface RegisterSurveillantBody {
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
// HELPERS INTERNES
// ============================================

const ROLES_VALIDES: RoleUtilisateur[] = [
  'DIRECTEUR',
  'SECRETAIRE',
  'ENSEIGNANT',
  'SURVEILLANT',
  'PARENT',
  'ELEVE',
  'ADMIN',
  'BIBLIOTHECAIRE',
];

/** Rôles qui ne peuvent PAS être créés via /register public */
const ROLES_RESTREINTS: RoleUtilisateur[] = [
  'ADMIN',
  'ELEVE',
  'SURVEILLANT',
  'DIRECTEUR',
];

const SEXES_VALIDES = ['M', 'F', 'MASCULIN', 'FEMININ', 'AUTRE'];
const TYPES_CONTRAT_VALIDES = ['CDI', 'CDD', 'VACATAIRE', 'STAGIAIRE', 'BENEVOLE'];
const GROUPES_SANGUINS_VALIDES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

/** Valider une date au format ISO ou YYYY-MM-DD */
function isValidDate(value: string): boolean {
  if (!value) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

/**
 * ⚠️ FONCTION CLÉ : Résout un contexte d'authentification tenant.
 * ⚠️ Retourne `null` si aucun tenant n'est trouvé (cas SUPER_ADMIN).
 *
 * - Le `schemaName` est utilisé par le repository (ciblage du schéma PG)
 * - L'`etablissementId` est injecté dans le JWT (scope TENANT)
 *
 * @returns AuthContext | null
 */
async function resolveOptionalAuthContext(
  email: string,
  etablissementId?: string
): Promise<AuthContext | null> {
  // Cas 1 : l'établissementId est fourni explicitement
  if (etablissementId) {
    const etab = await globalPrisma.etablissement.findUnique({
      where: { id: etablissementId },
      select: { id: true, schemaName: true, estActif: true },
    });

    if (!etab || !etab.estActif) {
      // Établissement fourni mais inexistant → on retourne null
      // (le service login tentera quand même SUPER_ADMIN)
      return null;
    }

    return { schemaName: etab.schemaName, etablissementId: etab.id };
  }

  // Cas 2 : chercher dans tous les établissements actifs
  const etablissements = await globalPrisma.etablissement.findMany({
    where: { estActif: true },
    select: { id: true, schemaName: true },
  });

  for (const etab of etablissements) {
    try {
      const exists = await authService.findUserInSchema(
        etab.schemaName,
        email
      );
      if (exists) {
        return { schemaName: etab.schemaName, etablissementId: etab.id };
      }
    } catch (error) {
      // Si le schéma n'existe pas ou est cassé, on passe au suivant
      console.warn(
        `⚠️ Impossible de vérifier ${etab.schemaName}:`,
        (error as Error).message
      );
      continue;
    }
  }

  // Aucun établissement trouvé → null (laisse le service gérer)
  return null;
}

/**
 * Résout un contexte tenant uniquement à partir d'un `etablissementId`.
 * Utilisé pour les routes qui ont l'ID mais pas l'email (verifyOtp, etc.).
 * ⚠️ Throw si l'établissement n'existe pas (obligatoire dans ces cas).
 */
async function resolveAuthContextById(
  etablissementId: string
): Promise<AuthContext> {
  const etab = await globalPrisma.etablissement.findUnique({
    where: { id: etablissementId },
    select: { id: true, schemaName: true, estActif: true },
  });
  if (!etab || !etab.estActif) {
    throw new AppError('Établissement introuvable ou inactif', 404);
  }
  return { schemaName: etab.schemaName, etablissementId: etab.id };
}

// ============================================
// CONTRÔLEUR
// ============================================

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = authService;
  }

  // ------------------------------------------
  // INSCRIPTION GÉNÉRIQUE
  // ------------------------------------------

  register = async (
    req: Request<{}, {}, RegisterRequest & { etablissementId?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = requireBody(req.body);

      // Validation
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
      if (body.role && ROLES_RESTREINTS.includes(body.role)) {
        throw new AppError(
          `Le rôle "${body.role}" ne peut pas être créé via cette route.`,
          403
        );
      }
      if (body.telephone && !AuthUtils.isValidPhone(body.telephone)) {
        throw new AppError('Numéro de téléphone invalide', 400);
      }
      if (!body.etablissementId) {
        throw new AppError("L'identifiant de l'établissement est requis", 400);
      }

      // Résoudre le contexte (OBLIGATOIRE pour l'inscription)
      const ctx = await resolveAuthContextById(body.etablissementId);

      const result = await this.authService.register(ctx, {
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
  // INSCRIPTION — ÉLÈVE
  // ------------------------------------------

  registerEleve = async (
    req: Request<{}, {}, RegisterEleveBody & { etablissementId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = requireBody(req.body);

      // Validations
      if (!body.email || !AuthUtils.isValidEmail(body.email)) {
        throw new AppError('Email invalide', 400);
      }
      if (!body.motDePasse) {
        throw new AppError('Mot de passe requis', 400);
      }
      if (!body.prenom?.trim() || !body.nom?.trim()) {
        throw new AppError('Prénom et nom sont obligatoires', 400);
      }
      if (!body.sexe || !SEXES_VALIDES.includes(body.sexe.toUpperCase())) {
        throw new AppError(
          `Sexe invalide. Valeurs possibles: ${SEXES_VALIDES.join(', ')}`,
          400
        );
      }
      if (!body.dateNaissance || !isValidDate(body.dateNaissance)) {
        throw new AppError('Date de naissance invalide', 400);
      }
      if (!body.etablissementId) {
        throw new AppError("L'identifiant de l'établissement est requis", 400);
      }
      if (body.telephone && !AuthUtils.isValidPhone(body.telephone)) {
        throw new AppError('Numéro de téléphone invalide', 400);
      }
      if (
        body.groupeSanguin &&
        !GROUPES_SANGUINS_VALIDES.includes(body.groupeSanguin)
      ) {
        throw new AppError('Groupe sanguin invalide', 400);
      }

      const ctx = await resolveAuthContextById(body.etablissementId);

      const result = await this.authService.registerEleve(ctx, {
        email: body.email.trim().toLowerCase(),
        motDePasse: body.motDePasse,
        prenom: body.prenom.trim(),
        nom: body.nom.trim(),
        telephone: body.telephone?.trim(),
        sexe: body.sexe.toUpperCase(),
        dateNaissance: body.dateNaissance,
        lieuNaissance: body.lieuNaissance?.trim(),
        nationalite: body.nationalite?.trim(),
        adresse: body.adresse?.trim(),
        groupeSanguin: body.groupeSanguin,
        allergies: body.allergies?.trim(),
        infoMedicale: body.infoMedicale?.trim(),
      });

      sendSuccess(
        res,
        result,
        `Inscription élève réussie. Matricule: ${result.matricule}`,
        201
      );
    } catch (error) {
      next(error);
    }
  };

  // ------------------------------------------
  // INSCRIPTION — SURVEILLANT
  // ------------------------------------------

  registerSurveillant = async (
    req: Request<{}, {}, RegisterSurveillantBody & { etablissementId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = requireBody(req.body);

      // Validations
      if (!body.email || !AuthUtils.isValidEmail(body.email)) {
        throw new AppError('Email invalide', 400);
      }
      if (!body.motDePasse) {
        throw new AppError('Mot de passe requis', 400);
      }
      if (!body.prenom?.trim() || !body.nom?.trim()) {
        throw new AppError('Prénom et nom sont obligatoires', 400);
      }
      if (!body.telephone || !AuthUtils.isValidPhone(body.telephone)) {
        throw new AppError('Numéro de téléphone valide requis', 400);
      }
      if (!body.sexe || !SEXES_VALIDES.includes(body.sexe.toUpperCase())) {
        throw new AppError(
          `Sexe invalide. Valeurs possibles: ${SEXES_VALIDES.join(', ')}`,
          400
        );
      }
      if (!body.dateEmbauche || !isValidDate(body.dateEmbauche)) {
        throw new AppError("Date d'embauche invalide", 400);
      }
      if (!body.typeContrat || !TYPES_CONTRAT_VALIDES.includes(body.typeContrat)) {
        throw new AppError(
          `Type de contrat invalide. Valeurs possibles: ${TYPES_CONTRAT_VALIDES.join(', ')}`,
          400
        );
      }
      if (!body.etablissementId) {
        throw new AppError("L'identifiant de l'établissement est requis", 400);
      }

      const ctx = await resolveAuthContextById(body.etablissementId);

      const result = await this.authService.registerSurveillant(ctx, {
        email: body.email.trim().toLowerCase(),
        motDePasse: body.motDePasse,
        prenom: body.prenom.trim(),
        nom: body.nom.trim(),
        telephone: body.telephone.trim(),
        sexe: body.sexe.toUpperCase(),
        dateNaissance: body.dateNaissance,
        adresse: body.adresse?.trim(),
        dateEmbauche: body.dateEmbauche,
        typeContrat: body.typeContrat,
        zoneSurveillance: body.zoneSurveillance?.trim(),
      });

      sendSuccess(
        res,
        result,
        `Inscription surveillant réussie. Matricule: ${result.matricule}`,
        201
      );
    } catch (error) {
      next(error);
    }
  };

  // ══════════════════════════════════════════
  // 🎯 CONNEXION UNIFIÉE (TOUS RÔLES)
  // ══════════════════════════════════════════

  /**
   * POST /auth/login
   * Connexion unifiée : SUPER_ADMIN + tous rôles tenant.
   *
   * Stratégie :
   * 1. Tente de résoudre un contexte tenant (via email ou etablissementId)
   *    → peut retourner `null` si aucun tenant n'est trouvé
   * 2. Appelle authService.login(ctx | null, data)
   *    → le service essaie SUPER_ADMIN (catalogue) PUIS tenant
   */
  login = async (
    req: Request<{}, {}, LoginRequest & { etablissementId?: string }>,
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

      const email = body.email.trim().toLowerCase();

      // 🎯 Résoudre le contexte tenant si possible (optionnel)
      const ctx = await resolveOptionalAuthContext(email, body.etablissementId);

      // 🎯 Appel du service unifié (ctx peut être null)
      const result = await this.authService.login(ctx, {
        email,
        motDePasse: body.motDePasse,
      });

      // Message selon le scope
      const message =
        result.scope === 'GLOBAL'
          ? 'Connexion super-admin réussie'
          : 'Connexion réussie';

      sendSuccess(res, result, message);
    } catch (error) {
      next(error);
    }
  };

  // ------------------------------------------
  // CONNEXION — ÉLÈVE
  // ------------------------------------------

  loginEleve = async (
    req: Request<{}, {}, LoginRequest & { etablissementId?: string }>,
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

      const email = body.email.trim().toLowerCase();

      // ⚠️ Contexte tenant OBLIGATOIRE pour loginEleve
      const ctx = await resolveOptionalAuthContext(email, body.etablissementId);
      if (!ctx) {
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      const result = await this.authService.loginEleve(ctx, {
        email,
        motDePasse: body.motDePasse,
      });

      sendSuccess(res, result, 'Connexion élève réussie');
    } catch (error) {
      next(error);
    }
  };

  // ------------------------------------------
  // CONNEXION — SURVEILLANT
  // ------------------------------------------

  loginSurveillant = async (
    req: Request<{}, {}, LoginRequest & { etablissementId?: string }>,
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

      const email = body.email.trim().toLowerCase();

      // ⚠️ Contexte tenant OBLIGATOIRE pour loginSurveillant
      const ctx = await resolveOptionalAuthContext(email, body.etablissementId);
      if (!ctx) {
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      const result = await this.authService.loginSurveillant(ctx, {
        email,
        motDePasse: body.motDePasse,
      });

      sendSuccess(res, result, 'Connexion surveillant réussie');
    } catch (error) {
      next(error);
    }
  };

  // ------------------------------------------
  // OTP
  // ------------------------------------------

  verifyOtp = async (
    req: Request<{}, {}, VerifyOtpRequest & { etablissementId: string }>,
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
      if (!body.etablissementId) {
        throw new AppError("L'identifiant de l'établissement est requis", 400);
      }

      const ctx = await resolveAuthContextById(body.etablissementId);
      await this.authService.verifyOtp(ctx, body.userId, body.otp);

      sendSuccess(res, undefined, 'Email vérifié avec succès');
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (
    req: Request<{}, {}, { userId: string; etablissementId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = requireBody(req.body);

      if (!body.userId) {
        throw new AppError('userId requis', 400);
      }
      if (!body.etablissementId) {
        throw new AppError("L'identifiant de l'établissement est requis", 400);
      }

      const ctx = await resolveAuthContextById(body.etablissementId);
      await this.authService.resendOtp(ctx, body.userId);

      sendSuccess(
        res,
        undefined,
        'Un nouveau code OTP a été envoyé à votre email'
      );
    } catch (error) {
      next(error);
    }
  };

  // ══════════════════════════════════════════
  // 🎯 REFRESH TOKEN UNIFIÉ (TENANT + GLOBAL)
  // ══════════════════════════════════════════

  /**
   * POST /auth/refresh
   * Rafraîchit les tokens pour TENANT et GLOBAL.
   */
  refreshToken = async (
    req: Request<{}, {}, RefreshTokenRequest & { etablissementId?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = requireBody(req.body);

      const refreshToken =
        body.refreshToken ||
        (req.cookies?.refreshToken as string | undefined);

      if (!refreshToken) {
        throw new AppError('Refresh token requis', 400);
      }

      // Décoder pour récupérer scope + schemaName
      const payload = AuthUtils.tryVerifyRefreshToken(refreshToken);
      if (!payload?.userId) {
        throw new AppError('Refresh token invalide ou expiré', 401);
      }

      // 🎯 Cas GLOBAL : pas besoin de ctx tenant
      if (payload.scope === 'GLOBAL') {
        const tokens = await this.authService.refreshTokens(null, refreshToken);
        sendSuccess(res, tokens, 'Tokens rafraîchis avec succès');
        return;
      }

      // 🎯 Cas TENANT : résoudre le contexte
      let ctx: AuthContext | null = null;

      if (body.etablissementId) {
        ctx = await resolveAuthContextById(body.etablissementId);
      } else if (payload.schemaName && payload.etablissementId) {
        // 🔥 Le refresh token contient déjà schemaName + etablissementId
        ctx = {
          schemaName: payload.schemaName,
          etablissementId: payload.etablissementId,
        };
      }

      if (!ctx) {
        throw new AppError(
          'Impossible de résoudre le contexte du refresh token.',
          401
        );
      }

      const tokens = await this.authService.refreshTokens(ctx, refreshToken);

      sendSuccess(res, tokens, 'Tokens rafraîchis avec succès');
    } catch (error) {
      next(error);
    }
  };

  // ------------------------------------------
  // DÉCONNEXION
  // ------------------------------------------

  /**
   * POST /auth/logout
   * Déconnexion unifiée : TENANT + GLOBAL.
   */
  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      let userId = req.user?.userId;
      let ctx: AuthContext | null = null;

      // 🎯 Construire le contexte depuis req.user (si authMiddleware est passé)
      if (
        req.user?.scope === 'TENANT' &&
        req.user.schemaName &&
        req.user.etablissementId
      ) {
        ctx = {
          schemaName: req.user.schemaName,
          etablissementId: req.user.etablissementId,
        };
      }
      // 🎯 Cas GLOBAL : on appelle logout avec ctx=null
      // (le service tentera la mise à jour dans utilisateurGlobal)
      else if (req.user?.scope === 'GLOBAL') {
        ctx = null;
      }

      // Si on a un refresh token, on essaie de résoudre le contexte (fallback)
      if (!userId || (!ctx && req.user?.scope !== 'GLOBAL')) {
        const refreshToken =
          (req.body?.refreshToken as string | undefined) ||
          (req.cookies?.refreshToken as string | undefined);

        if (refreshToken) {
          const payload = AuthUtils.tryVerifyRefreshToken(refreshToken);
          if (payload?.userId) {
            userId = userId ?? payload.userId;

            if (
              payload.scope === 'TENANT' &&
              payload.schemaName &&
              payload.etablissementId
            ) {
              ctx = {
                schemaName: payload.schemaName,
                etablissementId: payload.etablissementId,
              };
            }
          }
        }
      }

      // Logout unifié (le service gère les 2 cas)
      if (userId) {
        await this.authService.logout(ctx, userId);
      }

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
    req: Request<{}, {}, ForgotPasswordRequest & { etablissementId?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = requireBody(req.body);

      if (!body.email || !AuthUtils.isValidEmail(body.email)) {
        throw new AppError('Email invalide', 400);
      }

      const email = body.email.trim().toLowerCase();

      // Contexte tenant obligatoire pour forgot-password
      const ctx = await resolveOptionalAuthContext(email, body.etablissementId);

      // ⚠️ On répond TOUJOURS succès (anti-énumération d'emails)
      if (ctx) {
        try {
          await this.authService.forgotPassword(ctx, email);
        } catch (err) {
          console.error('⚠️ Erreur forgotPassword:', err);
        }
      }

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
    req: Request<{}, {}, ResetPasswordRequest & { etablissementId: string }>,
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
      if (!body.etablissementId) {
        throw new AppError("L'identifiant de l'établissement est requis", 400);
      }

      const ctx = await resolveAuthContextById(body.etablissementId);
      await this.authService.resetPassword(ctx, body.token, body.nouveauMotDePasse);

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
      const schemaName = req.user?.schemaName;
      const etablissementId = req.user?.etablissementId;
      const scope = req.user?.scope;

      // ⚠️ Le changement de mot de passe SUPER_ADMIN n'est pas supporté ici
      if (scope === 'GLOBAL') {
        throw new AppError(
          'Le changement de mot de passe super-admin doit être fait via une route dédiée.',
          400
        );
      }

      if (!schemaName || !etablissementId) {
        throw new AppError('Établissement non identifié', 400);
      }

      const body = requireBody(req.body);

      if (!body.ancienMotDePasse) {
        throw new AppError('Ancien mot de passe requis', 400);
      }
      if (!body.nouveauMotDePasse) {
        throw new AppError('Nouveau mot de passe requis', 400);
      }
      if (body.ancienMotDePasse === body.nouveauMotDePasse) {
        throw new AppError(
          "Le nouveau mot de passe doit être différent de l'ancien",
          400
        );
      }

      const ctx: AuthContext = { schemaName, etablissementId };
      await this.authService.changePassword(
        ctx,
        userId,
        body.ancienMotDePasse,
        body.nouveauMotDePasse
      );

      sendSuccess(res, undefined, 'Mot de passe changé avec succès');
    } catch (error) {
      next(error);
    }
  };

  // ══════════════════════════════════════════
  // 🎯 PROFIL UNIFIÉ (TENANT + GLOBAL)
  // ══════════════════════════════════════════

  /**
   * GET /auth/me
   * Retourne le profil de l'utilisateur connecté.
   * Gère les deux scopes : TENANT et GLOBAL.
   */
  getCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const scope = req.user?.scope;

      // 🎯 Cas GLOBAL (SUPER_ADMIN) : pas de contexte tenant
      if (scope === 'GLOBAL') {
        // Utiliser un ctx bidon (non utilisé par le service pour GLOBAL)
        const dummyCtx: AuthContext = {
          schemaName: '__global__',
          etablissementId: '__global__',
        };
        const result = await this.authService.getCurrentUser(dummyCtx, userId);
        sendSuccess(res, result);
        return;
      }

      // 🎯 Cas TENANT
      const schemaName = req.user?.schemaName;
      const etablissementId = req.user?.etablissementId;

      if (!schemaName || !etablissementId) {
        throw new AppError('Établissement non identifié', 400);
      }

      const ctx: AuthContext = { schemaName, etablissementId };
      const user = await this.authService.getCurrentUser(ctx, userId);

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
      const scope = req.user?.scope;

      // ⚠️ Mise à jour profil SUPER_ADMIN → route dédiée
      if (scope === 'GLOBAL') {
        throw new AppError(
          'La mise à jour du profil super-admin doit être faite via une route dédiée.',
          400
        );
      }

      const schemaName = req.user?.schemaName;
      const etablissementId = req.user?.etablissementId;

      if (!schemaName || !etablissementId) {
        throw new AppError('Établissement non identifié', 400);
      }

      const body = requireBody(req.body);

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

      const ctx: AuthContext = { schemaName, etablissementId };
      const user = await this.authService.updateProfile(ctx, userId, updateData);

      sendSuccess(res, user, 'Profil mis à jour avec succès');
    } catch (error) {
      next(error);
    }
  };

  // ------------------------------------------
  // PROFIL ÉLÈVE / SURVEILLANT
  // ------------------------------------------

  getEleveProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const schemaName = req.user?.schemaName;
      const etablissementId = req.user?.etablissementId;

      if (!schemaName || !etablissementId) {
        throw new AppError('Établissement non identifié', 400);
      }

      const ctx: AuthContext = { schemaName, etablissementId };
      const eleve = await this.authService.getEleveProfile(ctx, userId);

      sendSuccess(res, eleve);
    } catch (error) {
      next(error);
    }
  };

  getSurveillantProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const schemaName = req.user?.schemaName;
      const etablissementId = req.user?.etablissementId;

      if (!schemaName || !etablissementId) {
        throw new AppError('Établissement non identifié', 400);
      }

      const ctx: AuthContext = { schemaName, etablissementId };
      const surveillant = await this.authService.getSurveillantProfile(ctx, userId);

      sendSuccess(res, surveillant);
    } catch (error) {
      next(error);
    }
  };
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const authController = new AuthController();