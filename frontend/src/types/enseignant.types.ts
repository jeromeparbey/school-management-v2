// frontend2/src/types/enseignant.types.ts

export interface UtilisateurSummary {
  id: string;
  email: string;
  emailVerifie: boolean;
  estActif: boolean;
  derniereConnexion?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Enseignant {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: 'M' | 'F';
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
  infosBancaires?: any;
  estActif: boolean;
  estArchive: boolean;
  utilisateurId: string | null;
  createdAt: string;
  updatedAt: string;
  utilisateur?: UtilisateurSummary;
  _count?: {
    affectations: number;
    emploisTemps: number;
    notes: number;
    absences: number;
    heuresSupp: number;
    paies: number;
  };
  motDePasseTemporaire?: string | null;
}

export interface CreateEnseignantPayload {
  email?: string | null;
  motDePasse?: string | null;

  prenom: string;
  nom: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  telephone: string;
  adresse?: string | null;
  photo?: string | null;
  dateEmbauche: string;
  typeContrat: string;
  qualification?: string | null;
  specialite?: string | null;
  salaireBase: number;
  infosBancaires?: any;
  estActif?: boolean;
}

export interface UpdateEnseignantPayload {
  email?: string | null;
  motDePasse?: string | null;
  createCompte?: boolean;

  prenom?: string;
  nom?: string;
  sexe?: 'M' | 'F';
  dateNaissance?: string;
  telephone?: string;
  adresse?: string | null;
  photo?: string | null;
  dateEmbauche?: string;
  typeContrat?: string;
  qualification?: string | null;
  specialite?: string | null;
  salaireBase?: number;
  infosBancaires?: any;
  estActif?: boolean;
  estArchive?: boolean;
}

export interface ListEnseignantsParams {
  page?: number;
  limit?: number;
  search?: string;
  estActif?: boolean;
  estArchive?: boolean;
  typeContrat?: string;
  hasCompte?: boolean;
  sortBy?: 'nom' | 'prenom' | 'matricule' | 'dateEmbauche' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ListEnseignantsResult {
  data: Enseignant[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface EnseignantsListResult {
  enseignants: Enseignant[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface DeleteEnseignantResult {
  id: string;
  message: string;
}