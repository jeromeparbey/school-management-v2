// backend/src/modules/auth/auth.repository.ts

import { prisma } from '../../config/db';
import { Prisma, Utilisateur } from '@prisma/client';

export class AuthRepository {
  /**
   * Trouver un utilisateur par email
   */
  async findByEmail(email: string): Promise<Utilisateur | null> {
    return prisma.utilisateur.findUnique({
      where: { email }
    });
  }

  /**
   * Trouver un utilisateur par ID
   */
  async findById(id: string): Promise<Utilisateur | null> {
    return prisma.utilisateur.findUnique({
      where: { id }
    });
  }

  /**
   * Trouver un utilisateur par refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<Utilisateur | null> {
    return prisma.utilisateur.findFirst({
      where: {
        jetonActualisation: refreshToken,
        estActif: true
      }
    });
  }

  /**
   * Créer un nouvel utilisateur
   */
  async create(data: {
    email: string;
    motDePasse: string;
    prenom: string;
    nom: string;
    role: string;
    telephone?: string;
  }): Promise<Utilisateur> {
    return prisma.utilisateur.create({
      data: {
        email: data.email,
        motDePasse: data.motDePasse,
        prenom: data.prenom,
        nom: data.nom,
        role: data.role as any,
        telephone: data.telephone,
        estActif: true,
        emailVerifie: false
      }
    });
  }

  /**
   * Mettre à jour le refresh token d'un utilisateur
   */
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<Utilisateur> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { jetonActualisation: refreshToken }
    });
  }

  /**
   * Mettre à jour la date de dernière connexion
   */
  async updateLastLogin(userId: string): Promise<Utilisateur> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { derniereConnexion: new Date() }
    });
  }

  /**
   * Vérifier l'email d'un utilisateur
   */
  async verifyEmail(userId: string): Promise<Utilisateur> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { emailVerifie: true }
    });
  }

  /**
   * Mettre à jour le mot de passe d'un utilisateur
   */
  async updatePassword(userId: string, newPassword: string): Promise<Utilisateur> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { motDePasse: newPassword }
    });
  }

  /**
   * Obtenir les informations d'un utilisateur (sans mot de passe)
   */
  async getUserInfo(userId: string) {
    return prisma.utilisateur.findUnique({
      where: { id: userId },
      select: {
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
        updatedAt: true
      }
    });
  }

  /**
   * Désactiver un compte utilisateur
   */
  async deactivateAccount(userId: string): Promise<Utilisateur> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { 
        estActif: false,
        jetonActualisation: null
      }
    });
  }

  /**
   * Réactiver un compte utilisateur
   */
  async reactivateAccount(userId: string): Promise<Utilisateur> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: { estActif: true }
    });
  }

  /**
   * Vérifier si un email existe déjà
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await prisma.utilisateur.findUnique({
      where: { email },
      select: { id: true }
    });
    return !!user;
  }

  /**
   * Obtenir tous les utilisateurs (avec pagination)
   */
  async getAllUsers(options?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) {
    const { page = 1, limit = 10, role, search } = options || {};
    const skip = (page - 1) * limit;

    const where: Prisma.UtilisateurWhereInput = {};

    if (role) {
      where.role = role as any;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { nom: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.utilisateur.findMany({
        where,
        skip,
        take: limit,
        select: {
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
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.utilisateur.count({ where })
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Mettre à jour le profil d'un utilisateur
   */
  async updateProfile(userId: string, data: {
    prenom?: string;
    nom?: string;
    telephone?: string;
    photoProfil?: string;
  }): Promise<Utilisateur> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data
    });
  }

  /**
   * Supprimer un utilisateur (soft delete)
   */
  async softDeleteUser(userId: string): Promise<Utilisateur> {
    return prisma.utilisateur.update({
      where: { id: userId },
      data: {
        estActif: false,
        jetonActualisation: null
      }
    });
  }
  /**
   * Supprimer définitivement un utilisateur
   */

  async DeleteUser(userId: string): Promise<Utilisateur> {
    return prisma.utilisateur.delete({
      where: { id: userId }
    });
  } 

}
