// backend/src/modules/enseignant/enseignant.service.ts

import { getTenantClient } from '../../config/tenant-db';
import { AppError } from '../../utils/AppError';
import { compteService } from '../compte/compte.service';
import type {
  CreateEnseignantInput,
  UpdateEnseignantInput,
  ListEnseignantsQuery,
} from './enseignant.validation';

export interface EnseignantContext {
  schemaName: string;
  etablissementId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError(`Client tenant introuvable`, 500);
  return client;
}

// ──────────────────────────────────────────
// MATRICULE
// ──────────────────────────────────────────

async function generateMatricule(client: any): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `ENS-${year}-`;
  const last = await client.enseignant.findFirst({
    where: { matricule: { startsWith: pattern } },
    orderBy: { matricule: 'desc' },
    select: { matricule: true },
  });
  let next = 1;
  if (last?.matricule) {
    const parts = last.matricule.split('-');
    next = parseInt(parts[parts.length - 1], 10) + 1;
  }
  return `${pattern}${String(next).padStart(4, '0')}`;
}

// ──────────────────────────────────────────
// INCLUDES PARTAGÉS
// ──────────────────────────────────────────

/**
 * Include de base : utilisé par findAll, findById, create, update.
 * Contient utilisateur + tous les compteurs.
 */
const enseignantInclude = {
  utilisateur: {
    select: {
      id: true,
      email: true,
      emailVerifie: true,
      estActif: true,
      derniereConnexion: true,
    },
  },
  _count: {
    select: {
      // Existants
      affectations: true,
      emploisTemps: true,
      notes: true,
      absences: true,
      heuresSupp: true,
      paies: true,
      // 🆕 ajoutés
      presences: true,
      avances: true,
      reclamations: true,
      historiquesSalaire: true,
      groupesTD: true,
      documents: true,
      communications: true,
    },
  },
} as const;

// ──────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────

export class EnseignantService {
  // ──────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────

  async create(ctx: EnseignantContext, input: CreateEnseignantInput) {
    const client = await getClient(ctx.schemaName);

    // 1. Générer le matricule
    const matricule = await generateMatricule(client);

    // 2. Créer ou lier l'utilisateur
    const compteResult = await compteService.createOrLinkUser(ctx, {
      email: input.email,
      motDePasse: input.motDePasse,
      prenom: input.prenom,
      nom: input.nom,
      role: 'ENSEIGNANT',
      telephone: input.telephone,
      photoProfil: input.photo,
      matricule,
      hasProfilCheck: (u) => !!u.enseignant,
    });

    // 3. Créer le profil enseignant
    try {
      const enseignant = await client.enseignant.create({
        data: {
          matricule,
          prenom: input.prenom.trim(),
          nom: input.nom.trim(),
          sexe: input.sexe,
          dateNaissance: input.dateNaissance,
          telephone: input.telephone.trim(),
          email: compteResult.email,
          adresse: input.adresse ?? null,
          photo: input.photo ?? null,
          dateEmbauche: input.dateEmbauche,
          typeContrat: input.typeContrat.trim(),
          qualification: input.qualification ?? null,
          specialite: input.specialite ?? null,
          salaireBase: input.salaireBase,
          infosBancaires: input.infosBancaires ?? undefined,
          estActif: input.estActif ?? true,
          utilisateurId: compteResult.utilisateurId,
        },
        include: enseignantInclude,
      });

      return {
        ...enseignant,
        // ℹ️ Info utile pour l'admin : faut-il communiquer le mot de passe ?
        motDePasseTemporaire:
          compteResult.created && !input.motDePasse
            ? '⚠️ Mot de passe généré — communiquez-le manuellement'
            : null,
      };
    } catch (err: any) {
      // Rollback : si le profil échoue, supprimer l'utilisateur créé
      if (compteResult.created && compteResult.utilisateurId) {
        await compteService.deleteLinkedUser(ctx, compteResult.utilisateurId);
      }
      if (err?.code === 'P2002') {
        throw new AppError(
          err.meta?.target?.includes('email')
            ? 'Cet email est déjà utilisé'
            : 'Ce matricule existe déjà',
          409
        );
      }
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // LIST
  // ──────────────────────────────────────────

  async findAll(ctx: EnseignantContext, q: ListEnseignantsQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};

    // Recherche
    if (q.search) {
      where.OR = [
        { nom: { contains: q.search, mode: 'insensitive' } },
        { prenom: { contains: q.search, mode: 'insensitive' } },
        { matricule: { contains: q.search, mode: 'insensitive' } },
        { email: { contains: q.search, mode: 'insensitive' } },
        { telephone: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    // Filtres
    if (q.estActif !== undefined) where.estActif = q.estActif;
    if (q.estArchive !== undefined) where.estArchive = q.estArchive;
    if (q.typeContrat) where.typeContrat = q.typeContrat;
    if (q.hasCompte === true) where.utilisateurId = { not: null };
    if (q.hasCompte === false) where.utilisateurId = null;

    // Tri sécurisé
    const allowedSort = [
      'nom',
      'prenom',
      'matricule',
      'dateEmbauche',
      'createdAt',
    ];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'createdAt';
    const sortOrder = q.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      client.enseignant.count({ where }),
      client.enseignant.findMany({
        where,
        include: enseignantInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);

    return {
      data,
      pagination: {
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit) || 1,
      },
    };
  }

  // ──────────────────────────────────────────
  // GET BY ID (détail complet)
  // ──────────────────────────────────────────

  async findById(ctx: EnseignantContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const enseignant = await client.enseignant.findUnique({
      where: { id },
      include: {
        // ✅ Tout ce qui est dans enseignantInclude
        ...enseignantInclude,
        // ✅ Utilisateur détaillé
        utilisateur: {
          select: {
            id: true,
            email: true,
            emailVerifie: true,
            estActif: true,
            derniereConnexion: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        // ✅ Affectations détaillées (avec classe et matière)
        affectations: {
          include: {
            classe: { select: { id: true, nom: true, code: true } },
            matiere: { select: { id: true, nom: true, code: true } },
            anneeScolaire: { select: { id: true, nom: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        // ✅ Emploi du temps
        emploisTemps: {
          include: {
            classe: { select: { id: true, nom: true, code: true } },
            matiere: { select: { id: true, nom: true, code: true } },
          },
          orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
          take: 20,
        },
        // ✅ 5 dernières absences
        absences: {
          take: 5,
          orderBy: { dateDebut: 'desc' },
        },
        // ✅ 5 dernières heures supp
        heuresSupp: {
          take: 5,
          orderBy: { date: 'desc' },
        },
        // ✅ 5 dernières avances
        avances: {
          take: 5,
          orderBy: { dateDemandee: 'desc' },
        },
        // ✅ 5 dernières réclamations
        reclamations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        // ✅ 5 dernières paies
        paies: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            periode: { select: { id: true, nom: true } },
          },
        },
        // ✅ 5 derniers historiques salaire
        historiquesSalaire: {
          take: 5,
          orderBy: { dateEffet: 'desc' },
        },
        // ✅ 5 derniers groupes TD
        groupesTD: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        // ✅ 5 derniers documents
        documents: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!enseignant) throw new AppError('Enseignant introuvable', 404);
    return enseignant;
  }

  // ──────────────────────────────────────────
  // UPDATE
  // ──────────────────────────────────────────

  async update(
    ctx: EnseignantContext,
    id: string,
    input: UpdateEnseignantInput
  ) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.enseignant.findUnique({
      where: { id },
      select: {
        id: true,
        utilisateurId: true,
        matricule: true,
        email: true,
      },
    });
    if (!existing) throw new AppError('Enseignant introuvable', 404);

    // Cas particulier : création de compte a posteriori
    let utilisateurId = existing.utilisateurId;

    if (!utilisateurId && input.createCompte) {
      if (!input.email) {
        throw new AppError(
          'Email requis pour créer un compte utilisateur',
          400
        );
      }

      const compteResult = await compteService.createOrLinkUser(ctx, {
        email: input.email,
        motDePasse: input.motDePasse,
        prenom: input.prenom ?? '',
        nom: input.nom ?? '',
        role: 'ENSEIGNANT',
        telephone: input.telephone,
        photoProfil: input.photo,
        matricule: existing.matricule,
        hasProfilCheck: (u) => !!u.enseignant,
      });

      utilisateurId = compteResult.utilisateurId;
    }

    // Mettre à jour l'utilisateur lié
    if (utilisateurId) {
      await compteService.updateLinkedUser(ctx, utilisateurId, {
        email: input.email,
        motDePasse: input.motDePasse,
        prenom: input.prenom,
        nom: input.nom,
        telephone: input.telephone,
        photoProfil: input.photo,
        estActif: input.estActif,
      });
    }

    // Mettre à jour le profil enseignant
    const patch: any = {};
    if (input.prenom !== undefined) patch.prenom = input.prenom.trim();
    if (input.nom !== undefined) patch.nom = input.nom.trim();
    if (input.sexe !== undefined) patch.sexe = input.sexe;
    if (input.dateNaissance !== undefined)
      patch.dateNaissance = input.dateNaissance;
    if (input.telephone !== undefined)
      patch.telephone = input.telephone.trim();
    if (input.email !== undefined)
      patch.email = input.email?.toLowerCase().trim() ?? null;
    if (input.adresse !== undefined) patch.adresse = input.adresse;
    if (input.photo !== undefined) patch.photo = input.photo;
    if (input.dateEmbauche !== undefined)
      patch.dateEmbauche = input.dateEmbauche;
    if (input.typeContrat !== undefined)
      patch.typeContrat = input.typeContrat.trim();
    if (input.qualification !== undefined)
      patch.qualification = input.qualification;
    if (input.specialite !== undefined) patch.specialite = input.specialite;
    if (input.salaireBase !== undefined) patch.salaireBase = input.salaireBase;
    if (input.infosBancaires !== undefined)
      patch.infosBancaires = input.infosBancaires;
    if (input.estActif !== undefined) patch.estActif = input.estActif;
    if (input.estArchive !== undefined) patch.estArchive = input.estArchive;
    if (utilisateurId && utilisateurId !== existing.utilisateurId) {
      patch.utilisateurId = utilisateurId;
    }

    try {
      const updated = await client.enseignant.update({
        where: { id },
        data: patch,
        include: enseignantInclude,
      });
      return updated;
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError(
          err.meta?.target?.includes('email')
            ? 'Cet email est déjà utilisé'
            : 'Conflit de contrainte unique',
          409
        );
      }
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // SOFT DELETE (archive)
  // ──────────────────────────────────────────

  async softDelete(ctx: EnseignantContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.enseignant.findUnique({
      where: { id },
      select: { id: true, utilisateurId: true, estArchive: true },
    });
    if (!existing) throw new AppError('Enseignant introuvable', 404);

    if (existing.estArchive) {
      return { id, message: 'Enseignant déjà archivé' };
    }

    // Archiver le profil
    await client.enseignant.update({
      where: { id },
      data: { estActif: false, estArchive: true },
    });

    // Désactiver l'utilisateur lié
    if (existing.utilisateurId) {
      await client.utilisateur.update({
        where: { id: existing.utilisateurId },
        data: { estActif: false, jetonActualisation: null },
      });
    }

    return { id, message: 'Enseignant archivé et compte désactivé' };
  }

  // ──────────────────────────────────────────
  // HARD DELETE
  // ──────────────────────────────────────────

  async hardDelete(ctx: EnseignantContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.enseignant.findUnique({
      where: { id },
      select: { id: true, utilisateurId: true, matricule: true },
    });
    if (!existing) throw new AppError('Enseignant introuvable', 404);

    // Vérifications étendues (10 dépendances)
    const [
      nbAffectations,
      nbNotes,
      nbAbsences,
      nbPaies,
      nbHeuresSupp,
      nbAvances,
      nbReclamations,
      nbGroupesTD,
      nbDocuments,
      nbHistoriquesSalaire,
    ] = await Promise.all([
      client.affectationEnseignant.count({ where: { enseignantId: id } }),
      client.note.count({ where: { enseignantId: id } }),
      client.absence.count({ where: { enseignantId: id } }),
      client.paie.count({ where: { enseignantId: id } }),
      client.heureSupp.count({ where: { enseignantId: id } }),
      client.avance.count({ where: { enseignantId: id } }),
      client.reclamation.count({ where: { enseignantId: id } }),
      client.groupeTD.count({ where: { enseignantId: id } }),
      client.document.count({ where: { enseignantId: id } }),
      client.historiqueSalaire.count({ where: { enseignantId: id } }),
    ]);

    const total =
      nbAffectations +
      nbNotes +
      nbAbsences +
      nbPaies +
      nbHeuresSupp +
      nbAvances +
      nbReclamations +
      nbGroupesTD +
      nbDocuments +
      nbHistoriquesSalaire;

    if (total > 0) {
      throw new AppError(
        `Suppression impossible : référencé par ` +
          `${nbAffectations} affectation(s), ${nbNotes} note(s), ` +
          `${nbAbsences} absence(s), ${nbPaies} paie(s), ` +
          `${nbHeuresSupp} heure(s) supp., ${nbAvances} avance(s), ` +
          `${nbReclamations} réclamation(s), ${nbGroupesTD} groupe(s) TD, ` +
          `${nbDocuments} document(s), ${nbHistoriquesSalaire} historique(s) salaire. ` +
          `Archivez l'enseignant à la place.`,
        409
      );
    }

    // Supprimer le profil
    const utilisateurId = existing.utilisateurId;

    await client.enseignant.delete({ where: { id } });

    // Supprimer l'utilisateur lié
    if (utilisateurId) {
      await compteService.deleteLinkedUser(ctx, utilisateurId);
    }

    return {
      id,
      message: 'Enseignant et compte supprimés définitivement',
    };
  }
}

export const enseignantService = new EnseignantService();