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
// HELPERS EMPLOI DU TEMPS
// ──────────────────────────────────────────

const JOURS_ORDER: Record<string, number> = {
  LUNDI: 1,
  MARDI: 2,
  MERCREDI: 3,
  JEUDI: 4,
  VENDREDI: 5,
  SAMEDI: 6,
  DIMANCHE: 7,
};

const JOURS_JS_TO_KEY = [
  'DIMANCHE', // 0
  'LUNDI',
  'MARDI',
  'MERCREDI',
  'JEUDI',
  'VENDREDI',
  'SAMEDI',
];

const parseTime = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10));
  return (h ?? 0) * 60 + (m ?? 0);
};

interface CoursCalcule {
  id: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
  statut: 'EN_COURS' | 'PROCHAIN' | 'TERMINE' | 'A_VENIR';
  minutesRestantes?: number;
  minutesAvant?: number;
  minutesAvantGlobal?: number;
}

/**
 * Enrichit l'emploi du temps avec des statuts calculés :
 * EN_COURS, PROCHAIN, TERMINE, A_VENIR
 */
function enrichirEmploiTemps(
  emploisTemps: any[],
  now: Date
): {
  enrichis: CoursCalcule[];
  coursEnCours: CoursCalcule | null;
  prochainCours: CoursCalcule | null;
  dernierCoursTermine: CoursCalcule | null;
} {
  if (!emploisTemps || emploisTemps.length === 0) {
    return {
      enrichis: [],
      coursEnCours: null,
      prochainCours: null,
      dernierCoursTermine: null,
    };
  }

  const jourActuel = JOURS_JS_TO_KEY[now.getDay()];
  const minutesActuelles = now.getHours() * 60 + now.getMinutes();
  const coursActifs = emploisTemps.filter((e) => e.estActive !== false);

  const enrichis: CoursCalcule[] = coursActifs.map((e) => {
    const debut = parseTime(e.heureDebut);
    const fin = parseTime(e.heureFin);
    let statut: CoursCalcule['statut'] = 'A_VENIR';
    let minutesRestantes: number | undefined;
    let minutesAvant: number | undefined;
    let minutesAvantGlobal: number | undefined;

    if (e.jour === jourActuel) {
      if (minutesActuelles >= debut && minutesActuelles < fin) {
        statut = 'EN_COURS';
        minutesRestantes = fin - minutesActuelles;
      } else if (minutesActuelles < debut) {
        statut = 'A_VENIR';
        minutesAvant = debut - minutesActuelles;
      } else {
        statut = 'TERMINE';
      }
    } else {
      const jourCours = JOURS_ORDER[e.jour] ?? 7;
      const jourNow = JOURS_ORDER[jourActuel] ?? 7;
      let diffJours = jourCours - jourNow;
      if (diffJours <= 0) diffJours += 7;
      minutesAvantGlobal = diffJours * 24 * 60 + debut - minutesActuelles;
    }

    return {
      id: e.id,
      jour: e.jour,
      heureDebut: e.heureDebut,
      heureFin: e.heureFin,
      statut,
      minutesRestantes,
      minutesAvant,
      minutesAvantGlobal,
    };
  });

  const coursEnCours = enrichis.find((c) => c.statut === 'EN_COURS') ?? null;

  // Prochain cours
  const candidatsProchains = enrichis
    .filter((c) => c.statut === 'A_VENIR' || c.statut === 'EN_COURS')
    .map((c) => {
      const debut = parseTime(c.heureDebut);
      let minutesDepuisNow: number;
      if (c.jour === jourActuel && c.statut !== 'EN_COURS') {
        minutesDepuisNow = debut - minutesActuelles;
      } else if (c.statut === 'EN_COURS') {
        minutesDepuisNow = 0;
      } else {
        minutesDepuisNow = c.minutesAvantGlobal ?? Number.MAX_SAFE_INTEGER;
      }
      return { cours: c, minutesDepuisNow };
    })
    .sort((a, b) => a.minutesDepuisNow - b.minutesDepuisNow);

  const prochainCours =
    coursEnCours ?? (candidatsProchains[0]?.cours ?? null);

  // Dernier cours terminé aujourd'hui
  const dernierCoursTermine =
    enrichis
      .filter((c) => c.jour === jourActuel && c.statut === 'TERMINE')
      .sort((a, b) => parseTime(b.heureFin) - parseTime(a.heureFin))[0] ?? null;

  return { enrichis, coursEnCours, prochainCours, dernierCoursTermine };
}

// ──────────────────────────────────────────
// INCLUDES PARTAGÉS
// ──────────────────────────────────────────

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
      affectations: true,
      emploisTemps: true,
      notes: true,
      absences: true,
      heuresSupp: true,
      paies: true,
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
  // CREATE (inchangé)
  // ──────────────────────────────────────────

  async create(ctx: EnseignantContext, input: CreateEnseignantInput) {
    const client = await getClient(ctx.schemaName);

    const matricule = await generateMatricule(client);

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
        motDePasseTemporaire:
          compteResult.created && !input.motDePasse
            ? '⚠️ Mot de passe généré — communiquez-le manuellement'
            : null,
      };
    } catch (err: any) {
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
  // LIST (inchangé)
  // ──────────────────────────────────────────

  async findAll(ctx: EnseignantContext, q: ListEnseignantsQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};

    if (q.search) {
      where.OR = [
        { nom: { contains: q.search, mode: 'insensitive' } },
        { prenom: { contains: q.search, mode: 'insensitive' } },
        { matricule: { contains: q.search, mode: 'insensitive' } },
        { email: { contains: q.search, mode: 'insensitive' } },
        { telephone: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    if (q.estActif !== undefined) where.estActif = q.estActif;
    if (q.estArchive !== undefined) where.estArchive = q.estArchive;
    if (q.typeContrat) where.typeContrat = q.typeContrat;
    if (q.hasCompte === true) where.utilisateurId = { not: null };
    if (q.hasCompte === false) where.utilisateurId = null;

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
  // GET BY ID — VUE COMPLÈTE (emploi du temps, cours, paie, présence)
  // ──────────────────────────────────────────

  async findById(ctx: EnseignantContext, id: string) {
    const client = await getClient(ctx.schemaName);
    const now = new Date();

    // 1. Charger l'enseignant avec TOUTES les relations
    const enseignant = await client.enseignant.findUnique({
      where: { id },
      include: {
        ...enseignantInclude,

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

        // Affectations (classes + matières)
        affectations: {
          include: {
            classe: {
              select: { id: true, nom: true, code: true, salle: true },
            },
            matiere: { select: { id: true, nom: true, code: true } },
            anneeScolaire: {
              select: { id: true, nom: true, estActive: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },

        // Emploi du temps complet
        emploisTemps: {
          where: { estActive: true },
          include: {
            classe: { select: { id: true, nom: true, code: true } },
            matiere: { select: { id: true, nom: true, code: true } },
          },
          orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
        },

        // Absences (5 dernières)
        absences: {
          take: 5,
          orderBy: { dateDebut: 'desc' },
        },

        // Heures supp (5 dernières)
        heuresSupp: {
          take: 5,
          orderBy: { date: 'desc' },
        },

        // Avances (5 dernières)
        avances: {
          take: 5,
          orderBy: { dateDemandee: 'desc' },
        },

        // Réclamations (5 dernières)
        reclamations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },

        // 🆕 Paies (10 dernières pour historique + analyse)
        paies: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            periode: { select: { id: true, nom: true } },
            approbateur: { select: { id: true, prenom: true, nom: true } },
          },
        },

        // Historique salaire
        historiquesSalaire: {
          take: 5,
          orderBy: { dateEffet: 'desc' },
        },

        // Groupes TD
        groupesTD: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },

        // Documents
        documents: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },

        // 🆕 Présences (10 dernières) pour calcul taux
        presences: {
          take: 30,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!enseignant) throw new AppError('Enseignant introuvable', 404);

    // 2. Enrichir l'emploi du temps avec les statuts calculés
    const { enrichis, coursEnCours, prochainCours, dernierCoursTermine } =
      enrichirEmploiTemps((enseignant as any).emploisTemps ?? [], now);

    const emploisTempsEnrichis = ((enseignant as any).emploisTemps ?? []).map(
      (e: any) => {
        const calc = enrichis.find((c) => c.id === e.id);
        return {
          ...e,
          _statut: calc?.statut ?? 'A_VENIR',
          _minutesRestantes: calc?.minutesRestantes,
          _minutesAvant: calc?.minutesAvant,
        };
      }
    );

    // 3. Statistiques heures supp
    const heuresSupp = (enseignant as any).heuresSupp ?? [];
    const totalHeuresSupp = heuresSupp
      .filter((h: any) => h.statut === 'APPROUVEE')
      .reduce((s: number, h: any) => s + (h.heures ?? 0), 0);
    const heuresSuppEnAttente = heuresSupp
      .filter(
        (h: any) => h.statut === 'BROUILLON' || h.statut === 'SOUMISE'
      )
      .reduce((s: number, h: any) => s + (h.heures ?? 0), 0);

    // 4. Statistiques présence (30 derniers jours)
    const presences = (enseignant as any).presences ?? [];
    const presencesPresentes = presences.filter(
      (p: any) => p.statut === 'PRESENT'
    ).length;
    const presencesRetard = presences.filter(
      (p: any) => p.statut === 'RETARD'
    ).length;
    const presencesAbsent = presences.filter(
      (p: any) => p.statut === 'ABSENT'
    ).length;
    const tauxPresence =
      presences.length > 0
        ? Math.round((presencesPresentes / presences.length) * 100)
        : 100;

    // 5. Analyse des paies
    const paies = (enseignant as any).paies ?? [];

    // Dernière paie
    const dernierePaie = paies[0] ?? null;

    // Paie en cours (BROUILLON / CALCULEE / APPROUVEE mais pas encore PAYEE)
    const paieEnCours =
      paies.find((p: any) =>
        ['BROUILLON', 'CALCULEE', 'APPROUVEE'].includes(p.statut)
      ) ?? null;

    // Cumul sur l'année
    const paiesPayees = paies.filter((p: any) => p.statut === 'PAYEE');
    const totalPaieAnne = paiesPayees.reduce(
      (s: number, p: any) => s + (p.totalNet ?? 0),
      0
    );
    const nombreMoisPayes = paiesPayees.length;

    // 6. Résumé salaire (dernière paie ou prévisionnelle)
    let resumeSalaire: any = null;
    if (dernierePaie) {
      const primes = dernierePaie.primes ?? {};
      const retenues = dernierePaie.retenues ?? {};
      const totalPrimes = Object.values(primes).reduce(
        (s: number, v: any) => s + (Number(v) || 0),
        0
      );
      const totalRetenues = Object.values(retenues).reduce(
        (s: number, v: any) => s + (Number(v) || 0),
        0
      );

      resumeSalaire = {
        salaireBase: dernierePaie.salaireBase,
        heuresSupp: dernierePaie.heuresSupp,
        montantHeuresSupp: dernierePaie.montantHeuresSupp,
        primes: totalPrimes,
        retenues: totalRetenues,
        avances: dernierePaie.avances,
        totalBrut: dernierePaie.totalBrut,
        totalNet: dernierePaie.totalNet,
        statut: dernierePaie.statut,
        periode: dernierePaie.periode,
        payeLe: dernierePaie.payeLe,
      };
    } else {
      // Pas encore de paie → prévisionnel basé sur salaireBase
      resumeSalaire = {
        salaireBase: enseignant.salaireBase,
        heuresSupp: 0,
        montantHeuresSupp: 0,
        primes: 0,
        retenues: 0,
        avances: 0,
        totalBrut: enseignant.salaireBase,
        totalNet: enseignant.salaireBase,
        statut: 'PREVISIONNEL',
        periode: null,
        payeLe: null,
      };
    }

    // 7. Calcul heures hebdomadaires (emploi du temps)
    const heuresHebdo = ((enseignant as any).emploisTemps ?? [])
      .filter((e: any) => e.estActive !== false)
      .reduce((sum: number, e: any) => {
        return sum + (parseTime(e.heureFin) - parseTime(e.heureDebut));
      }, 0);

    // 8. Retour enrichi
    return {
      ...enseignant,
      emploisTemps: emploisTempsEnrichis,

      // 🆕 Cours en cours / prochain
      coursEnCours,
      prochainCours,
      dernierCoursTermine,

      // 🆕 Statistiques heures
      _statsHeures: {
        heuresSemaine: Math.round(heuresHebdo / 60),
        totalHeuresSupp,
        heuresSuppEnAttente,
      },

      // 🆕 Statistiques présence
      _statsPresence: {
        tauxPresence,
        presencesPresentes,
        presencesRetard,
        presencesAbsent,
        totalJours: presences.length,
      },

      // 🆕 Paie
      dernierePaie,
      paieEnCours,
      resumeSalaire,
      _statsPaie: {
        totalPaieAnne,
        nombreMoisPayes,
        derniereDatePaiement: dernierePaie?.payeLe ?? null,
      },
    };
  }

  // ──────────────────────────────────────────
  // UPDATE (inchangé)
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
      return await client.enseignant.update({
        where: { id },
        data: patch,
        include: enseignantInclude,
      });
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
  // SOFT DELETE
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

    await client.enseignant.update({
      where: { id },
      data: { estActif: false, estArchive: true },
    });

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

    const utilisateurId = existing.utilisateurId;

    await client.enseignant.delete({ where: { id } });

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