// frontend2/src/types/anneeScolaire.types.ts

export interface AnneeScolaire {
  id: string;
  nom: string;
  dateDebut: string;
  dateFin: string;
  estActive: boolean;
  estArchive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { classes: number; periodes: number };
}

export interface CreateAnneeScolairePayload {
  nom: string;
  dateDebut: string;
  dateFin: string;
  estActive?: boolean;
}

export interface UpdateAnneeScolairePayload {
  nom?: string;
  dateDebut?: string;
  dateFin?: string;
  estActive?: boolean;
  estArchive?: boolean;
}

export interface ListAnneesScolairesParams {
  page?: number;
  limit?: number;
  search?: string;
  estActive?: boolean;
  estArchive?: boolean;
  sortBy?: 'nom' | 'dateDebut' | 'dateFin' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ListAnneesScolairesResult {
  data: AnneeScolaire[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AnneesScolairesListResult {
  annees: AnneeScolaire[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}