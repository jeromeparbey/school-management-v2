// backend/src/modules/planScolarite/planScolarite.service.ts

import { getTenantClient } from '../../config/tenant-db.js';
import { AppError } from '../../utils/AppError.js';
import type {
  CreatePlanScolariteInput,
  UpdatePlanScolariteInput,
  ListPlansScolariteQuery,
} from './planScolarite.validation.js';

export interface PlanScolariteContext {
  schemaName: string;
  etablissementId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

const planScolariteInclude = {
  anneeScolaire: { select: { id: true, nom: true, estActive: true } },
  niveau: { select: { id: true, nom: true, code: true } },
  classe: { select: { id: true, nom: true, code: true } },
  _count: {
    select: { echeances: true, assignments: true },
  },
} as const;

export class PlanScolariteService {
  async create(ctx: PlanScolariteContext, input: CreatePlanScolariteInput) {
    const client = await getClient(ctx.schemaName);

    // Vérifier l'année
    const annee = await client.anneeScolaire.findUnique({
      where: { id: input.anneeScolaireId },
      select: { id: true },
    });
    if (!annee) throw new AppError('Année scolaire introuvable', 404);

    return client.planScolarite.create({
      data: {
        nom: input.nom.trim(),
        description: input.description ?? null,
        anneeScolaireId: input.anneeScolaireId,
        niveauId: input.niveauId ?? null,
        classeId: input.classeId ?? null,
        fraisInscription: input.fraisInscription ?? 0,
        fraisScolarite: input.fraisScolarite ?? 0,
        autresFrais: input.autresFrais ?? undefined,
        montantTotal: input.montantTotal,
        devise: input.devise ?? 'XOF',
        estActif: input.estActif ?? true,
      },
      include: planScolariteInclude,
    });
  }

  async findAll(ctx: PlanScolariteContext, q: ListPlansScolariteQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};
    if (q.search) {
      where.OR = [
        { nom: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    if (q.anneeScolaireId) where.anneeScolaireId = q.anneeScolaireId;
    if (q.niveauId) where.niveauId = q.niveauId;
    if (q.classeId) where.classeId = q.classeId;
    if (q.estActif !== undefined) where.estActif = q.estActif;

    const allowedSort = ['nom', 'montantTotal', 'createdAt'];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'createdAt';
    const sortOrder = q.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      client.planScolarite.count({ where }),
      client.planScolarite.findMany({
        where,
        include: planScolariteInclude,
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

  async findById(ctx: PlanScolariteContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const plan = await client.planScolarite.findUnique({
      where: { id },
      include: {
        ...planScolariteInclude,
        echeances: {
          orderBy: { ordre: 'asc' },
        },
      },
    });

    if (!plan) throw new AppError('Plan de scolarité introuvable', 404);
    return plan;
  }

  async update(ctx: PlanScolariteContext, id: string, input: UpdatePlanScolariteInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.planScolarite.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new AppError('Plan de scolarité introuvable', 404);

    const patch: any = {};
    if (input.nom !== undefined) patch.nom = input.nom.trim();
    if (input.description !== undefined) patch.description = input.description;
    if (input.niveauId !== undefined) patch.niveauId = input.niveauId;
    if (input.classeId !== undefined) patch.classeId = input.classeId;
    if (input.fraisInscription !== undefined)
      patch.fraisInscription = input.fraisInscription;
    if (input.fraisScolarite !== undefined)
      patch.fraisScolarite = input.fraisScolarite;
    if (input.autresFrais !== undefined) patch.autresFrais = input.autresFrais;
    if (input.montantTotal !== undefined) patch.montantTotal = input.montantTotal;
    if (input.devise !== undefined) patch.devise = input.devise;
    if (input.estActif !== undefined) patch.estActif = input.estActif;

    return client.planScolarite.update({
      where: { id },
      data: patch,
      include: planScolariteInclude,
    });
  }

  async hardDelete(ctx: PlanScolariteContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.planScolarite.findUnique({
      where: { id },
      select: { id: true, nom: true },
    });
    if (!existing) throw new AppError('Plan de scolarité introuvable', 404);

    const nbAssignments = await client.assignmentScolarite.count({
      where: { planScolariteId: id },
    });

    if (nbAssignments > 0) {
      throw new AppError(
        `Suppression impossible : ${nbAssignments} assignment(s) rattaché(s). Désactivez le plan à la place.`,
        409
      );
    }

    await client.planScolarite.delete({ where: { id } });
    return { id, message: 'Plan de scolarité supprimé définitivement' };
  }
}

export const planScolariteService = new PlanScolariteService();