// backend/src/modules/emploiTemps/emploiTemps.service.ts

import { getTenantClient } from '../../config/tenant-db.js';
import { AppError } from '../../utils/AppError.js';
import type {
  CreateEmploiTempsInput,
  UpdateEmploiTempsInput,
  CheckConflitsInput,
  ListEmploisTempsQuery,
} from './emploiTemps.validation.js';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface EmploiTempsContext {
  schemaName: string;
  etablissementId: string;
  userId: string;
}

type ConflitType = 'CLASSE' | 'ENSEIGNANT' | 'SALLE';

interface Conflit {
  type: ConflitType;
  message: string;
  slot: any;
}

interface DetectConflitsData {
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

// ═══════════════════════════════════════════════════════════
// CLIENT
// ═══════════════════════════════════════════════════════════

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

// ═══════════════════════════════════════════════════════════
// HELPERS TEMPS
// ═══════════════════════════════════════════════════════════

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function computeDurationHours(debut: string, fin: string): number {
  return (timeToMinutes(fin) - timeToMinutes(debut)) / 60;
}

// ═══════════════════════════════════════════════════════════
// INCLUDES PARTAGÉS (complets)
// ═══════════════════════════════════════════════════════════

/**
 * Include TRÈS enrichi pour les vues détail / semaine.
 * Expose absolument TOUT ce qui peut servir côté frontend :
 * - Classe : id, nom, code, salle, capacité, niveau complet
 * - Enseignant : id, matricule, prénom, nom, spécialité, qualification, email, téléphone, photo
 * - Matière : id, nom, code, coefficient, durée, description
 * - Année scolaire : id, nom, dates, statut
 */
const emploiTempsInclude = {
  classe: {
    select: {
      id: true,
      nom: true,
      code: true,
      salle: true,
      capacite: true,
      estActive: true,
      niveau: {
        select: {
          id: true,
          nom: true,
          code: true,
          ordre: true,
          description: true,
        },
      },
    },
  },
  enseignant: {
    select: {
      id: true,
      matricule: true,
      prenom: true,
      nom: true,
      sexe: true,
      specialite: true,
      qualification: true,
      email: true,
      telephone: true,
      photo: true,
      estActif: true,
    },
  },
  matiere: {
    select: {
      id: true,
      nom: true,
      code: true,
      coefficient: true,
      dureeCours: true,
      description: true,
    },
  },
  anneeScolaire: {
    select: {
      id: true,
      nom: true,
      dateDebut: true,
      dateFin: true,
      estActive: true,
      estArchive: true,
    },
  },
} as const;

// Include léger pour la détection de conflits (rapide)
const conflitInclude = {
  matiere: { select: { nom: true, code: true } },
  classe: { select: { nom: true, code: true } },
  enseignant: { select: { prenom: true, nom: true } },
} as const;

// ═══════════════════════════════════════════════════════════
// DÉTECTION DES CONFLITS
// ═══════════════════════════════════════════════════════════

async function detectConflits(
  client: any,
  data: DetectConflitsData
): Promise<Conflit[]> {
  const endOfTime = new Date('9999-12-31');
  const valableAu = data.valableAu ?? endOfTime;

  const baseWhere: any = {
    jour: data.jour,
    estActive: true,
    valableDu: { lte: valableAu },
    OR: [{ valableAu: null }, { valableAu: { gte: data.valableDu } }],
    heureDebut: { lt: data.heureFin },
    heureFin: { gt: data.heureDebut },
    ...(data.excludeId && { NOT: { id: data.excludeId } }),
  };

  const [conflitsClasse, conflitsEnseignant, conflitsSalle] =
    await Promise.all([
      client.emploiTemps.findMany({
        where: { ...baseWhere, classeId: data.classeId },
        include: conflitInclude,
      }),
      client.emploiTemps.findMany({
        where: { ...baseWhere, enseignantId: data.enseignantId },
        include: conflitInclude,
      }),
      data.salle
        ? client.emploiTemps.findMany({
            where: { ...baseWhere, salle: data.salle },
            include: conflitInclude,
          })
        : Promise.resolve([]),
    ]);

  const conflits: Conflit[] = [];

  for (const c of conflitsClasse) {
    conflits.push({
      type: 'CLASSE',
      message: `La classe ${c.classe.nom} a déjà un cours de ${c.matiere.nom} (${c.heureDebut}-${c.heureFin}) avec ${c.enseignant.prenom} ${c.enseignant.nom}`,
      slot: c,
    });
  }

  for (const c of conflitsEnseignant) {
    conflits.push({
      type: 'ENSEIGNANT',
      message: `L'enseignant a déjà un cours de ${c.matiere.nom} en ${c.classe.nom} (${c.heureDebut}-${c.heureFin})`,
      slot: c,
    });
  }

  for (const c of conflitsSalle) {
    conflits.push({
      type: 'SALLE',
      message: `La salle ${data.salle} est déjà occupée par ${c.classe.nom} — ${c.matiere.nom} (${c.heureDebut}-${c.heureFin})`,
      slot: c,
    });
  }

  return conflits;
}

// ═══════════════════════════════════════════════════════════
// VALIDATION ENTITÉS
// ═══════════════════════════════════════════════════════════

async function validateEntities(
  client: any,
  input: {
    classeId: string;
    enseignantId: string;
    matiereId: string;
  }
): Promise<void> {
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
    throw new AppError(
      "Impossible d'ajouter un créneau à une classe archivée",
      400
    );

  if (!enseignant) throw new AppError('Enseignant introuvable', 404);
  if (enseignant.estArchive)
    throw new AppError("Impossible d'utiliser un enseignant archivé", 400);
  if (!enseignant.estActif)
    throw new AppError("Impossible d'utiliser un enseignant inactif", 400);

  if (!matiere) throw new AppError('Matière introuvable', 404);
  if (matiere.estArchive)
    throw new AppError("Impossible d'utiliser une matière archivée", 400);
}

// ═══════════════════════════════════════════════════════════
// HELPER : enrichir un slot avec durée calculée
// ═══════════════════════════════════════════════════════════

function enrichSlot(slot: any) {
  if (!slot) return slot;
  return {
    ...slot,
    _dureeHeures:
      Math.round(
        computeDurationHours(slot.heureDebut, slot.heureFin) * 10
      ) / 10,
    _effectifClasse: slot.classe?._count?.inscriptions ?? null,
  };
}

// ═══════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════

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

    // 1. Validations temporelles
    if (
      input.valableAu &&
      new Date(input.valableDu) >= new Date(input.valableAu)
    ) {
      throw new AppError(
        'La date "valableAu" doit être après "valableDu"',
        400
      );
    }

    if (timeToMinutes(input.heureDebut) >= timeToMinutes(input.heureFin)) {
      throw new AppError(
        "L'heure de fin doit être après l'heure de début",
        400
      );
    }

    // 2. Validation des entités
    await validateEntities(client, {
      classeId: input.classeId,
      enseignantId: input.enseignantId,
      matiereId: input.matiereId,
    });

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
        `Conflits détectés :\n${conflits
          .map((c) => `- [${c.type}] ${c.message}`)
          .join('\n')}`,
        409
      );
    }

    // 4. Création
    const created = await client.emploiTemps.create({
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

    return enrichSlot(created);
  }

  // ──────────────────────────────────────────
  // LIST (avec toutes les infos)
  // ──────────────────────────────────────────

  async findAll(ctx: EmploiTempsContext, q: ListEmploisTempsQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};

    if (q.search) {
      where.OR = [
        { classe: { nom: { contains: q.search, mode: 'insensitive' } } },
        { classe: { code: { contains: q.search, mode: 'insensitive' } } },
        { enseignant: { nom: { contains: q.search, mode: 'insensitive' } } },
        { enseignant: { prenom: { contains: q.search, mode: 'insensitive' } } },
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
        orderBy: [{ jour: 'asc' }, { [sortBy]: sortOrder }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);

    return {
      data: data.map(enrichSlot),
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
    return enrichSlot(emploi);
  }

  // ──────────────────────────────────────────
  // GET BY CLASSE (vue semaine)
  // ──────────────────────────────────────────

  async findByClasse(
    ctx: EmploiTempsContext,
    classeId: string,
    anneeScolaireId?: string
  ) {
    const client = await getClient(ctx.schemaName);

    const where: any = { classeId, estActive: true };
    if (anneeScolaireId) where.anneeScolaireId = anneeScolaireId;

    const [classe, slots] = await Promise.all([
      client.classe.findUnique({
        where: { id: classeId },
        select: {
          id: true,
          nom: true,
          code: true,
          salle: true,
          capacite: true,
          niveau: { select: { id: true, nom: true, code: true } },
          _count: { select: { inscriptions: true } },
        },
      }),
      client.emploiTemps.findMany({
        where,
        include: emploiTempsInclude,
        orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
      }),
    ]);

    if (!classe) throw new AppError('Classe introuvable', 404);

    const JOURS = [
      'LUNDI',
      'MARDI',
      'MERCREDI',
      'JEUDI',
      'VENDREDI',
      'SAMEDI',
      'DIMANCHE',
    ];
    const parJour: Record<string, any[]> = {};
    for (const jour of JOURS) {
      parJour[jour] = slots
        .filter((s: any) => s.jour === jour)
        .map(enrichSlot);
    }

    const totalHeures = slots.reduce(
      (sum: number, s: any) =>
        sum + computeDurationHours(s.heureDebut, s.heureFin),
      0
    );
    const matieresUniques = [
      ...new Set(slots.map((s: any) => s.matiere?.nom).filter(Boolean)),
    ];
    const enseignantsUniques = [
      ...new Set(
        slots
          .map((s: any) =>
            s.enseignant
              ? `${s.enseignant.prenom} ${s.enseignant.nom}`
              : null
          )
          .filter(Boolean)
      ),
    ];
    const sallesUniques = [
      ...new Set(slots.map((s: any) => s.salle).filter(Boolean)),
    ];

    return {
      classe: {
        ...classe,
        effectif: classe._count?.inscriptions ?? 0,
      },
      slots: slots.map(enrichSlot),
      parJour,
      stats: {
        totalSlots: slots.length,
        totalHeuresHebdo: Math.round(totalHeures * 10) / 10,
        matieres: matieresUniques,
        enseignants: enseignantsUniques,
        salles: sallesUniques,
      },
    };
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

    const [enseignant, slots] = await Promise.all([
      client.enseignant.findUnique({
        where: { id: enseignantId },
        select: {
          id: true,
          matricule: true,
          prenom: true,
          nom: true,
          sexe: true,
          specialite: true,
          qualification: true,
          email: true,
          telephone: true,
          photo: true,
          estActif: true,
        },
      }),
      client.emploiTemps.findMany({
        where,
        include: emploiTempsInclude,
        orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
      }),
    ]);

    if (!enseignant) throw new AppError('Enseignant introuvable', 404);

    const JOURS = [
      'LUNDI',
      'MARDI',
      'MERCREDI',
      'JEUDI',
      'VENDREDI',
      'SAMEDI',
      'DIMANCHE',
    ];
    const parJour: Record<string, any[]> = {};
    for (const jour of JOURS) {
      parJour[jour] = slots
        .filter((s: any) => s.jour === jour)
        .map(enrichSlot);
    }

    const totalHeures = slots.reduce(
      (sum: number, s: any) =>
        sum + computeDurationHours(s.heureDebut, s.heureFin),
      0
    );
    const classesUniques = [
      ...new Set(slots.map((s: any) => s.classe?.nom).filter(Boolean)),
    ];
    const matieresUniques = [
      ...new Set(slots.map((s: any) => s.matiere?.nom).filter(Boolean)),
    ];

    const repartition = JOURS.map((jour) => ({
      jour,
      nbSlots: parJour[jour]?.length ?? 0,
      heures:
        Math.round(
          parJour[jour]?.reduce(
            (sum: number, s: any) =>
              sum + computeDurationHours(s.heureDebut, s.heureFin),
            0
          ) * 10
        ) / 10,
    }));

    return {
      enseignant,
      slots: slots.map(enrichSlot),
      parJour,
      stats: {
        totalSlots: slots.length,
        totalHeuresHebdo: Math.round(totalHeures * 10) / 10,
        classes: classesUniques,
        matieres: matieresUniques,
        repartitionParJour: repartition,
      },
    };
  }

  // ──────────────────────────────────────────
  // GET BY ELEVE (via sa classe)
  // ──────────────────────────────────────────

  async findByEleve(ctx: EmploiTempsContext, eleveId: string) {
    const client = await getClient(ctx.schemaName);

    const inscription = await client.inscription.findFirst({
      where: { eleveId, estActive: true },
      select: { classeId: true, anneeScolaireId: true },
      orderBy: { dateInscription: 'desc' },
    });

    if (!inscription) {
      throw new AppError("L'élève n'a aucune inscription active", 404);
    }

    return this.findByClasse(
      ctx,
      inscription.classeId,
      inscription.anneeScolaireId
    );
  }

  // ──────────────────────────────────────────
  // GET STATS GLOBALES
  // ──────────────────────────────────────────

  async getStats(ctx: EmploiTempsContext, anneeScolaireId?: string) {
    const client = await getClient(ctx.schemaName);

    const where: any = { estActive: true };
    if (anneeScolaireId) where.anneeScolaireId = anneeScolaireId;

    const [total, slots] = await Promise.all([
      client.emploiTemps.count({ where }),
      client.emploiTemps.findMany({
        where,
        select: {
          jour: true,
          heureDebut: true,
          heureFin: true,
          classeId: true,
          enseignantId: true,
          matiereId: true,
          salle: true,
        },
      }),
    ]);

    const classesSet = new Set(slots.map((s: any) => s.classeId));
    const enseignantsSet = new Set(slots.map((s: any) => s.enseignantId));
    const matieresSet = new Set(slots.map((s: any) => s.matiereId));
    const sallesSet = new Set(
      slots.map((s: any) => s.salle).filter(Boolean)
    );

    const totalHeures = slots.reduce(
      (sum: number, s: any) =>
        sum + computeDurationHours(s.heureDebut, s.heureFin),
      0
    );

    const parJour: Record<string, number> = {};
    for (const jour of [
      'LUNDI',
      'MARDI',
      'MERCREDI',
      'JEUDI',
      'VENDREDI',
      'SAMEDI',
      'DIMANCHE',
    ]) {
      parJour[jour] = slots.filter((s: any) => s.jour === jour).length;
    }

    return {
      totalSlots: total,
      totalHeuresHebdo: Math.round(totalHeures * 10) / 10,
      nbClasses: classesSet.size,
      nbEnseignants: enseignantsSet.size,
      nbMatieres: matieresSet.size,
      nbSalles: sallesSet.size,
      salles: Array.from(sallesSet),
      parJour,
    };
  }

  // ──────────────────────────────────────────
  // UPDATE
  // ──────────────────────────────────────────

  async update(
    ctx: EmploiTempsContext,
    id: string,
    input: UpdateEmploiTempsInput
  ) {
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

    if (timeToMinutes(newData.heureDebut) >= timeToMinutes(newData.heureFin)) {
      throw new AppError(
        "L'heure de fin doit être après l'heure de début",
        400
      );
    }

    if (newData.valableAu && newData.valableDu >= newData.valableAu) {
      throw new AppError(
        'La date "valableAu" doit être après "valableDu"',
        400
      );
    }

    if (
      input.classeId !== undefined ||
      input.enseignantId !== undefined ||
      input.matiereId !== undefined
    ) {
      await validateEntities(client, {
        classeId: newData.classeId,
        enseignantId: newData.enseignantId,
        matiereId: newData.matiereId,
      });
    }

    const conflits = await detectConflits(client, {
      ...newData,
      excludeId: id,
    });

    if (conflits.length > 0) {
      throw new AppError(
        `Conflits détectés :\n${conflits
          .map((c) => `- [${c.type}] ${c.message}`)
          .join('\n')}`,
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

    const updated = await client.emploiTemps.update({
      where: { id },
      data: patch,
      include: emploiTempsInclude,
    });

    return enrichSlot(updated);
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

    const updated = await client.emploiTemps.update({
      where: { id },
      data: { estActive: !existing.estActive },
      include: emploiTempsInclude,
    });

    return enrichSlot(updated);
  }

  // ──────────────────────────────────────────
  // DUPLIQUER
  // ──────────────────────────────────────────

  async dupliquer(
    ctx: EmploiTempsContext,
    id: string,
    targetJour?: string
  ) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.emploiTemps.findUnique({ where: { id } });
    if (!existing) throw new AppError('Emploi du temps introuvable', 404);

    const newJour = (targetJour ?? existing.jour) as any;

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
        `Conflits détectés pour le ${newJour} :\n${conflits
          .map((c) => `- [${c.type}] ${c.message}`)
          .join('\n')}`,
        409
      );
    }

    const created = await client.emploiTemps.create({
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

    return enrichSlot(created);
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