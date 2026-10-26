// backend/src/modules/emploiTemps/emploiTemps.service.ts

import { getTenantClient } from '../../config/tenant-db';
import { AppError } from '../../utils/AppError';
import type {
  CreateEmploiTempsInput,
  UpdateEmploiTempsInput,
  CheckConflitsInput,
  ListEmploisTempsQuery,
} from './emploiTemps.validation';

export interface EmploiTempsContext {
  schemaName: string;
  etablissementId: string;
  userId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────

/**
 * Détecte les conflits pour un créneau donné.
 * Retourne un tableau de conflits (vide si aucun).
 */
async function detectConflits(
  client: any,
  data: {
    jour: string;
    heureDebut: string;
    heureFin: string;
    classeId: string;
    enseignantId: string;
    salle?: string | null;
    valableDu: Date;
    valableAu?: Date | null;
    excludeId?: string;
  }
): Promise<Array<{ type: string; message: string; slot: any }>> {
  const where: any = {
    jour: data.jour,
    estActive: true,
    // Chevauchement des plages de validité
    valableDu: { lte: data.valableAu ?? new Date('9999-12-31') },
    OR: [
      { valableAu: null },
      { valableAu: { gte: data.valableDu } },
    ],
    // Chevauchement horaire (comparaison string "HH:mm")
    heureDebut: { lt: data.heureFin },
    heureFin: { gt: data.heureDebut },
    // Exclusions
    ...(data.excludeId && { NOT: { id: data.excludeId } }),
    // Conflits potentiels
    OR2: undefined, // (on va gérer séparément pour chaque type)
  };

  // Retirer OR2 (on va faire 3 requêtes)
  delete where.OR2;

  const conflits: Array<{ type: string; message: string; slot: any }> = [];

  // 1. Conflit de CLASSE (une classe ne peut avoir qu'un cours à la fois)
  const conflitsClasse = await client.emploiTemps.findMany({
    where: { ...where, classeId: data.classeId },
    include: {
      matiere: { select: { nom: true, code: true } },
      enseignant: { select: { prenom: true, nom: true } },
      classe: { select: { nom: true, code: true } },
    },
  });

  for (const c of conflitsClasse) {
    conflits.push({
      type: 'CLASSE',
      message: `La classe ${c.classe.nom} a déjà un cours de ${c.matiere.nom} (${c.heureDebut}-${c.heureFin}) avec ${c.enseignant.prenom} ${c.enseignant.nom}`,
      slot: c,
    });
  }

  // 2. Conflit d'ENSEIGNANT
  const conflitsEnseignant = await client.emploiTemps.findMany({
    where: { ...where, enseignantId: data.enseignantId },
    include: {
      matiere: { select: { nom: true, code: true } },
      classe: { select: { nom: true, code: true } },
    },
  });

  for (const c of conflitsEnseignant) {
    conflits.push({
      type: 'ENSEIGNANT',
      message: `L'enseignant a déjà un cours de ${c.matiere.nom} en ${c.classe.nom} (${c.heureDebut}-${c.heureFin})`,
      slot: c,
    });
  }

  // 3. Conflit de SALLE (si fournie)
  if (data.salle) {
    const conflitsSalle = await client.emploiTemps.findMany({
      where: { ...where, salle: data.salle },
      include: {
        matiere: { select: { nom: true, code: true } },
        classe: { select: { nom: true, code: true } },
        enseignant: { select: { prenom: true, nom: true } },
      },
    });

    for (const c of conflitsSalle) {
      conflits.push({
        type: 'SALLE',
        message: `La salle ${data.salle} est déjà occupée par ${c.classe.nom} - ${c.matiere.nom} (${c.heureDebut}-${c.heureFin})`,
        slot: c,
      });
    }
  }

  return conflits;
}

const emploiTempsInclude = {
  classe: {
    select: { id: true, nom: true, code: true, salle: true },
  },
  enseignant: {
    select: {
      id: true,
      matricule: true,
      prenom: true,
      nom: true,
      specialite: true,
      photo: true,
    },
  },
  matiere: {
    select: {
      id: true,
      nom: true,
      code: true,
      coefficient: true,
      dureeCours: true,
    },
  },
  anneeScolaire: {
    select: { id: true, nom: true, estActive: true },
  },
} as const;

// ──────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────

export class EmploiTempsService {
  // ──────────────────────────────────────────
  // CHECK CONFLITS
  // ──────────────────────────────────────────

  async checkConflits(ctx: EmploiTempsContext, input: CheckConflitsInput) {
    const client = await getClient(ctx.schemaName);

    const conflits = await detectConflits(client, {
      jour: input.jour,
      heureDebut: input.heureDebut,
      heureFin: input.heureFin,
      classeId: input.classeId,
      enseignantId: input.enseignantId,
      salle: input.salle,
      valableDu: new Date(input.valableDu),
      valableAu: input.valableAu ? new Date(input.valableAu) : null,
      excludeId: input.excludeId,
    });

    return {
      hasConflits: conflits.length > 0,
      conflits,
    };
  }

  // ──────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────

  async create(ctx: EmploiTempsContext, input: CreateEmploiTempsInput) {
    const client = await getClient(ctx.schemaName);

    // 1. Vérifier les dates
    if (input.valableAu && new Date(input.valableDu) >= new Date(input.valableAu)) {
      throw new AppError(
        'La date "valableAu" doit être après "valableDu"',
        400
      );
    }

    if (input.heureDebut >= input.heureFin) {
      throw new AppError(
        'L\'heure de fin doit être après l\'heure de début',
        400
      );
    }

    // 2. Vérifier les entités
    const [classe, enseignant, matiere] = await Promise.all([
      client.classe.findUnique({
        where: { id: input.classeId },
        select: { id: true, estArchive: true },
      }),
      client.enseignant.findUnique({
        where: { id: input.enseignantId },
        select: { id: true, estActif: true, estArchive: true },
      }),
      client.matiere.findUnique({
        where: { id: input.matiereId },
        select: { id: true, estArchive: true },
      }),
    ]);

    if (!classe) throw new AppError('Classe introuvable', 404);
    if (classe.estArchive)
      throw new AppError('Impossible d\'ajouter un créneau à une classe archivée', 400);

    if (!enseignant) throw new AppError('Enseignant introuvable', 404);
    if (enseignant.estArchive)
      throw new AppError('Impossible d\'utiliser un enseignant archivé', 400);
    if (!enseignant.estActif)
      throw new AppError('Impossible d\'utiliser un enseignant inactif', 400);

    if (!matiere) throw new AppError('Matière introuvable', 404);
    if (matiere.estArchive)
      throw new AppError('Impossible d\'utiliser une matière archivée', 400);

    // 3. Détection de conflits
    const conflits = await detectConflits(client, {
      jour: input.jour,
      heureDebut: input.heureDebut,
      heureFin: input.heureFin,
      classeId: input.classeId,
      enseignantId: input.enseignantId,
      salle: input.salle,
      valableDu: new Date(input.valableDu),
      valableAu: input.valableAu ? new Date(input.valableAu) : null,
    });

    if (conflits.length > 0) {
      throw new AppError(
        `Conflits détectés :\n${conflits.map((c) => `- ${c.message}`).join('\n')}`,
        409
      );
    }

    // 4. Création
    return client.emploiTemps.create({
      data: {
        jour: input.jour,
        heureDebut: input.heureDebut,
        heureFin: input.heureFin,
        classeId: input.classeId,
        enseignantId: input.enseignantId,
        matiereId: input.matiereId,
        salle: input.salle ?? null,
        estRecurrent: input.estRecurrent ?? true,
        valableDu: new Date(input.valableDu),
        valableAu: input.valableAu ? new Date(input.valableAu) : null,
        estActive: input.estActive ?? true,
        creePar: ctx.userId,
        anneeScolaireId: input.anneeScolaireId ?? null,
      },
      include: emploiTempsInclude,
    });
  }

  // ──────────────────────────────────────────
  // LIST
  // ──────────────────────────────────────────

  async findAll(ctx: EmploiTempsContext, q: ListEmploisTempsQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};

    if (q.search) {
      where.OR = [
        { classe: { nom: { contains: q.search, mode: 'insensitive' } } },
        { enseignant: { nom: { contains: q.search, mode: 'insensitive' } } },
        { matiere: { nom: { contains: q.search, mode: 'insensitive' } } },
        { salle: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    if (q.classeId) where.classeId = q.classeId;
    if (q.enseignantId) where.enseignantId = q.enseignantId;
    if (q.matiereId) where.matiereId = q.matiereId;
    if (q.anneeScolaireId) where.anneeScolaireId = q.anneeScolaireId;
    if (q.jour) where.jour = q.jour;
    if (q.estActive !== undefined) where.estActive = q.estActive;

    const allowedSort = ['jour', 'heureDebut', 'createdAt'];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'heureDebut';
    const sortOrder = q.sortOrder === 'desc' ? 'desc' : 'asc';

    const [total, data] = await Promise.all([
      client.emploiTemps.count({ where }),
      client.emploiTemps.findMany({
        where,
        include: emploiTempsInclude,
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
  // GET BY ID
  // ──────────────────────────────────────────

  async findById(ctx: EmploiTempsContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const emploi = await client.emploiTemps.findUnique({
      where: { id },
      include: emploiTempsInclude,
    });

    if (!emploi) throw new AppError('Emploi du temps introuvable', 404);
    return emploi;
  }

  // ──────────────────────────────────────────
  // GET BY CLASSE (vue semaine)
  // ──────────────────────────────────────────

  async findByClasse(ctx: EmploiTempsContext, classeId: string, anneeScolaireId?: string) {
    const client = await getClient(ctx.schemaName);

    const where: any = { classeId, estActive: true };
    if (anneeScolaireId) where.anneeScolaireId = anneeScolaireId;

    const slots = await client.emploiTemps.findMany({
      where,
      include: emploiTempsInclude,
      orderBy: [
        { jour: 'asc' },
        { heureDebut: 'asc' },
      ],
    });

    // Organiser par jour (vue semaine)
    const JOURS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
    const parJour: Record<string, any[]> = {};
    for (const jour of JOURS) {
      parJour[jour] = slots.filter((s: any) => s.jour === jour);
    }

    return { slots, parJour };
  }

  // ──────────────────────────────────────────
  // GET BY ENSEIGNANT (vue semaine)
  // ──────────────────────────────────────────

  async findByEnseignant(
    ctx: EmploiTempsContext,
    enseignantId: string,
    anneeScolaireId?: string
  ) {
    const client = await getClient(ctx.schemaName);

    const where: any = { enseignantId, estActive: true };
    if (anneeScolaireId) where.anneeScolaireId = anneeScolaireId;

    const slots = await client.emploiTemps.findMany({
      where,
      include: emploiTempsInclude,
      orderBy: [
        { jour: 'asc' },
        { heureDebut: 'asc' },
      ],
    });

    const JOURS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
    const parJour: Record<string, any[]> = {};
    for (const jour of JOURS) {
      parJour[jour] = slots.filter((s: any) => s.jour === jour);
    }

    // Stats
    const totalHeures = slots.reduce((sum: number, s: any) => {
      const [h1, m1] = s.heureDebut.split(':').map(Number);
      const [h2, m2] = s.heureFin.split(':').map(Number);
      return sum + (h2 * 60 + m2 - h1 * 60 - m1) / 60;
    }, 0);

    const classesUniques = [...new Set(slots.map((s: any) => s.classe.nom))];

    return {
      slots,
      parJour,
      stats: {
        totalSlots: slots.length,
        totalHeuresHebdo: Math.round(totalHeures * 10) / 10,
        classes: classesUniques,
      },
    };
  }

  // ──────────────────────────────────────────
  // GET BY ELEVE (via sa classe)
  // ──────────────────────────────────────────

  async findByEleve(ctx: EmploiTempsContext, eleveId: string) {
    const client = await getClient(ctx.schemaName);

    // Récupérer la classe active de l'élève
    const inscription = await client.inscription.findFirst({
      where: { eleveId, estActive: true },
      select: { classeId: true, anneeScolaireId: true },
      orderBy: { dateInscription: 'desc' },
    });

    if (!inscription) {
      throw new AppError('L\'élève n\'a aucune inscription active', 404);
    }

    return this.findByClasse(ctx, inscription.classeId, inscription.anneeScolaireId);
  }

  // ──────────────────────────────────────────
  // UPDATE
  // ──────────────────────────────────────────

  async update(ctx: EmploiTempsContext, id: string, input: UpdateEmploiTempsInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.emploiTemps.findUnique({
      where: { id },
      select: {
        id: true,
        jour: true,
        heureDebut: true,
        heureFin: true,
        classeId: true,
        enseignantId: true,
        matiereId: true,
        salle: true,
        valableDu: true,
        valableAu: true,
      },
    });
    if (!existing) throw new AppError('Emploi du temps introuvable', 404);

    // Fusionner pour la vérification de conflits
    const newData = {
      jour: input.jour ?? existing.jour,
      heureDebut: input.heureDebut ?? existing.heureDebut,
      heureFin: input.heureFin ?? existing.heureFin,
      classeId: input.classeId ?? existing.classeId,
      enseignantId: input.enseignantId ?? existing.enseignantId,
      matiereId: input.matiereId ?? existing.matiereId,
      salle: input.salle !== undefined ? input.salle : existing.salle,
      valableDu: input.valableDu
        ? new Date(input.valableDu)
        : existing.valableDu,
      valableAu:
        input.valableAu !== undefined
          ? input.valableAu
            ? new Date(input.valableAu)
            : null
          : existing.valableAu,
    };

    // Validation horaire
    if (newData.heureDebut >= newData.heureFin) {
      throw new AppError(
        'L\'heure de fin doit être après l\'heure de début',
        400
      );
    }

    // Validation dates
    if (
      newData.valableAu &&
      newData.valableDu >= newData.valableAu
    ) {
      throw new AppError(
        'La date "valableAu" doit être après "valableDu"',
        400
      );
    }

    // Détection de conflits (en excluant le slot en cours d'update)
    const conflits = await detectConflits(client, {
      ...newData,
      excludeId: id,
    });

    if (conflits.length > 0) {
      throw new AppError(
        `Conflits détectés :\n${conflits.map((c) => `- ${c.message}`).join('\n')}`,
        409
      );
    }

    const patch: any = {};
    if (input.jour !== undefined) patch.jour = input.jour;
    if (input.heureDebut !== undefined) patch.heureDebut = input.heureDebut;
    if (input.heureFin !== undefined) patch.heureFin = input.heureFin;
    if (input.classeId !== undefined) patch.classeId = input.classeId;
    if (input.enseignantId !== undefined)
      patch.enseignantId = input.enseignantId;
    if (input.matiereId !== undefined) patch.matiereId = input.matiereId;
    if (input.salle !== undefined) patch.salle = input.salle;
    if (input.estRecurrent !== undefined)
      patch.estRecurrent = input.estRecurrent;
    if (input.valableDu !== undefined)
      patch.valableDu = new Date(input.valableDu);
    if (input.valableAu !== undefined)
      patch.valableAu = input.valableAu ? new Date(input.valableAu) : null;
    if (input.estActive !== undefined) patch.estActive = input.estActive;
    if (input.anneeScolaireId !== undefined)
      patch.anneeScolaireId = input.anneeScolaireId;

    return client.emploiTemps.update({
      where: { id },
      data: patch,
      include: emploiTempsInclude,
    });
  }

  // ──────────────────────────────────────────
  // TOGGLE ACTIF
  // ──────────────────────────────────────────

  async toggleActif(ctx: EmploiTempsContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.emploiTemps.findUnique({
      where: { id },
      select: { id: true, estActive: true },
    });
    if (!existing) throw new AppError('Emploi du temps introuvable', 404);

    return client.emploiTemps.update({
      where: { id },
      data: { estActive: !existing.estActive },
      include: emploiTempsInclude,
    });
  }

  // ──────────────────────────────────────────
  // DUPLIQUER
  // ──────────────────────────────────────────

  async dupliquer(ctx: EmploiTempsContext, id: string, targetJour?: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.emploiTemps.findUnique({
      where: { id },
    });
    if (!existing) throw new AppError('Emploi du temps introuvable', 404);

    const newJour = (targetJour ?? existing.jour) as any;

    // Vérifier les conflits pour le nouveau créneau
    const conflits = await detectConflits(client, {
      jour: newJour,
      heureDebut: existing.heureDebut,
      heureFin: existing.heureFin,
      classeId: existing.classeId,
      enseignantId: existing.enseignantId,
      salle: existing.salle,
      valableDu: existing.valableDu,
      valableAu: existing.valableAu,
    });

    if (conflits.length > 0) {
      throw new AppError(
        `Conflits détectés pour le ${newJour} :\n${conflits.map((c) => `- ${c.message}`).join('\n')}`,
        409
      );
    }

    return client.emploiTemps.create({
      data: {
        jour: newJour,
        heureDebut: existing.heureDebut,
        heureFin: existing.heureFin,
        classeId: existing.classeId,
        enseignantId: existing.enseignantId,
        matiereId: existing.matiereId,
        salle: existing.salle,
        estRecurrent: existing.estRecurrent,
        valableDu: existing.valableDu,
        valableAu: existing.valableAu,
        estActive: existing.estActive,
        creePar: ctx.userId,
        anneeScolaireId: existing.anneeScolaireId,
      },
      include: emploiTempsInclude,
    });
  }

  // ──────────────────────────────────────────
  // DELETE
  // ──────────────────────────────────────────

  async softDelete(ctx: EmploiTempsContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.emploiTemps.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new AppError('Emploi du temps introuvable', 404);

    await client.emploiTemps.update({
      where: { id },
      data: { estActive: false },
    });

    return { id, message: 'Créneau désactivé' };
  }

  async hardDelete(ctx: EmploiTempsContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.emploiTemps.findUnique({
      where: { id },
      select: { id: true, jour: true, heureDebut: true, heureFin: true },
    });
    if (!existing) throw new AppError('Emploi du temps introuvable', 404);

    await client.emploiTemps.delete({ where: { id } });
    return {
      id,
      message: `Créneau ${existing.jour} ${existing.heureDebut}-${existing.heureFin} supprimé`,
    };
  }
}

export const emploiTempsService = new EmploiTempsService();