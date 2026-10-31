// backend/src/modules/catalogue/etablissement/etablissement.service.ts

import { globalPrisma } from '../../config/global-db.js';
import { Prisma } from '../../../prisma/generated/global-client/index.js';
import { AppError } from '../../utils/AppError.js';
import { provisioningService } from '../../services/provisioning.service.js';
import { AuthUtils } from '../auth/auth.utils.js';
import { getTenantClient } from '../../config/tenant-db.js';

export const etablissementService = {
  // ─────────────────────────────────────────────────────
  // CREATE : provisioning + création du DIRECTEUR initial
  // ─────────────────────────────────────────────────────
  /**
   * Pipeline complet :
   *  1. Vérifier unicité du code
   *  2. Valider + hasher le mot de passe du directeur
   *  3. ProvisioningService → crée catalogue + schéma PG + seed
   *  4. Mettre à jour les champs supplémentaires du catalogue
   *  5. Créer le DIRECTEUR dans le schéma du tenant
   *  6. Créer le profil Directeur (table directeurs)
   *  7. Retourner l'établissement + le directeur
   */
  async create(data: {
    nom: string;
    code: string;
    ville?: string | null;
    email?: string | null;
    telephone?: string | null;
    directeur: {
      email: string;
      motDePasse: string;
      prenom: string;
      nom: string;
      telephone?: string | null;
      photoProfil?: string | null;
    };
    [key: string]: any;
  }) {
    // ─── 1. Extraire le bloc directeur ───
    const { directeur, ...etablissementData } = data;

    if (!directeur) {
      throw new AppError(
        'Les informations du directeur sont obligatoires',
        400
      );
    }

    // ─── 2. Vérifier unicité du code ───
    const existe = await globalPrisma.etablissement.findUnique({
      where: { code: etablissementData.code },
    });
    if (existe) {
      throw new AppError(
        `Un établissement avec le code "${etablissementData.code}" existe déjà`,
        409
      );
    }

    // ─── 3. Valider le mot de passe du directeur ───
    const pwdCheck = AuthUtils.isStrongPassword(directeur.motDePasse);
    if (!pwdCheck.valid) {
      throw new AppError(
        `Mot de passe directeur faible : ${pwdCheck.errors.join(', ')}`,
        400
      );
    }

    // ─── 4. Hasher le mot de passe ───
    const hashedPassword = await AuthUtils.hashPassword(directeur.motDePasse);

    // ─── 5. Provisioning (catalogue + schéma PG + seed) ───
    const etablissement =
      await provisioningService.createEtablissementWithSchema({
        nom: etablissementData.nom,
        code: etablissementData.code,
        ville: etablissementData.ville ?? undefined,
        email: etablissementData.email ?? undefined,
        telephone: etablissementData.telephone ?? undefined,
      });

    // ─── 6. Mettre à jour les champs supplémentaires du catalogue ───
    const {
      nom, code, ville, email, telephone,
      ...champsSupplementaires
    } = etablissementData;

    let etablissementFinal = etablissement;
    if (Object.keys(champsSupplementaires).length > 0) {
      etablissementFinal = await globalPrisma.etablissement.update({
        where: { id: etablissement.id },
        data: champsSupplementaires,
      });
    }

    // ─── 7. Créer le DIRECTEUR dans le schéma du tenant ───
    let directeurCree: any = null;
    try {
      const tenantClient = await getTenantClient(etablissementFinal.schemaName);
      if (!tenantClient) {
        throw new Error(
          `Client Prisma introuvable pour "${etablissementFinal.schemaName}"`
        );
      }

      const emailDirecteur = directeur.email.toLowerCase().trim();

      // Vérifier l'unicité de l'email dans le tenant
      const existing = await tenantClient.utilisateur.findUnique({
        where: { email: emailDirecteur },
      });
      if (existing) {
        throw new Error(
          `Un utilisateur avec l'email "${emailDirecteur}" existe déjà dans cet établissement`
        );
      }

      // Créer l'utilisateur DIRECTEUR (Utilisateur + Directeur en transaction)
      const result = await tenantClient.$transaction(async (tx: any) => {
        const utilisateur = await tx.utilisateur.create({
          data: {
            email: emailDirecteur,
            motDePasse: hashedPassword,
            prenom: directeur.prenom.trim(),
            nom: directeur.nom.trim(),
            role: 'DIRECTEUR',
            telephone: directeur.telephone?.trim() ?? null,
            photoProfil: directeur.photoProfil ?? null,
            estActif: true,
            emailVerifie: true,   // créé par SUPER_ADMIN → email considéré vérifié
          },
        });

        await tx.directeur.create({
          data: {
            utilisateurId: utilisateur.id,
            dateNomination: new Date(),
          },
        });

        return utilisateur;
      });

      directeurCree = {
        id: result.id,
        email: result.email,
        prenom: result.prenom,
        nom: result.nom,
        role: result.role,
        telephone: result.telephone,
        estActif: result.estActif,
        emailVerifie: result.emailVerifie,
        createdAt: result.createdAt,
      };
    } catch (err: any) {
      // ❌ Marquer l'établissement en ECHEC pour permettre un retry
      await globalPrisma.etablissement.update({
        where: { id: etablissementFinal.id },
        data: {
          statutProvisionnement: 'ECHEC',
          erreurProvisionnement: `Directeur : ${err.message}`,
        },
      });

      throw new AppError(
        `Établissement créé mais échec de création du directeur : ${err.message}`,
        500
      );
    }

    // ─── 8. Retourner l'établissement + le directeur ───
    return {
      ...etablissementFinal,
      directeur: directeurCree,
    };
  },

  // ─────────────────────────────────────────────────────
  // LIST
  // ─────────────────────────────────────────────────────
  async findAll(query: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
    planAbonnement?: string;
    statutProvisionnement?: string;
    estActif?: boolean;
    estArchive?: boolean;
    ville?: string;
    pays?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    const { page, limit, search, sortBy, sortOrder, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EtablissementWhereInput = {
      ...(filters.type && { type: filters.type as any }),
      ...(filters.planAbonnement && {
        planAbonnement: filters.planAbonnement as any,
      }),
      ...(filters.statutProvisionnement && {
        statutProvisionnement: filters.statutProvisionnement as any,
      }),
      ...(filters.estActif !== undefined && { estActif: filters.estActif }),
      ...(filters.estArchive !== undefined && { estArchive: filters.estArchive }),
      ...(filters.ville && {
        ville: { contains: filters.ville, mode: 'insensitive' },
      }),
      ...(filters.pays && {
        pays: { contains: filters.pays, mode: 'insensitive' },
      }),
      ...(search && {
        OR: [
          { nom: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { ville: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await globalPrisma.$transaction([
      globalPrisma.etablissement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          nom: true,
          code: true,
          type: true,
          ville: true,
          pays: true,
          logo: true,
          devise: true,
          planAbonnement: true,
          dateExpiration: true,
          estActif: true,
          estArchive: true,
          statutProvisionnement: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              utilisateursGlobaux: true,
              abonnements: true,
              factures: true,
            },
          },
        },
      }),
      globalPrisma.etablissement.count({ where }),
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
  },

  // ─────────────────────────────────────────────────────
  // DETAIL (avec le directeur du tenant)
  // ─────────────────────────────────────────────────────
  async findById(id: string) {
    const etablissement = await globalPrisma.etablissement.findUnique({
      where: { id },
      include: {
        utilisateursGlobaux: {
          select: {
            id: true,
            email: true,
            prenom: true,
            nom: true,
            role: true,
            estActif: true,
            createdAt: true,
          },
        },
        abonnements: { orderBy: { dateDebut: 'desc' } },
        factures: { orderBy: { dateEmission: 'desc' }, take: 10 },
      },
    });

    if (!etablissement) {
      throw new AppError('Établissement introuvable', 404);
    }

    // 🔥 Récupérer le directeur depuis le schéma du tenant
    let directeur = null;
    if (etablissement.statutProvisionnement === 'TERMINE') {
      try {
        const tenantClient = await getTenantClient(etablissement.schemaName);
        if (tenantClient) {
          directeur = await tenantClient.utilisateur.findFirst({
            where: { role: 'DIRECTEUR' },
            select: {
              id: true,
              email: true,
              prenom: true,
              nom: true,
              telephone: true,
              photoProfil: true,
              estActif: true,
              derniereConnexion: true,
              createdAt: true,
              directeur: {
                select: {
                  id: true,
                  dateNomination: true,
                  signature: true,
                },
              },
            },
          });
        }
      } catch (err) {
        console.warn(
          `⚠️ Impossible de charger le directeur de ${etablissement.schemaName}:`,
          (err as Error).message
        );
      }
    }

    return { ...etablissement, directeur };
  },

  // ─────────────────────────────────────────────────────
  // UPDATE (code et schemaName immuables)
  // ─────────────────────────────────────────────────────
  async update(id: string, data: Prisma.EtablissementUpdateInput) {
    await this.findById(id);
    return globalPrisma.etablissement.update({ where: { id }, data });
  },

  // ─────────────────────────────────────────────────────
  // TOGGLE actif/inactif
  // ─────────────────────────────────────────────────────
  async toggleActif(id: string, estActif: boolean) {
    await this.findById(id);
    return globalPrisma.etablissement.update({
      where: { id },
      data: {
        estActif,
        estArchive: estActif ? false : true,
      },
    });
  },

  // ─────────────────────────────────────────────────────
  // ARCHIVE (soft delete)
  // ─────────────────────────────────────────────────────
  async archive(id: string) {
    await this.findById(id);
    return globalPrisma.etablissement.update({
      where: { id },
      data: { estActif: false, estArchive: true },
    });
  },

  // ─────────────────────────────────────────────────────
  // HARD DELETE
  // ─────────────────────────────────────────────────────
  /**
   * ⚠️ Refuse si :
   *  - des utilisateurs globaux sont liés
   *  - des abonnements/factures existent
   * ⚠️ Le schéma PostgreSQL n'est PAS supprimé (DROP SCHEMA manuel admin).
   */
  async hardDelete(id: string) {
    await this.findById(id);

    const [users, abos, factures] = await globalPrisma.$transaction([
      globalPrisma.utilisateurGlobal.count({
        where: { etablissementId: id },
      }),
      globalPrisma.abonnementEtablissement.count({
        where: { etablissementId: id },
      }),
      globalPrisma.factureEtablissement.count({
        where: { etablissementId: id },
      }),
    ]);

    if (users > 0) {
      throw new AppError(
        `Impossible de supprimer : ${users} utilisateur(s) global(aux) lié(s)`,
        409
      );
    }
    if (abos > 0 || factures > 0) {
      throw new AppError(
        `Impossible de supprimer : ${abos} abonnement(s) et ${factures} facture(s) liés`,
        409
      );
    }

    // ⚠️ Optionnel : DROP SCHEMA (à activer si tu veux vraiment tout nettoyer)
    // await globalPrisma.$executeRawUnsafe(
    //   `DROP SCHEMA IF EXISTS "${etablissement.schemaName}" CASCADE`
    // );

    return globalPrisma.etablissement.delete({ where: { id } });
  },

  // ─────────────────────────────────────────────────────
  // RE-PROVISIONNER
  // ─────────────────────────────────────────────────────
  async reprovisionner(id: string) {
    const etablissement = await this.findById(id);

    if (etablissement.statutProvisionnement === 'TERMINE') {
      throw new AppError('Cet établissement est déjà provisionné', 409);
    }

    await globalPrisma.etablissement.update({
      where: { id },
      data: { statutProvisionnement: 'EN_COURS', erreurProvisionnement: null },
    });

    try {
      await provisioningService.reprovisionTenant(etablissement.schemaName);
      return globalPrisma.etablissement.update({
        where: { id },
        data: { statutProvisionnement: 'TERMINE' },
      });
    } catch (err: any) {
      await globalPrisma.etablissement.update({
        where: { id },
        data: {
          statutProvisionnement: 'ECHEC',
          erreurProvisionnement: err.message,
        },
      });
      throw new AppError(`Échec du re-provisionnement : ${err.message}`, 500);
    }
  },

    // ─────────────────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────────────────
  async stats() {
    const [total, actifs, parPlan, parType, parProvisionnement] =
      await globalPrisma.$transaction([
        globalPrisma.etablissement.count(),
        globalPrisma.etablissement.count({ where: { estActif: true } }),
        globalPrisma.etablissement.groupBy({
          by: ['planAbonnement'],
          _count: { _all: true },
          orderBy: { planAbonnement: 'asc' },
        }),
        globalPrisma.etablissement.groupBy({
          by: ['type'],
          _count: { _all: true },
          orderBy: { type: 'asc' },
        }),
        globalPrisma.etablissement.groupBy({
          by: ['statutProvisionnement'],
          _count: { _all: true },
          orderBy: { statutProvisionnement: 'asc' },
        }),
      ]);

      
    return {
      total,
      actifs,
      inactifs: total - actifs,
      parPlan,
      parType,
      parProvisionnement,
    };
  },
};