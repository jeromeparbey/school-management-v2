// backend/src/modules/affectation/affectation.service.ts

import { getTenantClient } from '../../config/tenant-db';
import { AppError } from '../../utils/AppError';
import type {
  CreateAffectationInput,
  UpdateAffectationInput,
  ListAffectationsQuery,
} from './affectation.validation';

export interface AffectationContext {
  schemaName: string;
  etablissementId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

const affectationInclude = {
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
  classe: {
    select: { id: true, nom: true, code: true, salle: true },
  },
  matiere: {
    select: { id: true, nom: true, code: true, coefficient: true },
  },
  anneeScolaire: {
    select: { id: true, nom: true, estActive: true },
  },
} as const;

export class AffectationService {
  // ──────────────────────────────────────────
  // CREATE
  // ──────────────────────────────────────────

  async create(ctx: AffectationContext, input: CreateAffectationInput) {
    const client = await getClient(ctx.schemaName);

    // Vérifier l'enseignant
    const enseignant = await client.enseignant.findUnique({
      where: { id: input.enseignantId },
      select: { id: true, estActif: true, estArchive: true },
    });
    if (!enseignant) throw new AppError('Enseignant introuvable', 404);
    if (enseignant.estArchive)
      throw new AppError('Impossible d\'affecter un enseignant archivé', 400);
    if (!enseignant.estActif)
      throw new AppError('Impossible d\'affecter un enseignant inactif', 400);

    // Vérifier la classe
    const classe = await client.classe.findUnique({
      where: { id: input.classeId },
      select: { id: true, estArchive: true },
    });
    if (!classe) throw new AppError('Classe introuvable', 404);
    if (classe.estArchive)
      throw new AppError('Impossible d\'affecter une classe archivée', 400);

    // Vérifier la matière
    const matiere = await client.matiere.findUnique({
      where: { id: input.matiereId },
      select: { id: true, estArchive: true },
    });
    if (!matiere) throw new AppError('Matière introuvable', 404);
    if (matiere.estArchive)
      throw new AppError('Impossible d\'affecter une matière archivée', 400);

    // Vérifier l'année
    const annee = await client.anneeScolaire.findUnique({
      where: { id: input.anneeScolaireId },
      select: { id: true, estArchive: true },
    });
    if (!annee) throw new AppError('Année scolaire introuvable', 404);
    if (annee.estArchive)
      throw new AppError('Impossible d\'affecter dans une année archivée', 400);

    // Vérifier les dates
    if (input.valableAu && new Date(input.valableDu) >= new Date(input.valableAu)) {
      throw new AppError(
        'La date "valableAu" doit être après "valableDu"',
        400
      );
    }

    // Vérifier les doublons (unique constraint)
    const dup = await client.affectationEnseignant.findFirst({
      where: {
        enseignantId: input.enseignantId,
        classeId: input.classeId,
        matiereId: input.matiereId,
        anneeScolaireId: input.anneeScolaireId,
      },
      select: { id: true },
    });
    if (dup) {
      throw new AppError(
        'Cet enseignant est déjà affecté à cette classe pour cette matière et cette année',
        409
      );
    }

    try {
      return await client.affectationEnseignant.create({
        data: {
          enseignantId: input.enseignantId,
          classeId: input.classeId,
          matiereId: input.matiereId,
          anneeScolaireId: input.anneeScolaireId,
          heuresHebdo: input.heuresHebdo ?? 0,
          estPrincipal: input.estPrincipal ?? false,
          valableDu: input.valableDu,
          valableAu: input.valableAu ?? null,
          estActive: input.estActive ?? true,
        },
        include: affectationInclude,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError(
          'Cette affectation existe déjà (contrainte unique)',
          409
        );
      }
      if (err?.code === 'P2003') {
        throw new AppError('Référence invalide', 400);
      }
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // LIST
  // ──────────────────────────────────────────

  async findAll(ctx: AffectationContext, q: ListAffectationsQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};

    if (q.search) {
      where.OR = [
        { enseignant: { nom: { contains: q.search, mode: 'insensitive' } } },
        { enseignant: { prenom: { contains: q.search, mode: 'insensitive' } } },
        { classe: { nom: { contains: q.search, mode: 'insensitive' } } },
        { matiere: { nom: { contains: q.search, mode: 'insensitive' } } },
      ];
    }

    if (q.enseignantId) where.enseignantId = q.enseignantId;
    if (q.classeId) where.classeId = q.classeId;
    if (q.matiereId) where.matiereId = q.matiereId;
    if (q.anneeScolaireId) where.anneeScolaireId = q.anneeScolaireId;
    if (q.estActive !== undefined) where.estActive = q.estActive;
    if (q.estPrincipal !== undefined) where.estPrincipal = q.estPrincipal;

    const allowedSort = ['createdAt', 'heuresHebdo', 'valableDu'];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'createdAt';
    const sortOrder = q.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      client.affectationEnseignant.count({ where }),
      client.affectationEnseignant.findMany({
        where,
        include: affectationInclude,
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

  async findById(ctx: AffectationContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const affectation = await client.affectationEnseignant.findUnique({
      where: { id },
      include: affectationInclude,
    });

    if (!affectation) throw new AppError('Affectation introuvable', 404);
    return affectation;
  }

  // ──────────────────────────────────────────
  // GET BY ENSEIGNANT
  // ──────────────────────────────────────────

  async findByEnseignant(
    ctx: AffectationContext,
    enseignantId: string,
    anneeScolaireId?: string
  ) {
    const client = await getClient(ctx.schemaName);

    const where: any = { enseignantId, estActive: true };
    if (anneeScolaireId) where.anneeScolaireId = anneeScolaireId;

    const affectations = await client.affectationEnseignant.findMany({
      where,
      include: affectationInclude,
      orderBy: [
        { classe: { nom: 'asc' } },
        { matiere: { nom: 'asc' } },
      ],
    });

    // Total heures
    const totalHeures = affectations.reduce(
      (sum: number, a: any) => sum + (a.heuresHebdo ?? 0),
      0
    );

    return {
      affectations,
      stats: {
        nombreAffectations: affectations.length,
        totalHeuresHebdo: totalHeures,
        classes: [...new Set(affectations.map((a: any) => a.classe.nom))],
        matieres: [...new Set(affectations.map((a: any) => a.matiere.nom))],
      },
    };
  }

  // ──────────────────────────────────────────
  // GET BY CLASSE
  // ──────────────────────────────────────────

  async findByClasse(ctx: AffectationContext, classeId: string) {
    const client = await getClient(ctx.schemaName);

    const affectations = await client.affectationEnseignant.findMany({
      where: { classeId, estActive: true },
      include: affectationInclude,
      orderBy: { matiere: { nom: 'asc' } },
    });

    return affectations;
  }

  // ──────────────────────────────────────────
  // UPDATE
  // ──────────────────────────────────────────

  async update(ctx: AffectationContext, id: string, input: UpdateAffectationInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.affectationEnseignant.findUnique({
      where: { id },
      select: {
        id: true,
        enseignantId: true,
        classeId: true,
        matiereId: true,
        anneeScolaireId: true,
        valableDu: true,
        valableAu: true,
      },
    });
    if (!existing) throw new AppError('Affectation introuvable', 404);

    // Vérifier les dates si modifiées
    const newValableDu = input.valableDu ?? existing.valableDu;
    const newValableAu =
      input.valableAu !== undefined ? input.valableAu : existing.valableAu;

    if (newValableAu && new Date(newValableDu) >= new Date(newValableAu)) {
      throw new AppError(
        'La date "valableAu" doit être après "valableDu"',
        400
      );
    }

    // Vérifier les doublons si changement de clé
    const newEnseignantId = input.enseignantId ?? existing.enseignantId;
    const newClasseId = input.classeId ?? existing.classeId;
    const newMatiereId = input.matiereId ?? existing.matiereId;
    const newAnneeId = input.anneeScolaireId ?? existing.anneeScolaireId;

    const keyChanged =
      newEnseignantId !== existing.enseignantId ||
      newClasseId !== existing.classeId ||
      newMatiereId !== existing.matiereId ||
      newAnneeId !== existing.anneeScolaireId;

    if (keyChanged) {
      const dup = await client.affectationEnseignant.findFirst({
        where: {
          enseignantId: newEnseignantId,
          classeId: newClasseId,
          matiereId: newMatiereId,
          anneeScolaireId: newAnneeId,
          NOT: { id },
        },
        select: { id: true },
      });
      if (dup) {
        throw new AppError(
          'Une affectation identique existe déjà',
          409
        );
      }
    }

    const patch: any = {};
    if (input.enseignantId !== undefined) patch.enseignantId = input.enseignantId;
    if (input.classeId !== undefined) patch.classeId = input.classeId;
    if (input.matiereId !== undefined) patch.matiereId = input.matiereId;
    if (input.anneeScolaireId !== undefined)
      patch.anneeScolaireId = input.anneeScolaireId;
    if (input.heuresHebdo !== undefined) patch.heuresHebdo = input.heuresHebdo;
    if (input.estPrincipal !== undefined)
      patch.estPrincipal = input.estPrincipal;
    if (input.valableDu !== undefined) patch.valableDu = input.valableDu;
    if (input.valableAu !== undefined) patch.valableAu = input.valableAu;
    if (input.estActive !== undefined) patch.estActive = input.estActive;

    try {
      return await client.affectationEnseignant.update({
        where: { id },
        data: patch,
        include: affectationInclude,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError(
          'Cette affectation existe déjà (contrainte unique)',
          409
        );
      }
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // SOFT DELETE (désactivation)
  // ──────────────────────────────────────────

  async softDelete(ctx: AffectationContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.affectationEnseignant.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new AppError('Affectation introuvable', 404);

    await client.affectationEnseignant.update({
      where: { id },
      data: { estActive: false },
    });

    return { id, message: 'Affectation désactivée' };
  }

  // ──────────────────────────────────────────
  // HARD DELETE
  // ──────────────────────────────────────────

  async hardDelete(ctx: AffectationContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.affectationEnseignant.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new AppError('Affectation introuvable', 404);

    // Vérifier si des notes ont été saisies pour cette affectation
    const enseignant = await client.affectationEnseignant.findUnique({
      where: { id },
      select: {
        enseignantId: true,
        classeId: true,
        matiereId: true,
      },
    });

    if (enseignant) {
      const nbNotes = await client.note.count({
        where: {
          enseignantId: enseignant.enseignantId,
          matiereId: enseignant.matiereId,
          eleve: {
            inscriptions: {
              some: { classeId: enseignant.classeId, estActive: true },
            },
          },
        },
      });

      if (nbNotes > 0) {
        throw new AppError(
          `Suppression impossible : ${nbNotes} note(s) saisie(s) pour cet enseignant dans cette classe. Désactivez l'affectation à la place.`,
          409
        );
      }
    }

    await client.affectationEnseignant.delete({ where: { id } });
    return { id, message: 'Affectation supprimée définitivement' };
  }
}

export const affectationService = new AffectationService();