// backend/src/modules/compte/compte.service.ts

import { getTenantClient } from '../../config/tenant-db.js';
import { AppError } from '../../utils/AppError.js';
import { AuthUtils } from '../auth/auth.utils.js';
import crypto from 'crypto';

export interface CompteContext {
  schemaName: string;
  etablissementId: string;
}

export interface CompteLinkResult {
  utilisateurId: string | null;
  created: boolean;
  email: string | null;
}

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError(`Client tenant introuvable`, 500);
  return client;
}

/**
 * Génère un mot de passe temporaire fort (12 caractères).
 */
function generateTemporaryPassword(): string {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
  let pwd = '';
  for (let i = 0; i < 12; i++) {
    pwd += chars[crypto.randomInt(0, chars.length)];
  }
  return pwd;
}

// ──────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────

export class CompteService {
  /**
   * 🔑 Crée ou récupère un Utilisateur pour un profil métier.
   *
   * Règles :
   * - Si `email` est fourni :
   *   - Si l'utilisateur existe déjà ET n'a pas de profil → lier
   *   - Si l'utilisateur existe déjà ET a un profil → erreur 409
   *   - Si l'utilisateur n'existe pas → créer
   * - Si `email` n'est PAS fourni :
   *   - Créer un Utilisateur avec un email généré (`<role>_<matricule>@no-email.local`)
   *   - Le mot de passe est généré aléatoirement
   *   - L'utilisateur ne pourra pas se connecter tant que l'email n'est pas changé
   */
  async createOrLinkUser(
    ctx: CompteContext,
    options: {
      email?: string | null;
      motDePasse?: string | null;
      prenom: string;
      nom: string;
      role: 'ENSEIGNANT' | 'ELEVE' | 'SURVEILLANT';
      telephone?: string | null;
      photoProfil?: string | null;
      matricule?: string;
      // Profil métier à vérifier pour la liaison
      hasProfilCheck: (user: any) => boolean;
    }
  ): Promise<CompteLinkResult> {
    const client = await getClient(ctx.schemaName);
    const roleLabel = options.role.toLowerCase();

    // ─── Cas 1 : Email fourni ───
    if (options.email && options.email.trim()) {
      const email = options.email.toLowerCase().trim();

      // Vérifier le format
      if (!AuthUtils.isValidEmail(email)) {
        throw new AppError('Email invalide', 400);
      }

      const existing = await client.utilisateur.findUnique({
        where: { email },
        include: {
          eleve: true,
          enseignant: true,
          surveillant: true,
        },
      });

      // 1a. Email existe déjà
      if (existing) {
        // Vérifier si cet utilisateur a déjà le profil demandé
        if (options.hasProfilCheck(existing)) {
          throw new AppError(
            `Un ${roleLabel} avec cet email existe déjà`,
            409
          );
        }

        // Lier le profil (l'utilisateur existe mais n'a pas ce profil)
        return {
          utilisateurId: existing.id,
          created: false,
          email,
        };
      }

      // 1b. Email n'existe pas → créer l'utilisateur
      const motDePasse = options.motDePasse || generateTemporaryPassword();
      const pwdCheck = AuthUtils.isStrongPassword(motDePasse);
      if (!pwdCheck.valid) {
        throw new AppError(
          `Mot de passe faible : ${pwdCheck.errors.join(', ')}`,
          400
        );
      }

      const hashed = await AuthUtils.hashPassword(motDePasse);

      const created = await client.utilisateur.create({
        data: {
          email,
          motDePasse: hashed,
          prenom: options.prenom.trim(),
          nom: options.nom.trim(),
          role: options.role,
          telephone: options.telephone?.trim() ?? null,
          photoProfil: options.photoProfil ?? null,
          estActif: true,
          emailVerifie: false,
        },
      });

      return {
        utilisateurId: created.id,
        created: true,
        email,
      };
    }

    // ─── Cas 2 : Pas d'email fourni ───
    // Créer un utilisateur "fantôme" avec un email généré
    const generatedEmail = `${roleLabel}_${
      options.matricule ?? Date.now()
    }@no-email.local`;
    const tempPwd = generateTemporaryPassword();
    const hashed = await AuthUtils.hashPassword(tempPwd);

    const created = await client.utilisateur.create({
      data: {
        email: generatedEmail,
        motDePasse: hashed,
        prenom: options.prenom.trim(),
        nom: options.nom.trim(),
        role: options.role,
        telephone: options.telephone?.trim() ?? null,
        photoProfil: options.photoProfil ?? null,
        estActif: true,
        emailVerifie: false,
        // ⚠️ Email non vérifié → l'utilisateur ne peut pas se connecter
        // jusqu'à ce que l'email soit renseigné
      },
    });

    return {
      utilisateurId: created.id,
      created: true,
      email: generatedEmail,
    };
  }

  /**
   * 🔑 Met à jour l'Utilisateur lié à un profil.
   *
   * Règles :
   * - Si `motDePasse` fourni → mettre à jour le hash
   * - Si `email` modifié → vérifier l'unicité
   * - Si `email` était `no-email.local` et qu'un nouveau `email` est fourni → mettre à jour
   * - Synchroniser prénom, nom, téléphone, photo
   */
  async updateLinkedUser(
    ctx: CompteContext,
    utilisateurId: string | null,
    data: {
      email?: string | null;
      motDePasse?: string | null;
      prenom?: string;
      nom?: string;
      telephone?: string | null;
      photoProfil?: string | null;
      estActif?: boolean;
    }
  ): Promise<void> {
    if (!utilisateurId) {
      // Pas d'utilisateur lié → si on veut en créer un maintenant
      if (data.email && data.email.trim()) {
        throw new AppError(
          'Aucun compte utilisateur lié. Utilisez la création pour lier un email.',
          400
        );
      }
      return;
    }

    const client = await getClient(ctx.schemaName);

    const existing = await client.utilisateur.findUnique({
      where: { id: utilisateurId },
    });
    if (!existing) {
      throw new AppError('Utilisateur lié introuvable', 404);
    }

    const patch: any = {};

    // Email modifié
    if (data.email !== undefined && data.email !== null) {
      const newEmail = data.email.toLowerCase().trim();
      if (!AuthUtils.isValidEmail(newEmail)) {
        throw new AppError('Email invalide', 400);
      }
      if (newEmail !== existing.email) {
        // Vérifier l'unicité
        const dup = await client.utilisateur.findFirst({
          where: { email: newEmail, id: { not: utilisateurId } },
          select: { id: true },
        });
        if (dup) {
          throw new AppError('Cet email est déjà utilisé', 409);
        }
        patch.email = newEmail;
        patch.emailVerifie = false; // Nouvel email non vérifié
      }
    }

    // Mot de passe modifié
    if (data.motDePasse && data.motDePasse.trim()) {
      const pwdCheck = AuthUtils.isStrongPassword(data.motDePasse);
      if (!pwdCheck.valid) {
        throw new AppError(
          `Mot de passe faible : ${pwdCheck.errors.join(', ')}`,
          400
        );
      }
      patch.motDePasse = await AuthUtils.hashPassword(data.motDePasse);
      patch.jetonActualisation = null; // Révoquer les sessions
    }

    // Champs synchronisés
    if (data.prenom !== undefined) patch.prenom = data.prenom.trim();
    if (data.nom !== undefined) patch.nom = data.nom.trim();
    if (data.telephone !== undefined) patch.telephone = data.telephone?.trim() ?? null;
    if (data.photoProfil !== undefined) patch.photoProfil = data.photoProfil ?? null;
    if (data.estActif !== undefined) patch.estActif = data.estActif;

    if (Object.keys(patch).length === 0) return;

    await client.utilisateur.update({
      where: { id: utilisateurId },
      data: patch,
    });
  }

  /**
   * 🔑 Supprime l'Utilisateur lié à un profil (hard delete).
   */
  async deleteLinkedUser(
    ctx: CompteContext,
    utilisateurId: string | null
  ): Promise<void> {
    if (!utilisateurId) return;

    const client = await getClient(ctx.schemaName);

    try {
      await client.utilisateur.delete({ where: { id: utilisateurId } });
    } catch (err: any) {
      // P2025 : déjà supprimé → on ignore
      if (err?.code !== 'P2025') throw err;
    }
  }
}

export const compteService = new CompteService();