// backend/src/modules/catalogue/etablissement/etablissement.service.ts

import { globalPrisma } from '../../config/global-db';
import { Prisma } from '../../../prisma/generated/global-client';
import { AppError } from '../../utils/AppError';
import { provisioningService } from '../../services/provisioning.service';

export const etablissementService = {
  // ─────────────────────────────────────────────────────
  // CREATE : délègue TOUT au ProvisioningService
  // ─────────────────────────────────────────────────────
  /**
   * Le ProvisioningService :
   *  1. génère le schemaName depuis `code`
   *  2. crée l'entrée catalogue (EN_COURS)
   *  3. crée le schéma PostgreSQL
   *  4. génère + applique le schéma Prisma du tenant
   *  5. seed initial (niveaux + paramètres)
   *  6. passe à TERMINE (ou ECHEC)
   */
  async create(data: {
    nom: string;
    code: string;
    ville?: string | null;
    email?: string | null;
    telephone?: string | null;
    // ... autres champs optionnels à propager
    [key: string]: any;
  }) {
    // Unicité du code (le schemaName en dépend)
    const existe = await globalPrisma.etablissement.findUnique({
      where: { code: data.code },
    });
    if (existe) {
      throw new AppError(
        `Un établissement avec le code "${data.code}" existe déjà`,
        409
      );
    }

    // Le ProvisioningService gère l'ensemble (schemaName + PG + seed)
    const etablissement =
      await provisioningService.createEtablissementWithSchema({
        nom: data.nom,
        code: data.code,
        ville: data.ville ?? undefined,
        email: data.email ?? undefined,
        telephone: data.telephone ?? undefined,
      });

    // Mettre à jour les champs supplémentaires (non gérés par le provisioning)
    const {
      nom, code, ville, email, telephone,
      ...champsSupplementaires
    } = data;

    if (Object.keys(champsSupplementaires).length > 0) {
      return globalPrisma.etablissement.update({
        where: { id: etablissement.id },
        data: champsSupplementaires,
      });
    }

    return etablissement;
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
  // DETAIL
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
    return etablissement;
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
   *  - des abonnements/factures existent (à toi de choisir la politique)
   * ⚠️ Le schéma PostgreSQL n'est PAS supprimé (DROP SCHEMA manuel admin).
   */
  async hardDelete(id: string) {
    const etablissement = await this.findById(id);

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
  // RE-PROVISIONNER (si 1er provisioning a échoué)
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
  // STATS (dashboard SUPER_ADMIN)
  // ─────────────────────────────────────────────────────
  async stats() {
    const [total, actifs, parPlan, parType, parProvisionnement] =
      await globalPrisma.$transaction([
        globalPrisma.etablissement.count(),
        globalPrisma.etablissement.count({ where: { estActif: true } }),
        globalPrisma.etablissement.groupBy({
          by: ['planAbonnement'],
          _count: { _all: true },
        }),
        globalPrisma.etablissement.groupBy({
          by: ['type'],
          _count: { _all: true },
        }),
        globalPrisma.etablissement.groupBy({
          by: ['statutProvisionnement'],
          _count: { _all: true },
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