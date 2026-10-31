// backend/src/modules/utilisateur/utilisateur.types.ts

import type { RoleUtilisateur } from '@prisma/client/index.js';

export interface CreateUtilisateurInput {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  role: RoleUtilisateur;
  telephone?: string | null;
  photoProfil?: string | null;
  // Champs profil selon rôle
  sexe?: string | null;
  dateNaissance?: string | null;
  adresse?: string | null;
  // Élève
  lieuNaissance?: string | null;
  nationalite?: string | null;
  groupeSanguin?: string | null;
  allergies?: string | null;
  infoMedicale?: string | null;
  // Enseignant / Surveillant
  dateEmbauche?: string | null;
  typeContrat?: string | null;
  qualification?: string | null;
  specialite?: string | null;
  salaireBase?: number | null;
  infosBancaires?: Record<string, unknown> | null;
  zoneSurveillance?: string | null;
}

export interface UpdateUtilisateurInput {
  prenom?: string;
  nom?: string;
  telephone?: string | null;
  photoProfil?: string | null;
  email?: string;
  role?: RoleUtilisateur;
  estActif?: boolean;
  sexe?: string | null;
  dateNaissance?: string | null;
  adresse?: string | null;
  // Élève
  lieuNaissance?: string | null;
  nationalite?: string | null;
  groupeSanguin?: string | null;
  allergies?: string | null;
  infoMedicale?: string | null;
  // Enseignant
  typeContrat?: string | null;
  qualification?: string | null;
  specialite?: string | null;
  salaireBase?: number | null;
  infosBancaires?: Record<string, unknown> | null;
  // Surveillant
  zoneSurveillance?: string | null;
}

export interface ListUtilisateursQuery {
  page: number;
  limit: number;
  search?: string;
  role?: RoleUtilisateur;
  estActif?: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ChangePasswordInput {
  ancienMotDePasse?: string;  // optionnel si admin reset
  nouveauMotDePasse: string;
}

export interface ResetPasswordAdminInput {
  nouveauMotDePasse: string;
}