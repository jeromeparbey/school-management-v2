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

// 🆕 Include centralisé — on sélectionne EXPLICITEMENT tous les champs
//     (y compris autresFrais) pour être sûr qu'ils sont toujours renvoyés
const planScolariteInclude = {
  anneeScolaire: { select: { id: true, nom: true, estActive: true } },
  niveau: { select: { id: true, nom: true, code: true } },
  classe: { select: { id: true, nom: true, code: true } },
  _count: {
    select: { echeances: true, assignments: true },
  },
} as const;

// 🆕 Normalise autresFrais : null si vide, objet propre sinon
function normalizeAutresFrais(
  input: Record<string, any> | null | undefined
): Record<string, number> | null {
  if (!input) return null;
  const cleaned: Record<string, number> = {};
  for (const [k, v] of Object.entries(input)) {
    const key = String(k).trim();
    const num = Number(v);
    if (key && Number.isFinite(num) && num > 0) {
      cleaned[key] = num;
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

// 🆕 Calcule la somme des autres frais (utile pour logs / vérifs)
function sumAutresFrais(autresFrais: Record<string, number> | null): number {
  if (!autresFrais) return 0;
  return Object.values(autresFrais).reduce((s, v) => s + v, 0);
}

export class PlanScolariteService {
  async create(ctx: PlanScolariteContext, input: CreatePlanScolariteInput) {
    const client = await getClient(ctx.schemaName);

    // ✅ Vérifier l'année scolaire
    const annee = await client.anneeScolaire.findUnique({
      where: { id: input.anneeScolaireId },
      select: { id: true, nom: true },
    });
    if (!annee) throw new AppError('Année scolaire introuvable', 404);

    // ✅ Vérifier le niveau si fourni
    if (input.niveauId) {
      const niveau = await client.niveau.findUnique({
        where: { id: input.niveauId },
        select: { id: true },
      });
      if (!niveau) throw new AppError('Niveau introuvable', 404);
    }

    // ✅ Vérifier la classe si fournie
    if (input.classeId) {
      const classe = await client.classe.findUnique({
        where: { id: input.classeId },
        select: { id: true, niveauId: true, anneeScolaireId: true },
      });
      if (!classe) throw new AppError('Classe introuvable', 404);
      if (classe.anneeScolaireId !== input.anneeScolaireId) {
        throw new AppError(
          "La classe sélectionnée n'appartient pas à cette année scolaire",
          400
        );
      }
      if (input.niveauId && classe.niveauId !== input.niveauId) {
        throw new AppError(
          "La classe sélectionnée n'appartient pas à ce niveau",
          400
        );
      }
    }

    // ✅ Normaliser autresFrais (objet { libellé: montant } ou null)
    const autresFrais = normalizeAutresFrais(input.autresFrais);

    // ✅ Recalculer le montant total pour être 100% sûr (côté serveur)
    const fraisInscription = Number(input.fraisInscription ?? 0);
    const fraisScolarite = Number(input.fraisScolarite ?? 0);
    const autresTotal = sumAutresFrais(autresFrais);
    const montantTotal = fraisInscription + fraisScolarite + autresTotal;

    // ✅ Vérifier la cohérence avec ce que le client a envoyé (tolérance 1)
    if (Math.abs(montantTotal - Number(input.montantTotal)) > 1) {
      throw new AppError(
        `Incohérence : montantTotal envoyé (${input.montantTotal}) ≠ calculé (${montantTotal})`,
        400
      );
    }

    return client.planScolarite.create({
      data: {
        nom: input.nom.trim(),
        description: input.description?.trim() || null,
        anneeScolaireId: input.anneeScolaireId,
        niveauId: input.niveauId ?? null,
        classeId: input.classeId ?? null,
        fraisInscription,
        fraisScolarite,
        autresFrais: autresFrais ?? undefined, // Prisma accepte Json ou undefined
        montantTotal,
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
        // 🆕 On inclut aussi les assignments pour savoir combien d'élèves
        //     sont rattachés au plan (utile pour l'UI détail)
        assignments: {
          select: {
            id: true,
            statut: true,
            eleve: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                matricule: true,
              },
            },
          },
          take: 50,
        },
      },
    });

    if (!plan) throw new AppError('Plan de scolarité introuvable', 404);
    return plan;
  }

  async update(
    ctx: PlanScolariteContext,
    id: string,
    input: UpdatePlanScolariteInput
  ) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.planScolarite.findUnique({
      where: { id },
      select: {
        id: true,
        fraisInscription: true,
        fraisScolarite: true,
        autresFrais: true,
        montantTotal: true,
        anneeScolaireId: true,
      },
    });
    if (!existing)
      throw new AppError('Plan de scolarité introuvable', 404);

    const patch: any = {};

    if (input.nom !== undefined) patch.nom = input.nom.trim();
    if (input.description !== undefined)
      patch.description = input.description?.trim() || null;
    if (input.niveauId !== undefined) patch.niveauId = input.niveauId;
    if (input.classeId !== undefined) patch.classeId = input.classeId;
    if (input.devise !== undefined) patch.devise = input.devise;
    if (input.estActif !== undefined) patch.estActif = input.estActif;

    // 🔥 Recalcul automatique du montantTotal si les frais changent
    const nextFraisInscription =
      input.fraisInscription !== undefined
        ? Number(input.fraisInscription)
        : Number(existing.fraisInscription);

    const nextFraisScolarite =
      input.fraisScolarite !== undefined
        ? Number(input.fraisScolarite)
        : Number(existing.fraisScolarite);

    const nextAutresFrais =
      input.autresFrais !== undefined
        ? normalizeAutresFrais(input.autresFrais)
        : (existing.autresFrais as Record<string, number> | null);

    const nextMontantTotal =
      nextFraisInscription +
      nextFraisScolarite +
      sumAutresFrais(nextAutresFrais);

    // Si un des frais a changé, on met à jour les frais + le total
    if (
      input.fraisInscription !== undefined ||
      input.fraisScolarite !== undefined ||
      input.autresFrais !== undefined
    ) {
      patch.fraisInscription = nextFraisInscription;
      patch.fraisScolarite = nextFraisScolarite;
      patch.autresFrais = nextAutresFrais ?? undefined;
      patch.montantTotal = nextMontantTotal;
    } else if (input.montantTotal !== undefined) {
      // Sinon on accepte le montantTotal envoyé (avec vérif de cohérence)
      if (Math.abs(input.montantTotal - nextMontantTotal) > 1) {
        throw new AppError(
          `Incohérence : montantTotal envoyé (${input.montantTotal}) ≠ calculé (${nextMontantTotal})`,
          400
        );
      }
      patch.montantTotal = input.montantTotal;
    }

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
    if (!existing)
      throw new AppError('Plan de scolarité introuvable', 404);

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