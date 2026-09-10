// backend/src/modules/auth/auth.repository.ts

import { prisma } from '../../config/db';
import type { Utilisateur, RoleUtilisateur, Prisma } from '@prisma/client';

// ============================================
// TYPES DE RETOUR
// ============================================

/** Utilisateur complet (avec mot de passe) — usage interne uniquement */
export type UserFull = Utilisateur;

/** Utilisateur sans mot de passe ni refresh token — usage API */
export type UserSafe = Omit<Utilisateur, 'motDePasse' | 'jetonActualisation'>;

/** Utilisateur minimal pour listes / recherche */
export type UserMinimal = Pick<
  Utilisateur,
  'id' | 'email' | 'prenom' | 'nom' | 'role' | 'photoProfil'
>;

/** Utilisateur avec infos publiques étendues */
export type UserPublic = Pick<
  Utilisateur,
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
  recentSignups: number; // 30 derniers jours
}

// ============================================
// SELECTS PRÉDÉFINIS (réutilisables)
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
} as const satisfies Prisma.UtilisateurSelect;

const USER_MINIMAL_SELECT = {
  id: true,
  email: true,
  prenom: true,
  nom: true,
  role: true,
  photoProfil: true,
} as const satisfies Prisma.UtilisateurSelect;

// ============================================
// REPOSITORY
// ============================================

export class AuthRepository {
  // ------------------------------------------
  // RECHERCHE / LECTURE
  // ------------------------------------------

  /** Trouver un utilisateur par email (avec mot de passe) */
  async findByEmail(email: string): Promise<UserFull | null> {
    return prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  /** Trouver un utilisateur par email (safe) */
  async findByEmailSafe(email: string): Promise<UserPublic | null> {
    return prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: USER_PUBLIC_SELECT,
    });
  }

  /** Trouver un utilisateur par ID (avec mot de passe) */
  async findById(id: string): Promise<UserFull | null> {
    return prisma.utilisateur.findUnique({ where: { id } });
  }

  /** Trouver un utilisateur par ID (safe) */
  async findByIdSafe(id: string): Promise<UserPublic | null> {
    return prisma.utilisateur.findUnique({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });
  }

  /** Trouver un utilisateur par refresh token */
  async findByRefreshToken(refreshToken: string): Promise<UserFull | null> {
    return prisma.utilisateur.findFirst({
      where: { jetonActualisation: refreshToken, estActif: true },
    });
  }

  /** Trouver plusieurs utilisateurs par IDs */
  async findManyByIds(ids: string[]): Promise<UserMinimal[]> {
    return prisma.utilisateur.findMany({
      where: { id: { in: ids } },
      select: USER_MINIMAL_SELECT,
    });
  }

  /** Trouver par téléphone */
  async findByPhone(telephone: string): Promise<UserFull | null> {
    return prisma.utilisateur.findFirst({ where: { telephone } });
  }

  // ------------------------------------------
  // CRÉATION
  // ------------------------------------------

  async create(data: {
    email: string;
    motDePasse: string;
    prenom: string;
    nom: string;
    role?: RoleUtilisateur;
    telephone?: string;
    emailVerifie?: boolean;
    estActif?: boolean;
  }): Promise<UserFull> {
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
    });
  }

  /** Création en lot (transaction) */
  async createMany(
    data: Array<{
      email: string;
      motDePasse: string;
      prenom: string;
      nom: string;
      role?: RoleUtilisateur;
      telephone?: string;
    }>
  ): Promise<number> {
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
  // MISE À JOUR
  // ------------------------------------------

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null
  ): Promise<UserFull> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { jetonActualisation: refreshToken },
    });
  }

  async updateLastLogin(userId: string): Promise<UserFull> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { derniereConnexion: new Date() },
    });
  }

  async verifyEmail(userId: string): Promise<UserFull> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { emailVerifie: true },
    });
  }

  async updatePassword(userId: string, newPassword: string): Promise<UserFull> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: {
        motDePasse: newPassword,
        jetonActualisation: null, // invalide les sessions existantes
      },
    });
  }

  async deactivateAccount(userId: string): Promise<UserFull> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { estActif: false, jetonActualisation: null },
    });
  }

  async reactivateAccount(userId: string): Promise<UserFull> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { estActif: true },
    });
  }

  async updateProfile(
    userId: string,
    data: {
      prenom?: string;
      nom?: string;
      telephone?: string;
      photoProfil?: string;
    }
  ): Promise<UserPublic> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data,
      select: USER_PUBLIC_SELECT,
    });
  }

  async updateUserRole(
    userId: string,
    role: RoleUtilisateur
  ): Promise<UserPublic> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { role },
      select: USER_PUBLIC_SELECT,
    });
  }

  /** Mise à jour générique */
  async update(
    userId: string,
    data: Prisma.UtilisateurUpdateInput
  ): Promise<UserFull> {
    return prisma.utilisateur.update({ where: { id: userId }, data });
  }

  // ------------------------------------------
  // SUPPRESSION
  // ------------------------------------------

  async softDeleteUser(userId: string): Promise<UserFull> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { estActif: false, jetonActualisation: null },
    });
  }

  async deleteUser(userId: string): Promise<UserFull> {
    return prisma.utilisateur.delete({ where: { id: userId } });
  }

  // ------------------------------------------
  // LECTURES SPÉCIALISÉES
  // ------------------------------------------

  /** Obtenir les infos safe d'un utilisateur */
  async getUserInfo(userId: string): Promise<UserPublic | null> {
    return prisma.utilisateur.findUnique({
      where: { id: userId },
      select: USER_PUBLIC_SELECT,
    });
  }

  /** Utilisateurs par rôle (safe) */
  async findUsersByRole(role: RoleUtilisateur): Promise<UserMinimal[]> {
    return prisma.utilisateur.findMany({
      where: { role, estActif: true },
      select: USER_MINIMAL_SELECT,
    });
  }

  /** Recherche full-text simple */
  async searchUsers(query: string, limit = 10): Promise<UserMinimal[]> {
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
    });
  }

  /** Liste paginée avec filtres */
  async getAllUsers(options: PaginationOptions = {}): Promise<PaginatedUsers> {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      estActif,
      emailVerifie,
    } = options;

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.UtilisateurWhereInput = {};

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
      users,
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

  async emailExists(email: string): Promise<boolean> {
    const user = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });
    return !!user;
  }

  async phoneExists(telephone: string): Promise<boolean> {
    const user = await prisma.utilisateur.findFirst({
      where: { telephone },
      select: { id: true },
    });
    return !!user;
  }

  async hasRole(userId: string, role: RoleUtilisateur): Promise<boolean> {
    const user = await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return user?.role === role;
  }

  async isActive(userId: string): Promise<boolean> {
    const user = await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { estActif: true },
    });
    return user?.estActif === true;
  }

  // ------------------------------------------
  // STATISTIQUES
  // ------------------------------------------

  async getUserStats(): Promise<UserStats> {
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
      byRole: byRoleRaw.map((item) => ({
        role: item.role,
        count: item._count._all,
      })),
    };
  }

  /** Statistiques pour un rôle précis */
  async countByRole(role: RoleUtilisateur): Promise<number> {
    return prisma.utilisateur.count({ where: { role } });
  }

  // ------------------------------------------
  // TRANSACTIONS
  // ------------------------------------------

  /** Exécuter plusieurs opérations dans une transaction */
  async transaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return prisma.$transaction(fn);
  }

  /** Créer un utilisateur + son profil métier (élève/enseignant) en transaction */
  async createWithProfile<T>(
    userData: {
      email: string;
      motDePasse: string;
      prenom: string;
      nom: string;
      role: RoleUtilisateur;
      telephone?: string;
    },
    profileCreator: (tx: Prisma.TransactionClient, userId: string) => Promise<T>
  ): Promise<{ user: UserFull; profile: T }> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.utilisateur.create({
        data: {
          ...userData,
          email: userData.email.toLowerCase().trim(),
        },
      });
      const profile = await profileCreator(tx, user.id);
      return { user, profile };
    });
  }

  // ------------------------------------------
  // MAINTENANCE / SÉCURITÉ
  // ------------------------------------------

  /** Invalider toutes les sessions d'un utilisateur */
  async revokeAllSessions(userId: string): Promise<void> {
    await prisma.utilisateur.update({
      where: { id: userId },
      data: { jetonActualisation: null },
    });
  }

  /** Vérifier l'expiration du refresh token (basé sur updatedAt) */
  async isRefreshTokenExpired(
    userId: string,
    maxAgeDays = 30
  ): Promise<boolean> {
    const user = await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { updatedAt: true },
    });
    if (!user) return true;
    const ageMs = Date.now() - user.updatedAt.getTime();
    return ageMs > maxAgeDays * 24 * 60 * 60 * 1000;
  }

  /** Nettoyer les comptes inactifs depuis X jours */
  async cleanupInactiveAccounts(daysInactive = 365): Promise<number> {
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

  /** Compter les utilisateurs par plage de dates */
  async countCreatedBetween(start: Date, end: Date): Promise<number> {
    return prisma.utilisateur.count({
      where: { createdAt: { gte: start, lte: end } },
    });
  }

  /** Récupérer les derniers inscrits */
  async getRecentUsers(limit = 5): Promise<UserPublic[]> {
    return prisma.utilisateur.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: USER_PUBLIC_SELECT,
    });
  }

  /** Récupérer les utilisateurs inactifs (jamais connectés ou > X jours) */
  async getInactiveUsers(daysSinceLogin = 90): Promise<UserPublic[]> {
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
    });
  }
}

// ============================================
// SINGLETON
// ============================================

export const authRepository = new AuthRepository();