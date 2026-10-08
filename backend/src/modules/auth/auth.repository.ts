// backend/src/modules/auth/auth.repository.ts

import { getTenantClient } from '../../config/tenant-db';
import type {
  RoleUtilisateur,
  // ⚠️ Les types viennent du client GLOBAL du tenant
  // Comme le client tenant est généré dynamiquement, on utilise `any` pour les types
  // En production, tu peux typer avec les types du tenant-reference
} from '@prisma/client';

// ============================================
// TYPES DE RETOUR
// ============================================

/** Client Prisma d'un tenant (typé dynamiquement) */
export type TenantPrismaClient = Awaited<ReturnType<typeof getTenantClient>>;

/** Utilisateur complet (avec mot de passe) — usage interne uniquement */
export type UserFull = {
  id: string;
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  role: RoleUtilisateur;
  estActif: boolean;
  emailVerifie: boolean;
  telephone: string | null;
  photoProfil: string | null;
  derniereConnexion: Date | null;
  jetonActualisation: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Utilisateur sans mot de passe ni refresh token — usage API */
export type UserSafe = Omit<UserFull, 'motDePasse' | 'jetonActualisation'>;

/** Utilisateur minimal pour listes / recherche */
export type UserMinimal = Pick<
  UserFull,
  'id' | 'email' | 'prenom' | 'nom' | 'role' | 'photoProfil'
>;

/** Utilisateur avec infos publiques étendues */
export type UserPublic = Pick<
  UserFull,
  | 'id'
  | 'email'
  | 'prenom'
  | 'nom'
  | 'role'
  | 'telephone'
  | 'photoProfil'
  | 'derniereConnexion'
  | 'createdAt'
  | 'updatedAt'
  | 'estActif'
  | 'emailVerifie'
>;

// ============================================
// TYPES ÉLÈVE & SURVEILLANT
// ============================================

/** Élève (profil métier du tenant) */
export interface Eleve {
  id: string;
  utilisateurId: string | null;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: string;
  dateNaissance: Date;
  lieuNaissance: string | null;
  nationalite: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  photo: string | null;
  infoMedicale: string | null;
  groupeSanguin: string | null;
  allergies: string | null;
  statut: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Surveillant (profil métier du tenant) */
export interface Surveillant {
  id: string;
  utilisateurId: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: string;
  dateNaissance: Date | null;
  telephone: string;
  email: string | null;
  adresse: string | null;
  photo: string | null;
  dateEmbauche: Date;
  typeContrat: string;
  zoneSurveillance: string | null;
  estActif: boolean;
  estArchive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Utilisateur + profil Élève (retour transaction) */
export interface UserWithEleve {
  user: UserFull;
  eleve: Eleve;
}

/** Utilisateur + profil Surveillant (retour transaction) */
export interface UserWithSurveillant {
  user: UserFull;
  surveillant: Surveillant;
}

/** Données pour créer un élève (compte + profil) */
export interface CreateEleveInput {
  // Compte utilisateur
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  telephone?: string;
  emailVerifie?: boolean;
  estActif?: boolean;

  // Profil élève
  sexe: string;
  dateNaissance: Date | string;
  lieuNaissance?: string;
  nationalite?: string;
  adresse?: string;
  photo?: string;
  infoMedicale?: string;
  groupeSanguin?: string;
  allergies?: string;
  matricule?: string; // généré si absent
}

/** Données pour créer un surveillant (compte + profil) */
export interface CreateSurveillantInput {
  // Compte utilisateur
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  telephone: string;
  emailVerifie?: boolean;
  estActif?: boolean;

  // Profil surveillant
  sexe: string;
  dateNaissance?: Date | string;
  adresse?: string;
  photo?: string;
  dateEmbauche: Date | string;
  typeContrat: string;
  zoneSurveillance?: string;
  matricule?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  role?: RoleUtilisateur;
  search?: string;
  estActif?: boolean;
  emailVerifie?: boolean;
}

export interface PaginatedUsers {
  users: UserPublic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
  byRole: Array<{ role: RoleUtilisateur; count: number }>;
  recentSignups: number;
}

// ============================================
// SELECTS PRÉDÉFINIS
// ============================================

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  prenom: true,
  nom: true,
  role: true,
  estActif: true,
  emailVerifie: true,
  telephone: true,
  photoProfil: true,
  derniereConnexion: true,
  createdAt: true,
  updatedAt: true,
} as const;

const USER_MINIMAL_SELECT = {
  id: true,
  email: true,
  prenom: true,
  nom: true,
  role: true,
  photoProfil: true,
} as const;

// ============================================
// REPOSITORY
// ============================================

export class AuthRepository {
  // ------------------------------------------
  // RÉCUPÉRATION DU CLIENT TENANT
  // ------------------------------------------

  /**
   * Récupère le client Prisma pour un schéma donné.
   * Tous les utilisateurs métier vivent dans le schéma de leur établissement.
   */
  private async getClient(schemaName: string): Promise<TenantPrismaClient> {
    return getTenantClient(schemaName);
  }

  // ------------------------------------------
  // RECHERCHE / LECTURE
  // ------------------------------------------

  /** Trouver un utilisateur par email */
  async findByEmail(
    schemaName: string,
    email: string
  ): Promise<UserFull | null> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() },
    }) as Promise<UserFull | null>;
  }

  /** Trouver un utilisateur par email (safe) */
  async findByEmailSafe(
    schemaName: string,
    email: string
  ): Promise<UserPublic | null> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: USER_PUBLIC_SELECT,
    }) as Promise<UserPublic | null>;
  }

  /** Trouver un utilisateur par ID */
  async findById(
    schemaName: string,
    id: string
  ): Promise<UserFull | null> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.findUnique({ where: { id } }) as Promise<UserFull | null>;
  }

  /** Trouver un utilisateur par ID (safe) */
  async findByIdSafe(
    schemaName: string,
    id: string
  ): Promise<UserPublic | null> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.findUnique({
      where: { id },
      select: USER_PUBLIC_SELECT,
    }) as Promise<UserPublic | null>;
  }

  /** Trouver un utilisateur par refresh token */
  async findByRefreshToken(
    schemaName: string,
    refreshToken: string
  ): Promise<UserFull | null> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.findFirst({
      where: { jetonActualisation: refreshToken, estActif: true },
    }) as Promise<UserFull | null>;
  }

  /** Trouver plusieurs utilisateurs par IDs */
  async findManyByIds(
    schemaName: string,
    ids: string[]
  ): Promise<UserMinimal[]> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.findMany({
      where: { id: { in: ids } },
      select: USER_MINIMAL_SELECT,
    }) as Promise<UserMinimal[]>;
  }

  /** Trouver par téléphone */
  async findByPhone(
    schemaName: string,
    telephone: string
  ): Promise<UserFull | null> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.findFirst({
      where: { telephone },
    }) as Promise<UserFull | null>;
  }

  // ------------------------------------------
  // RECHERCHE AVEC PROFIL ÉLÈVE / SURVEILLANT
  // ------------------------------------------

  /** Récupérer un utilisateur + son profil élève */
  async findEleveByUserId(schemaName: string, userId: string) {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.findUnique({
      where: { id: userId },
      include: { eleve: true },
    });
  }

  /** Récupérer un utilisateur + son profil surveillant */
  async findSurveillantByUserId(schemaName: string, userId: string) {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.findUnique({
      where: { id: userId },
      include: { surveillant: true },
    });
  }

  /** Rechercher un élève par matricule */
  async findEleveByMatricule(
    schemaName: string,
    matricule: string
  ): Promise<Eleve | null> {
    const prisma = await this.getClient(schemaName);
    return prisma.eleve.findUnique({ where: { matricule } }) as Promise<Eleve | null>;
  }

  /** Rechercher un surveillant par matricule */
  async findSurveillantByMatricule(
    schemaName: string,
    matricule: string
  ): Promise<Surveillant | null> {
    const prisma = await this.getClient(schemaName);
    return prisma.surveillant.findUnique({
      where: { matricule },
    }) as Promise<Surveillant | null>;
  }

  // ------------------------------------------
  // CRÉATION
  // ------------------------------------------

  async create(
    schemaName: string,
    data: {
      email: string;
      motDePasse: string;
      prenom: string;
      nom: string;
      role?: RoleUtilisateur;
      telephone?: string;
      emailVerifie?: boolean;
      estActif?: boolean;
    }
  ): Promise<UserFull> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.create({
      data: {
        email: data.email.toLowerCase().trim(),
        motDePasse: data.motDePasse,
        prenom: data.prenom.trim(),
        nom: data.nom.trim(),
        role: data.role ?? 'ENSEIGNANT',
        telephone: data.telephone,
        estActif: data.estActif ?? true,
        emailVerifie: data.emailVerifie ?? false,
      },
    }) as Promise<UserFull>;
  }

  /** Création en lot */
  async createMany(
    schemaName: string,
    data: Array<{
      email: string;
      motDePasse: string;
      prenom: string;
      nom: string;
      role?: RoleUtilisateur;
      telephone?: string;
    }>
  ): Promise<number> {
    const prisma = await this.getClient(schemaName);
    const result = await prisma.utilisateur.createMany({
      data: data.map((u) => ({
        ...u,
        email: u.email.toLowerCase().trim(),
        role: u.role ?? 'ENSEIGNANT',
      })),
      skipDuplicates: true,
    });
    return result.count;
  }

  // ------------------------------------------
  // CRÉATION — ÉLÈVE
  // ------------------------------------------

  async createEleve(
    schemaName: string,
    input: CreateEleveInput
  ): Promise<UserWithEleve> {
    const prisma = await this.getClient(schemaName);

    return prisma.$transaction(async (tx: any) => {
      // 1. Créer le compte utilisateur
      const user = await tx.utilisateur.create({
        data: {
          email: input.email.toLowerCase().trim(),
          motDePasse: input.motDePasse,
          prenom: input.prenom.trim(),
          nom: input.nom.trim(),
          role: 'ELEVE',
          telephone: input.telephone,
          emailVerifie: input.emailVerifie ?? false,
          estActif: input.estActif ?? true,
        },
      });

      // 2. Créer le profil élève
      const eleve = await tx.eleve.create({
        data: {
          utilisateurId: user.id,
          matricule: input.matricule ?? this.buildMatricule('ELE'),
          prenom: input.prenom.trim(),
          nom: input.nom.trim(),
          sexe: input.sexe,
          dateNaissance: new Date(input.dateNaissance),
          lieuNaissance: input.lieuNaissance,
          nationalite: input.nationalite,
          adresse: input.adresse,
          telephone: input.telephone,
          email: user.email,
          photo: input.photo,
          infoMedicale: input.infoMedicale,
          groupeSanguin: input.groupeSanguin,
          allergies: input.allergies,
        },
      });

      return { user, eleve } as UserWithEleve;
    });
  }

  // ------------------------------------------
  // CRÉATION — SURVEILLANT
  // ------------------------------------------

  async createSurveillant(
    schemaName: string,
    input: CreateSurveillantInput
  ): Promise<UserWithSurveillant> {
    const prisma = await this.getClient(schemaName);

    return prisma.$transaction(async (tx: any) => {
      // 1. Créer le compte utilisateur
      const user = await tx.utilisateur.create({
        data: {
          email: input.email.toLowerCase().trim(),
          motDePasse: input.motDePasse,
          prenom: input.prenom.trim(),
          nom: input.nom.trim(),
          role: 'SURVEILLANT',
          telephone: input.telephone,
          emailVerifie: input.emailVerifie ?? false,
          estActif: input.estActif ?? true,
        },
      });

      // 2. Créer le profil surveillant
      const surveillant = await tx.surveillant.create({
        data: {
          utilisateurId: user.id,
          matricule: input.matricule ?? this.buildMatricule('SUR'),
          prenom: input.prenom.trim(),
          nom: input.nom.trim(),
          sexe: input.sexe,
          dateNaissance: input.dateNaissance
            ? new Date(input.dateNaissance)
            : null,
          telephone: input.telephone,
          email: user.email,
          adresse: input.adresse,
          photo: input.photo,
          dateEmbauche: new Date(input.dateEmbauche),
          typeContrat: input.typeContrat,
          zoneSurveillance: input.zoneSurveillance,
        },
      });

      return { user, surveillant } as UserWithSurveillant;
    });
  }

  // ------------------------------------------
  // MISE À JOUR
  // ------------------------------------------

  async updateRefreshToken(
    schemaName: string,
    userId: string,
    refreshToken: string | null
  ): Promise<UserFull> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { jetonActualisation: refreshToken },
    }) as Promise<UserFull>;
  }

  async updateLastLogin(
    schemaName: string,
    userId: string
  ): Promise<UserFull> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { derniereConnexion: new Date() },
    }) as Promise<UserFull>;
  }

  async verifyEmail(
    schemaName: string,
    userId: string
  ): Promise<UserFull> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { emailVerifie: true },
    }) as Promise<UserFull>;
  }

  async updatePassword(
    schemaName: string,
    userId: string,
    newPassword: string
  ): Promise<UserFull> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.update({
      where: { id: userId },
      data: {
        motDePasse: newPassword,
        jetonActualisation: null,
      },
    }) as Promise<UserFull>;
  }

  async deactivateAccount(
    schemaName: string,
    userId: string
  ): Promise<UserFull> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { estActif: false, jetonActualisation: null },
    }) as Promise<UserFull>;
  }

  async reactivateAccount(
    schemaName: string,
    userId: string
  ): Promise<UserFull> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { estActif: true },
    }) as Promise<UserFull>;
  }

  async updateProfile(
    schemaName: string,
    userId: string,
    data: {
      prenom?: string;
      nom?: string;
      telephone?: string;
      photoProfil?: string;
    }
  ): Promise<UserPublic> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.update({
      where: { id: userId },
      data,
      select: USER_PUBLIC_SELECT,
    }) as Promise<UserPublic>;
  }

  async updateUserRole(
    schemaName: string,
    userId: string,
    role: RoleUtilisateur
  ): Promise<UserPublic> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { role },
      select: USER_PUBLIC_SELECT,
    }) as Promise<UserPublic>;
  }

  async update(
    schemaName: string,
    userId: string,
    data: any
  ): Promise<UserFull> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.update({
      where: { id: userId },
      data,
    }) as Promise<UserFull>;
  }

  async updateEleve(
    schemaName: string,
    eleveId: string,
    data: any
  ): Promise<Eleve> {
    const prisma = await this.getClient(schemaName);
    return prisma.eleve.update({
      where: { id: eleveId },
      data,
    }) as Promise<Eleve>;
  }

  async updateSurveillant(
    schemaName: string,
    surveillantId: string,
    data: any
  ): Promise<Surveillant> {
    const prisma = await this.getClient(schemaName);
    return prisma.surveillant.update({
      where: { id: surveillantId },
      data,
    }) as Promise<Surveillant>;
  }

  // ------------------------------------------
  // SUPPRESSION
  // ------------------------------------------

  async softDeleteUser(
    schemaName: string,
    userId: string
  ): Promise<UserFull> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { estActif: false, jetonActualisation: null },
    }) as Promise<UserFull>;
  }

  async deleteUser(schemaName: string, userId: string): Promise<UserFull> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.delete({
      where: { id: userId },
    }) as Promise<UserFull>;
  }

  // ------------------------------------------
  // LECTURES SPÉCIALISÉES
  // ------------------------------------------

  async getUserInfo(
    schemaName: string,
    userId: string
  ): Promise<UserPublic | null> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.findUnique({
      where: { id: userId },
      select: USER_PUBLIC_SELECT,
    }) as Promise<UserPublic | null>;
  }

  async findUsersByRole(
    schemaName: string,
    role: RoleUtilisateur
  ): Promise<UserMinimal[]> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.findMany({
      where: { role, estActif: true },
      select: USER_MINIMAL_SELECT,
    }) as Promise<UserMinimal[]>;
  }

  async searchUsers(
    schemaName: string,
    query: string,
    limit = 10
  ): Promise<UserMinimal[]> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.findMany({
      where: {
        estActif: true,
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { prenom: { contains: query, mode: 'insensitive' } },
          { nom: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: USER_MINIMAL_SELECT,
      orderBy: { nom: 'asc' },
    }) as Promise<UserMinimal[]>;
  }

  async searchEleves(schemaName: string, query: string, limit = 10) {
    const prisma = await this.getClient(schemaName);
    return prisma.eleve.findMany({
      where: {
        statut: 'ACTIF',
        OR: [
          { matricule: { contains: query, mode: 'insensitive' } },
          { prenom: { contains: query, mode: 'insensitive' } },
          { nom: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        matricule: true,
        prenom: true,
        nom: true,
        photo: true,
        statut: true,
      },
      orderBy: { nom: 'asc' },
    });
  }

  async getAllUsers(
    schemaName: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedUsers> {
    const prisma = await this.getClient(schemaName);
    const { page = 1, limit = 10, role, search, estActif, emailVerifie } = options;

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where: any = {};

    if (role) where.role = role;
    if (typeof estActif === 'boolean') where.estActif = estActif;
    if (typeof emailVerifie === 'boolean') where.emailVerifie = emailVerifie;

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { prenom: { contains: q, mode: 'insensitive' } },
        { nom: { contains: q, mode: 'insensitive' } },
        { telephone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.utilisateur.findMany({
        where,
        skip,
        take: safeLimit,
        select: USER_PUBLIC_SELECT,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.utilisateur.count({ where }),
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    return {
      users: users as UserPublic[],
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    };
  }

  // ------------------------------------------
  // VÉRIFICATIONS
  // ------------------------------------------

  async emailExists(schemaName: string, email: string): Promise<boolean> {
    const prisma = await this.getClient(schemaName);
    const user = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });
    return !!user;
  }

  async phoneExists(schemaName: string, telephone: string): Promise<boolean> {
    const prisma = await this.getClient(schemaName);
    const user = await prisma.utilisateur.findFirst({
      where: { telephone },
      select: { id: true },
    });
    return !!user;
  }

  async hasRole(
    schemaName: string,
    userId: string,
    role: RoleUtilisateur
  ): Promise<boolean> {
    const prisma = await this.getClient(schemaName);
    const user = await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return (user as any)?.role === role;
  }

  async isActive(schemaName: string, userId: string): Promise<boolean> {
    const prisma = await this.getClient(schemaName);
    const user = await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { estActif: true },
    });
    return (user as any)?.estActif === true;
  }

  async matriculeExists(
    schemaName: string,
    matricule: string
  ): Promise<boolean> {
    const prisma = await this.getClient(schemaName);
    const [eleve, enseignant, surveillant] = await Promise.all([
      prisma.eleve.findFirst({ where: { matricule }, select: { id: true } }),
      prisma.enseignant.findFirst({ where: { matricule }, select: { id: true } }),
      prisma.surveillant.findFirst({ where: { matricule }, select: { id: true } }),
    ]);
    return !!(eleve || enseignant || surveillant);
  }

  // ------------------------------------------
  // STATISTIQUES
  // ------------------------------------------

  async getUserStats(schemaName: string): Promise<UserStats> {
    const prisma = await this.getClient(schemaName);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [total, active, verified, recentSignups, byRoleRaw] = await Promise.all([
      prisma.utilisateur.count(),
      prisma.utilisateur.count({ where: { estActif: true } }),
      prisma.utilisateur.count({ where: { emailVerifie: true } }),
      prisma.utilisateur.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.utilisateur.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      verified,
      unverified: total - verified,
      recentSignups,
      byRole: (byRoleRaw as any[]).map((item) => ({
        role: item.role,
        count: item._count._all,
      })),
    };
  }

  async countByRole(schemaName: string, role: RoleUtilisateur): Promise<number> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.count({ where: { role } });
  }

  // ------------------------------------------
  // TRANSACTIONS
  // ------------------------------------------

  async transaction<T>(
    schemaName: string,
    fn: (tx: any) => Promise<T>
  ): Promise<T> {
    const prisma = await this.getClient(schemaName);
    return prisma.$transaction(fn);
  }

  // ------------------------------------------
  // MAINTENANCE / SÉCURITÉ
  // ------------------------------------------

  async revokeAllSessions(schemaName: string, userId: string): Promise<void> {
    const prisma = await this.getClient(schemaName);
    await prisma.utilisateur.update({
      where: { id: userId },
      data: { jetonActualisation: null },
    });
  }

  async isRefreshTokenExpired(
    schemaName: string,
    userId: string,
    maxAgeDays = 30
  ): Promise<boolean> {
    const prisma = await this.getClient(schemaName);
    const user = (await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { updatedAt: true },
    })) as any;
    if (!user) return true;
    const ageMs = Date.now() - user.updatedAt.getTime();
    return ageMs > maxAgeDays * 24 * 60 * 60 * 1000;
  }

  async cleanupInactiveAccounts(
    schemaName: string,
    daysInactive = 365
  ): Promise<number> {
    const prisma = await this.getClient(schemaName);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysInactive);

    const result = await prisma.utilisateur.updateMany({
      where: {
        estActif: false,
        derniereConnexion: { lt: threshold },
      },
      data: { jetonActualisation: null },
    });
    return result.count;
  }

  async countCreatedBetween(
    schemaName: string,
    start: Date,
    end: Date
  ): Promise<number> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.count({
      where: { createdAt: { gte: start, lte: end } },
    });
  }

  async getRecentUsers(
    schemaName: string,
    limit = 5
  ): Promise<UserPublic[]> {
    const prisma = await this.getClient(schemaName);
    return prisma.utilisateur.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: USER_PUBLIC_SELECT,
    }) as Promise<UserPublic[]>;
  }

  async getInactiveUsers(
    schemaName: string,
    daysSinceLogin = 90
  ): Promise<UserPublic[]> {
    const prisma = await this.getClient(schemaName);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysSinceLogin);

    return prisma.utilisateur.findMany({
      where: {
        estActif: true,
        OR: [
          { derniereConnexion: null },
          { derniereConnexion: { lt: threshold } },
        ],
      },
      select: USER_PUBLIC_SELECT,
      orderBy: { derniereConnexion: 'asc' },
    }) as Promise<UserPublic[]>;
  }

  // ------------------------------------------
  // HELPERS PRIVÉS
  // ------------------------------------------

  private buildMatricule(prefix: string): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${year}-${random}`;
  }
}

// ============================================
// SINGLETON
// ============================================

export const authRepository = new AuthRepository();