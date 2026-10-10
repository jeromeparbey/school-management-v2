// backend/src/modules/directeur/directeur.service.ts

import { AppError } from '../../utils/AppError';
import { AuthUtils } from '../auth/auth.utils';
import { getTenantClient } from '../../config/tenant-db';
import { globalPrisma } from '../../config/global-db';

/**
 * ⚠️ Service multi-tenant.
 * Toutes les méthodes reçoivent `schemaName` (issu de req.user.schemaName).
 * La table `Utilisateur` (role=DIRECTEUR) + `Directeur` (profil métier)
 * sont dans le schéma PostgreSQL du tenant.
 */
export const directeurService = {
  // ─────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────
  async create(schemaName: string, data: any) {
    const tenant = await getTenantClient(schemaName);
    if (!tenant) throw new AppError('Client Prisma tenant introuvable', 500);

    const email = data.email.toLowerCase().trim();

    // Unicité email
    const existing = await tenant.utilisateur.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(
        `Un utilisateur avec l'email "${email}" existe déjà dans cet établissement`,
        409
      );
    }

    // Validation mot de passe
    const pwdCheck = AuthUtils.isStrongPassword(data.motDePasse);
    if (!pwdCheck.valid) {
      throw new AppError(
        `Mot de passe faible : ${pwdCheck.errors.join(', ')}`,
        400
      );
    }
    const hashedPassword = await AuthUtils.hashPassword(data.motDePasse);

    return tenant.$transaction(async (tx: any) => {
      // 1. Créer l'Utilisateur (role forcé DIRECTEUR)
      const utilisateur = await tx.utilisateur.create({
        data: {
          email,
          motDePasse: hashedPassword,
          prenom: data.prenom.trim(),
          nom: data.nom.trim(),
          role: 'DIRECTEUR',
          telephone: data.telephone?.trim() ?? null,
          photoProfil: data.photoProfil ?? null,
          estActif: true,
          emailVerifie: true, // créé par un admin → email vérifié
        },
      });

      // 2. Créer le profil métier "Directeur"
      const directeur = await tx.directeur.create({
        data: {
          utilisateurId: utilisateur.id,
          dateNomination: data.dateNomination ?? new Date(),
          signature: data.signature ?? null,
        },
      });

      return {
        id: utilisateur.id,
        email: utilisateur.email,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        role: utilisateur.role,
        telephone: utilisateur.telephone,
        photoProfil: utilisateur.photoProfil,
        estActif: utilisateur.estActif,
        emailVerifie: utilisateur.emailVerifie,
        derniereConnexion: utilisateur.derniereConnexion,
        createdAt: utilisateur.createdAt,
        updatedAt: utilisateur.updatedAt,
        directeur: {
          id: directeur.id,
          dateNomination: directeur.dateNomination,
          signature: directeur.signature,
        },
      };
    });
  },

  // ─────────────────────────────────────────────────────
  // LIST (scope TENANT — un seul établissement)
  // ─────────────────────────────────────────────────────
  async findAll(schemaName: string, query: any) {
    const tenant = await getTenantClient(schemaName);
    if (!tenant) throw new AppError('Client Prisma tenant introuvable', 500);

    const { page, limit, search, estActif, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      role: 'DIRECTEUR',
      ...(estActif !== undefined && { estActif }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { nom: { contains: search, mode: 'insensitive' } },
          { prenom: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await tenant.$transaction([
      tenant.utilisateur.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          prenom: true,
          nom: true,
          telephone: true,
          photoProfil: true,
          estActif: true,
          emailVerifie: true,
          derniereConnexion: true,
          createdAt: true,
          updatedAt: true,
          directeur: {
            select: {
              id: true,
              dateNomination: true,
              signature: true,
            },
          },
        },
      }),
      tenant.utilisateur.count({ where }),
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
  // 🔥 LIST GLOBALE (scope GLOBAL — SUPER_ADMIN)
  // Tous les directeurs de tous les établissements.
  // ─────────────────────────────────────────────────────
  async findAllGlobal(query: {
    page?: number;
    limit?: number;
    search?: string;
    estActif?: boolean;
    etablissementId?: string;
  }) {
    const {
      page = 1,
      limit = 50,
      search,
      estActif,
      etablissementId,
    } = query;

    // 1. Récupérer tous les établissements actifs + provisionnés
    const etablissements = await globalPrisma.etablissement.findMany({
      where: {
        estActif: true,
        statutProvisionnement: 'TERMINE',
        ...(etablissementId && { id: etablissementId }),
      },
      select: {
        id: true,
        nom: true,
        code: true,
        schemaName: true,
        ville: true,
        pays: true,
      },
      orderBy: { nom: 'asc' },
    });

    // 2. Pour chaque établissement, charger ses directeurs
    const allDirecteurs: any[] = [];

    for (const etab of etablissements) {
      try {
        const tenantClient = await getTenantClient(etab.schemaName);
        if (!tenantClient) continue;

        const where: any = {
          role: 'DIRECTEUR',
          ...(estActif !== undefined && { estActif }),
          ...(search && {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { nom: { contains: search, mode: 'insensitive' } },
              { prenom: { contains: search, mode: 'insensitive' } },
            ],
          }),
        };

        const directeurs = await tenantClient.utilisateur.findMany({
          where,
          select: {
            id: true,
            email: true,
            prenom: true,
            nom: true,
            telephone: true,
            photoProfil: true,
            estActif: true,
            emailVerifie: true,
            derniereConnexion: true,
            createdAt: true,
            updatedAt: true,
            directeur: {
              select: {
                id: true,
                dateNomination: true,
                signature: true,
              },
            },
          },
        });

        // Enrichir avec les infos de l'établissement
        for (const d of directeurs) {
          allDirecteurs.push({
            ...d,
            etablissement: {
              id: etab.id,
              nom: etab.nom,
              code: etab.code,
              schemaName: etab.schemaName,
              ville: etab.ville,
              pays: etab.pays,
            },
          });
        }
      } catch (err) {
        console.warn(
          `⚠️ [findAllGlobal] Impossible de charger ${etab.schemaName}:`,
          (err as Error).message
        );
        continue;
      }
    }

    // 3. Trier par date de création (desc)
    allDirecteurs.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // 4. Paginer en mémoire
    const total = allDirecteurs.length;
    const skip = (page - 1) * limit;
    const items = allDirecteurs.slice(skip, skip + limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      meta: {
        etablissementsScannes: etablissements.length,
      },
    };
  },

  // ─────────────────────────────────────────────────────
  // DETAIL
  // ─────────────────────────────────────────────────────
  async findById(schemaName: string, id: string) {
    const tenant = await getTenantClient(schemaName);
    if (!tenant) throw new AppError('Client Prisma tenant introuvable', 500);

    const directeur = await tenant.utilisateur.findFirst({
      where: { id, role: 'DIRECTEUR' },
      select: {
        id: true,
        email: true,
        prenom: true,
        nom: true,
        telephone: true,
        photoProfil: true,
        estActif: true,
        emailVerifie: true,
        derniereConnexion: true,
        createdAt: true,
        updatedAt: true,
        directeur: {
          select: {
            id: true,
            dateNomination: true,
            signature: true,
          },
        },
      },
    });

    if (!directeur) throw new AppError('Directeur introuvable', 404);
    return directeur;
  },

  // ─────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────
  async update(schemaName: string, id: string, data: any) {
    const tenant = await getTenantClient(schemaName);
    if (!tenant) throw new AppError('Client Prisma tenant introuvable', 500);

    const existing = await tenant.utilisateur.findFirst({
      where: { id, role: 'DIRECTEUR' },
    });
    if (!existing) throw new AppError('Directeur introuvable', 404);

    const { dateNomination, signature, motDePasse, email, ...utilisateurData } =
      data;

    let hashedPassword: string | undefined;
    if (motDePasse) {
      const pwdCheck = AuthUtils.isStrongPassword(motDePasse);
      if (!pwdCheck.valid) {
        throw new AppError(
          `Mot de passe faible : ${pwdCheck.errors.join(', ')}`,
          400
        );
      }
      hashedPassword = await AuthUtils.hashPassword(motDePasse);
    }

    let normalizedEmail: string | undefined;
    if (email && email !== existing.email) {
      normalizedEmail = email.toLowerCase().trim();
      const taken = await tenant.utilisateur.findUnique({
        where: { email: normalizedEmail },
      });
      if (taken) {
        throw new AppError('Cet email est déjà utilisé', 409);
      }
    }

    return tenant.$transaction(async (tx: any) => {
      await tx.utilisateur.update({
        where: { id },
        data: {
          ...utilisateurData,
          ...(normalizedEmail && { email: normalizedEmail }),
          ...(hashedPassword && { motDePasse: hashedPassword }),
        },
      });

      if (dateNomination !== undefined || signature !== undefined) {
        await tx.directeur.updateMany({
          where: { utilisateurId: id },
          data: {
            ...(dateNomination !== undefined && { dateNomination }),
            ...(signature !== undefined && { signature }),
          },
        });
      }

      return tx.utilisateur.findFirst({
        where: { id, role: 'DIRECTEUR' },
        select: {
          id: true,
          email: true,
          prenom: true,
          nom: true,
          telephone: true,
          photoProfil: true,
          estActif: true,
          emailVerifie: true,
          derniereConnexion: true,
          createdAt: true,
          updatedAt: true,
          directeur: {
            select: {
              id: true,
              dateNomination: true,
              signature: true,
            },
          },
        },
      });
    });
  },

  // ─────────────────────────────────────────────────────
  // TOGGLE ACTIF
  // ─────────────────────────────────────────────────────
  async toggleActif(schemaName: string, id: string, estActif: boolean) {
    const tenant = await getTenantClient(schemaName);
    if (!tenant) throw new AppError('Client Prisma tenant introuvable', 500);

    const existing = await tenant.utilisateur.findFirst({
      where: { id, role: 'DIRECTEUR' },
    });
    if (!existing) throw new AppError('Directeur introuvable', 404);

    return tenant.utilisateur.update({
      where: { id },
      data: { estActif },
      select: {
        id: true,
        email: true,
        prenom: true,
        nom: true,
        estActif: true,
        updatedAt: true,
      },
    });
  },

  // ─────────────────────────────────────────────────────
  // CHANGE PASSWORD
  // ─────────────────────────────────────────────────────
  async changePassword(
    schemaName: string,
    id: string,
    nouveauMotDePasse: string
  ) {
    const tenant = await getTenantClient(schemaName);
    if (!tenant) throw new AppError('Client Prisma tenant introuvable', 500);

    const existing = await tenant.utilisateur.findFirst({
      where: { id, role: 'DIRECTEUR' },
    });
    if (!existing) throw new AppError('Directeur introuvable', 404);

    const pwdCheck = AuthUtils.isStrongPassword(nouveauMotDePasse);
    if (!pwdCheck.valid) {
      throw new AppError(
        `Mot de passe faible : ${pwdCheck.errors.join(', ')}`,
        400
      );
    }

    const hashedPassword = await AuthUtils.hashPassword(nouveauMotDePasse);

    return tenant.utilisateur.update({
      where: { id },
      data: { motDePasse: hashedPassword },
      select: { id: true, email: true, updatedAt: true },
    });
  },

  // ─────────────────────────────────────────────────────
  // HARD DELETE
  // ─────────────────────────────────────────────────────
  /**
   * ⚠️ Supprime l'Utilisateur + son profil Directeur.
   * Refuse de supprimer le dernier directeur de l'établissement.
   */
  async hardDelete(schemaName: string, id: string) {
    const tenant = await getTenantClient(schemaName);
    if (!tenant) throw new AppError('Client Prisma tenant introuvable', 500);

    const existing = await tenant.utilisateur.findFirst({
      where: { id, role: 'DIRECTEUR' },
      include: { directeur: true },
    });
    if (!existing) throw new AppError('Directeur introuvable', 404);

    const autresDirecteurs = await tenant.utilisateur.count({
      where: { role: 'DIRECTEUR', id: { not: id } },
    });
    if (autresDirecteurs === 0) {
      throw new AppError(
        'Impossible de supprimer le dernier directeur de l’établissement',
        409
      );
    }

    return tenant.$transaction(async (tx: any) => {
      if (existing.directeur) {
        await tx.directeur.delete({ where: { id: existing.directeur.id } });
      }
      await tx.utilisateur.delete({ where: { id } });
    });
  },
};