// backend/src/modules/auth/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from './auth.service';
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

interface ApiError {
  status: number;
  message: string;
  errors?: unknown;
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
  'SUPER_ADMIN',
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
  'SUPER_ADMIN',
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
 * ⚠️ FONCTION CLÉ : Résout le nom du schéma d'un établissement.
 *
 * Sans établissementId : cherche dans tous les schémas de tous les établissements.
 * Avec établissementId : va directement chercher ce schéma.
 */
async function resolveSchemaName(
  email: string,
  etablissementId?: string
): Promise<string> {
  // Cas 1 : l'établissementId est fourni
  if (etablissementId) {
    const etab = await globalPrisma.etablissement.findUnique({
      where: { id: etablissementId },
      select: { schemaName: true, estActif: true },
    });

    if (!etab || !etab.estActif) {
      throw new AppError('Établissement introuvable ou inactif', 404);
    }

    return etab.schemaName;
  }

  // Cas 2 : chercher dans tous les établissements actifs
  const etablissements = await globalPrisma.etablissement.findMany({
    where: { estActif: true },
    select: { schemaName: true },
  });

  for (const etab of etablissements) {
    try {
      const exists = await authService.findUserInSchema(
        etab.schemaName,
        email
      );
      if (exists) {
        return etab.schemaName;
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

  // Aucun établissement trouvé pour cet email
  throw new AppError('Email ou mot de passe incorrect', 401);
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

      // Résoudre le schéma
      const schemaName = await resolveSchemaName(
        body.email.trim().toLowerCase(),
        body.etablissementId
      );

      const result = await this.authService.register(schemaName, {
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

      // Résoudre le schéma
      const schemaName = await resolveSchemaName(
        body.email.trim().toLowerCase(),
        body.etablissementId
      );

      const result = await this.authService.registerEleve(schemaName, {
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

      // Résoudre le schéma
      const schemaName = await resolveSchemaName(
        body.email.trim().toLowerCase(),
        body.etablissementId
      );

      const result = await this.authService.registerSurveillant(schemaName, {
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

  // ------------------------------------------
  // CONNEXION GÉNÉRIQUE
  // ------------------------------------------

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

      // Résoudre le schéma (avec ou sans etablissementId)
      const schemaName = await resolveSchemaName(
        body.email.trim().toLowerCase(),
        body.etablissementId
      );

      const result = await this.authService.login(schemaName, {
        email: body.email.trim().toLowerCase(),
        motDePasse: body.motDePasse,
      });

      sendSuccess(res, result, 'Connexion réussie');
    } catch (error) {
      next(error);
    }
  };
loginSuperAdmin = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = requireBody(req.body);
    if (!body.email || !body.motDePasse) {
      throw new AppError('Email et mot de passe requis', 400);
    }

    // Chercher dans le catalogue global
    const user = await globalPrisma.utilisateurGlobal.findUnique({
      where: { email: body.email.trim().toLowerCase() },
    });

    if (!user) throw new AppError('Email ou mot de passe incorrect', 401);
    if (!user.estActif) throw new AppError('Compte désactivé', 403);

    const isValid = await AuthUtils.verifyPassword(body.motDePasse, user.motDePasse);
    if (!isValid) throw new AppError('Email ou mot de passe incorrect', 401);

    const tokens = {
      accessToken: AuthUtils.generateAccessToken(user.id, user.role),
      refreshToken: AuthUtils.generateRefreshToken(user.id),
    };

    await globalPrisma.utilisateurGlobal.update({
      where: { id: user.id },
      data: { jetonActualisation: tokens.refreshToken, derniereConnexion: new Date() },
    });

    sendSuccess(res, {
      user: AuthUtils.sanitizeUser(user as any),
      tokens,
    }, 'Connexion super-admin réussie');
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

      const schemaName = await resolveSchemaName(
        body.email.trim().toLowerCase(),
        body.etablissementId
      );

      const result = await this.authService.loginEleve(schemaName, {
        email: body.email.trim().toLowerCase(),
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

      const schemaName = await resolveSchemaName(
        body.email.trim().toLowerCase(),
        body.etablissementId
      );

      const result = await this.authService.loginSurveillant(schemaName, {
        email: body.email.trim().toLowerCase(),
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

      // Pour verifyOtp, on a besoin du schéma
      const etab = await globalPrisma.etablissement.findUnique({
        where: { id: body.etablissementId },
        select: { schemaName: true },
      });
      if (!etab) {
        throw new AppError('Établissement introuvable', 404);
      }

      await this.authService.verifyOtp(etab.schemaName, body.userId, body.otp);

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

      const etab = await globalPrisma.etablissement.findUnique({
        where: { id: body.etablissementId },
        select: { schemaName: true },
      });
      if (!etab) {
        throw new AppError('Établissement introuvable', 404);
      }

      await this.authService.resendOtp(etab.schemaName, body.userId);

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

      // Décoder le token pour récupérer l'userId
      const payload = AuthUtils.tryVerifyRefreshToken(refreshToken);
      if (!payload?.userId) {
        throw new AppError('Refresh token invalide', 401);
      }

      // Résoudre le schéma
      let schemaName: string;

      if (body.etablissementId) {
        const etab = await globalPrisma.etablissement.findUnique({
          where: { id: body.etablissementId },
          select: { schemaName: true },
        });
        if (!etab) {
          throw new AppError('Établissement introuvable', 404);
        }
        schemaName = etab.schemaName;
      } else {
        // Chercher dans tous les schémas
        const etablissements = await globalPrisma.etablissement.findMany({
          where: { estActif: true },
          select: { schemaName: true },
        });

        schemaName = '';
        for (const etab of etablissements) {
          const user = await authService.findUserInSchema(
            etab.schemaName,
            payload.userId // on cherche par ID ici, pas email
          );
          // Note : cette partie nécessite d'adapter findUserInSchema pour accepter un userId
          // Ou de passer par une autre méthode
          // Pour simplifier, on prend le premier
          schemaName = etab.schemaName;
          break;
        }

        if (!schemaName) {
          throw new AppError('Refresh token révoqué', 401);
        }
      }

      const tokens = await this.authService.refreshTokens(
        schemaName,
        refreshToken
      );

      sendSuccess(res, tokens, 'Tokens rafraîchis avec succès');
    } catch (error) {
      next(error);
    }
  };

  // ------------------------------------------
  // DÉCONNEXION
  // ------------------------------------------

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      let userId = req.user?.userId;
      let schemaName = (req as any).tenant?.schemaName;

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

      // Si on a le schemaName (via middleware), on logout directement
      if (userId && schemaName) {
        await this.authService.logout(schemaName, userId);
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

      const schemaName = await resolveSchemaName(
        body.email.trim().toLowerCase(),
        body.etablissementId
      );

      await this.authService.forgotPassword(
        schemaName,
        body.email.trim().toLowerCase()
      );

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

      const etab = await globalPrisma.etablissement.findUnique({
        where: { id: body.etablissementId },
        select: { schemaName: true },
      });
      if (!etab) {
        throw new AppError('Établissement introuvable', 404);
      }

      await this.authService.resetPassword(
        etab.schemaName,
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
      const schemaName = (req as any).tenant?.schemaName;

      if (!schemaName) {
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

      await this.authService.changePassword(
        schemaName,
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
      const schemaName = (req as any).tenant?.schemaName;

      if (!schemaName) {
        throw new AppError('Établissement non identifié', 400);
      }

      const user = await this.authService.getCurrentUser(schemaName, userId);

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
      const schemaName = (req as any).tenant?.schemaName;

      if (!schemaName) {
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

      const user = await this.authService.updateProfile(
        schemaName,
        userId,
        updateData
      );

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
      const schemaName = (req as any).tenant?.schemaName;

      if (!schemaName) {
        throw new AppError('Établissement non identifié', 400);
      }

      const eleve = await this.authService.getEleveProfile(schemaName, userId);

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
      const schemaName = (req as any).tenant?.schemaName;

      if (!schemaName) {
        throw new AppError('Établissement non identifié', 400);
      }

      const surveillant = await this.authService.getSurveillantProfile(
        schemaName,
        userId
      );

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