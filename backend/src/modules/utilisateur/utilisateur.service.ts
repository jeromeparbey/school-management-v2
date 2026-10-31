// backend/src/modules/utilisateur/utilisateur.service.ts

import { getTenantClient } from '../../config/tenant-db.js';
import { AppError } from '../../utils/AppError.js';
import { AuthUtils } from '../auth/auth.utils.js';
import type {
  CreateUtilisateurInput,
  UpdateUtilisateurInput,
  ListUtilisateursQuery,
} from './utilisateur.types.js';

// Contexte tenant (identique à AuthContext)
export interface UtilisateurContext {
  schemaName: string;
  etablissementId: string;
}

export class UtilisateurService {
  // ──────────────────────────────────────────
  // HELPERS PRIVÉS
  // ──────────────────────────────────────────

  private async client(schemaName: string) {
    const c = await getTenantClient(schemaName);
    if (!c) throw new AppError(`Client Prisma introuvable: ${schemaName}`, 500);
    return c;
  }

  private sanitize(user: any) {
    if (!user) return null;
    const { motDePasse, jetonActualisation, ...rest } = user;
    return rest;
  }

  // Génère un matricule unique : ELV-2025-0001, ENS-2025-0001, SUR-2025-0001
  private async generateMatricule(
    tx: any,
    model: 'eleve' | 'enseignant' | 'surveillant',
    prefix: string
  ): Promise<string> {
    const year = new Date().getFullYear();
    const pattern = `${prefix}-${year}-`;

    const last = await tx[model].findFirst({
      where: { matricule: { startsWith: pattern } },
      orderBy: { matricule: 'desc' },
      select: { matricule: true },
    });

    let next = 1;
    if (last?.matricule) {
      const parts = last.matricule.split('-');
      next = parseInt(parts[parts.length - 1], 10) + 1;
    }

    return `${pattern}${String(next).padStart(4, '0')}`;
  }

  // Crée le profil métier associé à l'utilisateur
  private async createProfil(
    tx: any,
    role: string,
    utilisateurId: string,
    data: CreateUtilisateurInput
  ): Promise<void> {
    switch (role) {
      case 'ELEVE': {
        const matricule = await this.generateMatricule(tx, 'eleve', 'ELV');
        await tx.eleve.create({
          data: {
            utilisateurId,
            matricule,
            prenom: data.prenom.trim(),
            nom: data.nom.trim(),
            sexe: data.sexe ?? 'M',
            dateNaissance: data.dateNaissance
              ? new Date(data.dateNaissance)
              : new Date(),
            lieuNaissance: data.lieuNaissance ?? null,
            nationalite: data.nationalite ?? null,
            adresse: data.adresse ?? null,
            telephone: data.telephone ?? null,
            email: data.email.toLowerCase().trim(),
            photo: data.photoProfil ?? null,
            groupeSanguin: data.groupeSanguin ?? null,
            allergies: data.allergies ?? null,
            infoMedicale: data.infoMedicale ?? null,
            statut: 'ACTIF',
          },
        });
        return;
      }
      case 'ENSEIGNANT': {
        const matricule = await this.generateMatricule(tx, 'enseignant', 'ENS');
        await tx.enseignant.create({
          data: {
            utilisateurId,
            matricule,
            prenom: data.prenom.trim(),
            nom: data.nom.trim(),
            sexe: data.sexe ?? 'M',
            dateNaissance: data.dateNaissance
              ? new Date(data.dateNaissance)
              : new Date(),
            telephone: data.telephone ?? '',
            email: data.email.toLowerCase().trim(),
            adresse: data.adresse ?? null,
            photo: data.photoProfil ?? null,
            dateEmbauche: data.dateEmbauche
              ? new Date(data.dateEmbauche)
              : new Date(),
            typeContrat: data.typeContrat ?? 'CDI',
            qualification: data.qualification ?? null,
            specialite: data.specialite ?? null,
            salaireBase: data.salaireBase ?? 0,
            infosBancaires: data.infosBancaires ?? undefined,
            estActif: true,
          },
        });
        return;
      }
      case 'SURVEILLANT': {
        const matricule = await this.generateMatricule(tx, 'surveillant', 'SUR');
        await tx.surveillant.create({
          data: {
            utilisateurId,
            matricule,
            prenom: data.prenom.trim(),
            nom: data.nom.trim(),
            sexe: data.sexe ?? 'M',
            dateNaissance: data.dateNaissance
              ? new Date(data.dateNaissance)
              : null,
            telephone: data.telephone ?? '',
            email: data.email.toLowerCase().trim(),
            adresse: data.adresse ?? null,
            photo: data.photoProfil ?? null,
            dateEmbauche: data.dateEmbauche
              ? new Date(data.dateEmbauche)
              : new Date(),
            typeContrat: data.typeContrat ?? 'CDI',
            zoneSurveillance: data.zoneSurveillance ?? null,
            estActif: true,
          },
        });
        return;
      }
      case 'PARENT': {
        await tx.parent.create({
          data: {
            utilisateurId,
            adresse: data.adresse ?? null,
          },
        });
        return;
      }
      case 'ADMIN': {
        await tx.admin.create({
          data: { utilisateurId, niveau: 'ADMIN_ETABLISSEMENT', estActif: true },
        });
        return;
      }
      case 'DIRECTEUR': {
        await tx.directeur.create({
          data: { utilisateurId, dateNomination: new Date() },
        });
        return;
      }
      // SECRETAIRE, BIBLIOTHECAIRE → pas de profil métier
      default:
        return;
    }
  }

  // ──────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────

  async create(ctx: UtilisateurContext, data: CreateUtilisateurInput) {
    const { schemaName } = ctx;
    const client = await this.client(schemaName);
    const email = data.email.toLowerCase().trim();

    // 1. Unicité email
    const existing = await client.utilisateur.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      throw new AppError('Un utilisateur avec cet email existe déjà', 409);
    }

    // 2. Validation mot de passe
    const pwdCheck = AuthUtils.isStrongPassword(data.motDePasse);
    if (!pwdCheck.valid) {
      throw new AppError(
        `Mot de passe faible : ${pwdCheck.errors.join(', ')}`,
        400
      );
    }

    // 3. Hash
    const hashed = await AuthUtils.hashPassword(data.motDePasse);

    // 4. Transaction : utilisateur + profil
    const utilisateur = await client.$transaction(async (tx: any) => {
      const u = await tx.utilisateur.create({
        data: {
          email,
          motDePasse: hashed,
          prenom: data.prenom.trim(),
          nom: data.nom.trim(),
          role: data.role,
          telephone: data.telephone?.trim() ?? null,
          photoProfil: data.photoProfil ?? null,
          estActif: true,
          emailVerifie: false,
        },
      });

      await this.createProfil(tx, data.role, u.id, { ...data, email });

      return u;
    });

    return this.sanitize(utilisateur);
  }

  // ──────────────────────────────────────────
  // READ
  // ──────────────────────────────────────────

  async findAll(ctx: UtilisateurContext, query: ListUtilisateursQuery) {
    const client = await this.client(ctx.schemaName);
    const { page, limit, search, role, estActif, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(role && { role }),
      ...(estActif !== undefined && { estActif }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { prenom: { contains: search, mode: 'insensitive' } },
          { nom: { contains: search, mode: 'insensitive' } },
          { telephone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await client.$transaction([
      client.utilisateur.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          prenom: true,
          nom: true,
          role: true,
          telephone: true,
          photoProfil: true,
          estActif: true,
          emailVerifie: true,
          derniereConnexion: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      client.utilisateur.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(ctx: UtilisateurContext, id: string) {
    const client = await this.client(ctx.schemaName);
    const user = await client.utilisateur.findUnique({
      where: { id },
      include: {
        eleve: true,
        enseignant: true,
        surveillant: true,
        parent: true,
        admin: true,
        directeur: true,
      },
    });
    if (!user) throw new AppError('Utilisateur introuvable', 404);
    return this.sanitize(user);
  }

  // ──────────────────────────────────────────
  // UPDATE (infos + profil métier)
  // ──────────────────────────────────────────

  async update(ctx: UtilisateurContext, id: string, data: UpdateUtilisateurInput) {
    const client = await this.client(ctx.schemaName);

    const existing = await client.utilisateur.findUnique({ where: { id } });
    if (!existing) throw new AppError('Utilisateur introuvable', 404);

    // Unicité email si modifié
    if (data.email && data.email.toLowerCase().trim() !== existing.email) {
      const dup = await client.utilisateur.findFirst({
        where: {
          email: data.email.toLowerCase().trim(),
          id: { not: id },
        },
        select: { id: true },
      });
      if (dup) throw new AppError('Cet email est déjà utilisé', 409);
    }

    // Changement de rôle interdit ici (sécurité : passer par un endpoint dédié)
    if (data.role && data.role !== existing.role) {
      throw new AppError(
        'Le changement de rôle doit être effectué via un endpoint dédié',
        400
      );
    }

    // Champs directs de la table `utilisateur`
    const utilisateurFields: any = {};
    if (data.prenom !== undefined) utilisateurFields.prenom = data.prenom.trim();
    if (data.nom !== undefined) utilisateurFields.nom = data.nom.trim();
    if (data.telephone !== undefined) utilisateurFields.telephone = data.telephone;
    if (data.photoProfil !== undefined) utilisateurFields.photoProfil = data.photoProfil;
    if (data.email !== undefined) utilisateurFields.email = data.email.toLowerCase().trim();
    if (data.estActif !== undefined) utilisateurFields.estActif = data.estActif;

    const updated = await client.$transaction(async (tx: any) => {
      const u = await tx.utilisateur.update({
        where: { id },
        data: utilisateurFields,
      });

      // Mise à jour du profil métier selon rôle existant
      await this.updateProfil(tx, existing.role, id, data, u);

      return u;
    });

    return this.sanitize(updated);
  }

  private async updateProfil(
    tx: any,
    role: string,
    utilisateurId: string,
    data: UpdateUtilisateurInput,
    utilisateur: any
  ): Promise<void> {
    const syncCommon = (p: any) => {
      // Champs à synchroniser entre Utilisateur et profil métier
      if (data.prenom !== undefined) p.prenom = data.prenom.trim();
      if (data.nom !== undefined) p.nom = data.nom.trim();
      if (data.telephone !== undefined) p.telephone = data.telephone;
      if (data.email !== undefined) p.email = data.email.toLowerCase().trim();
      if (data.photoProfil !== undefined) p.photo = data.photoProfil;
      if (data.adresse !== undefined) p.adresse = data.adresse;
      if (data.sexe !== undefined) p.sexe = data.sexe;
      if (data.dateNaissance !== undefined && data.dateNaissance) {
        p.dateNaissance = new Date(data.dateNaissance);
      }
    };

    switch (role) {
      case 'ELEVE': {
        const patch: any = {};
        syncCommon(patch);
        if (data.lieuNaissance !== undefined) patch.lieuNaissance = data.lieuNaissance;
        if (data.nationalite !== undefined) patch.nationalite = data.nationalite;
        if (data.groupeSanguin !== undefined) patch.groupeSanguin = data.groupeSanguin;
        if (data.allergies !== undefined) patch.allergies = data.allergies;
        if (data.infoMedicale !== undefined) patch.infoMedicale = data.infoMedicale;
        if (Object.keys(patch).length > 0) {
          await tx.eleve.update({ where: { utilisateurId }, data: patch });
        }
        return;
      }
      case 'ENSEIGNANT': {
        const patch: any = {};
        syncCommon(patch);
        if (data.typeContrat !== undefined) patch.typeContrat = data.typeContrat;
        if (data.qualification !== undefined) patch.qualification = data.qualification;
        if (data.specialite !== undefined) patch.specialite = data.specialite;
        if (data.salaireBase !== undefined) patch.salaireBase = data.salaireBase;
        if (data.infosBancaires !== undefined) patch.infosBancaires = data.infosBancaires;
        if (Object.keys(patch).length > 0) {
          await tx.enseignant.update({ where: { utilisateurId }, data: patch });
        }
        return;
      }
      case 'SURVEILLANT': {
        const patch: any = {};
        syncCommon(patch);
        if (data.typeContrat !== undefined) patch.typeContrat = data.typeContrat;
        if (data.zoneSurveillance !== undefined) patch.zoneSurveillance = data.zoneSurveillance;
        if (Object.keys(patch).length > 0) {
          await tx.surveillant.update({ where: { utilisateurId }, data: patch });
        }
        return;
      }
      case 'PARENT': {
        const patch: any = {};
        if (data.adresse !== undefined) patch.adresse = data.adresse;
        if (Object.keys(patch).length > 0) {
          await tx.parent.update({ where: { utilisateurId }, data: patch });
        }
        return;
      }
      default:
        return;
    }
  }

  // ──────────────────────────────────────────
  // MOT DE PASSE
  // ──────────────────────────────────────────

  /** Changement de mot de passe par l'utilisateur lui-même (vérifie l'ancien) */
  async changePassword(
    ctx: UtilisateurContext,
    userId: string,
    ancienMotDePasse: string,
    nouveauMotDePasse: string
  ): Promise<void> {
    const client = await this.client(ctx.schemaName);

    const user = await client.utilisateur.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Utilisateur introuvable', 404);

    const ok = await AuthUtils.verifyPassword(ancienMotDePasse, user.motDePasse);
    if (!ok) throw new AppError('Ancien mot de passe incorrect', 400);

    if (ancienMotDePasse === nouveauMotDePasse) {
      throw new AppError(
        "Le nouveau mot de passe doit être différent de l'ancien",
        400
      );
    }

    const pwdCheck = AuthUtils.isStrongPassword(nouveauMotDePasse);
    if (!pwdCheck.valid) {
      throw new AppError(
        `Mot de passe faible : ${pwdCheck.errors.join(', ')}`,
        400
      );
    }

    const hashed = await AuthUtils.hashPassword(nouveauMotDePasse);
    await client.utilisateur.update({
      where: { id: userId },
      data: { motDePasse: hashed, jetonActualisation: null },
    });
  }

  /** Reset mot de passe par un administrateur (pas de vérification de l'ancien) */
  async resetPasswordByAdmin(
    ctx: UtilisateurContext,
    targetUserId: string,
    nouveauMotDePasse: string
  ): Promise<void> {
    const client = await this.client(ctx.schemaName);

    const user = await client.utilisateur.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });
    if (!user) throw new AppError('Utilisateur introuvable', 404);

    const pwdCheck = AuthUtils.isStrongPassword(nouveauMotDePasse);
    if (!pwdCheck.valid) {
      throw new AppError(
        `Mot de passe faible : ${pwdCheck.errors.join(', ')}`,
        400
      );
    }

    const hashed = await AuthUtils.hashPassword(nouveauMotDePasse);
    await client.utilisateur.update({
      where: { id: targetUserId },
      data: { motDePasse: hashed, jetonActualisation: null },
    });
  }

  // ──────────────────────────────────────────
  // ACTIVATION / DÉSACTIVATION
  // ──────────────────────────────────────────

  async toggleActif(
    ctx: UtilisateurContext,
    id: string,
    estActif: boolean
  ) {
    const client = await this.client(ctx.schemaName);

    const user = await client.utilisateur.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!user) throw new AppError('Utilisateur introuvable', 404);

    // Protection : on ne désactive pas un DIRECTEUR via cet endpoint
    if (user.role === 'DIRECTEUR' && !estActif) {
      throw new AppError(
        'Un directeur ne peut pas être désactivé via cet endpoint',
        403
      );
    }

    const updated = await client.utilisateur.update({
      where: { id },
      data: {
        estActif,
        // Si désactivation → révoquer la session
        ...(estActif === false && { jetonActualisation: null }),
      },
    });

    return this.sanitize(updated);
  }

  // ──────────────────────────────────────────
  // SOFT DELETE (estActif = false)
  // ──────────────────────────────────────────

  async softDelete(ctx: UtilisateurContext, id: string) {
    const client = await this.client(ctx.schemaName);

    const user = await client.utilisateur.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!user) throw new AppError('Utilisateur introuvable', 404);

    if (user.role === 'DIRECTEUR') {
      throw new AppError('Un directeur ne peut pas être supprimé', 403);
    }

    await client.utilisateur.update({
      where: { id },
      data: { estActif: false, jetonActualisation: null },
    });

    return { id, deleted: true, mode: 'soft' as const };
  }

  // ──────────────────────────────────────────
  // HARD DELETE
  // ──────────────────────────────────────────

  async hardDelete(ctx: UtilisateurContext, id: string) {
    const client = await this.client(ctx.schemaName);

    const user = await client.utilisateur.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!user) throw new AppError('Utilisateur introuvable', 404);

    if (user.role === 'DIRECTEUR') {
      throw new AppError('Un directeur ne peut pas être supprimé', 403);
    }

    // Les profils métier (eleve, enseignant, …) sont supprimés via
    // onDelete: Cascade défini dans le schéma Prisma (ou manuellement
    // si non cascade).
    await client.utilisateur.delete({ where: { id } });

    return { id, deleted: true, mode: 'hard' as const };
  }
}

export const utilisateurService = new UtilisateurService();