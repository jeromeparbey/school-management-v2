// frontend2/src/types/utilisateur.types.ts

export type RoleUtilisateur =
  | 'DIRECTEUR'
  | 'SECRETAIRE'
  | 'ENSEIGNANT'
  | 'SURVEILLANT'
  | 'PARENT'
  | 'ELEVE'
  | 'ADMIN'
  | 'BIBLIOTHECAIRE';

export type Sexe = 'M' | 'F' | 'MASCULIN' | 'FEMININ' | 'AUTRE';

export type TypeContrat = 'CDI' | 'CDD' | 'VACATAIRE' | 'STAGIAIRE' | 'BENEVOLE';

export type GroupeSanguin = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

// ──────────────────────────────────────────
// MODÈLE UTILISATEUR (retourné par l'API)
// ──────────────────────────────────────────

export interface Utilisateur {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: RoleUtilisateur;
  telephone: string | null;
  photoProfil: string | null;
  estActif: boolean;
  emailVerifie: boolean;
  derniereConnexion: string | null;
  createdAt: string;
  updatedAt: string;

  // Profils métier (optionnels selon rôle)
  eleve?: EleveProfil | null;
  enseignant?: EnseignantProfil | null;
  surveillant?: SurveillantProfil | null;
  parent?: ParentProfil | null;
  admin?: AdminProfil | null;
  directeur?: DirecteurProfil | null;
}

export interface EleveProfil {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: string;
  dateNaissance: string;
  lieuNaissance: string | null;
  nationalite: string | null;
  adresse: string | null;
  telephone: string | null;
  email: string | null;
  photo: string | null;
  groupeSanguin: string | null;
  allergies: string | null;
  infoMedicale: string | null;
  statut: string;
}

export interface EnseignantProfil {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: string;
  dateNaissance: string;
  telephone: string;
  email: string | null;
  adresse: string | null;
  photo: string | null;
  dateEmbauche: string;
  typeContrat: string;
  qualification: string | null;
  specialite: string | null;
  salaireBase: number;
  estActif: boolean;
}

export interface SurveillantProfil {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: string;
  dateNaissance: string | null;
  telephone: string;
  email: string | null;
  adresse: string | null;
  photo: string | null;
  dateEmbauche: string;
  typeContrat: string;
  zoneSurveillance: string | null;
  estActif: boolean;
}

export interface ParentProfil {
  id: string;
  profession: string | null;
  adresse: string | null;
  telephoneSecondaire: string | null;
}

export interface AdminProfil {
  id: string;
  niveau: string;
  estActif: boolean;
}

export interface DirecteurProfil {
  id: string;
  dateNomination: string | null;
  signature: string | null;
}

// ──────────────────────────────────────────
// PAYLOADS (entrée API)
// ──────────────────────────────────────────

export interface CreateUtilisateurPayload {
  email: string;
  motDePasse: string;
  prenom: string;
  nom: string;
  role: RoleUtilisateur;
  telephone?: string | null;
  photoProfil?: string | null;

  // Profil métier
  sexe?: Sexe;
  dateNaissance?: string;
  adresse?: string | null;

  // Élève
  lieuNaissance?: string | null;
  nationalite?: string | null;
  groupeSanguin?: GroupeSanguin | null;
  allergies?: string | null;
  infoMedicale?: string | null;

  // Enseignant / Surveillant
  dateEmbauche?: string;
  typeContrat?: TypeContrat;
  qualification?: string | null;
  specialite?: string | null;
  salaireBase?: number;
  infosBancaires?: Record<string, unknown> | null;
  zoneSurveillance?: string | null;
}

export interface UpdateUtilisateurPayload {
  email?: string;
  prenom?: string;
  nom?: string;
  telephone?: string | null;
  photoProfil?: string | null;
  role?: RoleUtilisateur;
  estActif?: boolean;

  sexe?: Sexe;
  dateNaissance?: string;
  adresse?: string | null;

  lieuNaissance?: string | null;
  nationalite?: string | null;
  groupeSanguin?: GroupeSanguin | null;
  allergies?: string | null;
  infoMedicale?: string | null;

  typeContrat?: TypeContrat;
  qualification?: string | null;
  specialite?: string | null;
  salaireBase?: number;
  infosBancaires?: Record<string, unknown> | null;
  zoneSurveillance?: string | null;
}

export interface ListUtilisateursParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: RoleUtilisateur;
  estActif?: boolean;
  sortBy?: 'nom' | 'email' | 'role' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListUtilisateursResult {
  items: Utilisateur[];
  pagination: Pagination;
}

export interface ToggleUtilisateurPayload {
  estActif: boolean;
}

export interface ChangePasswordUtilisateurPayload {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}

export interface ResetPasswordUtilisateurPayload {
  nouveauMotDePasse: string;
}

export interface DeleteResult {
  id: string;
  deleted: boolean;
  mode: 'soft' | 'hard';
}