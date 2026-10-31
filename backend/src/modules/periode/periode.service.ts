// backend/src/modules/periode/periode.service.ts

import { getTenantClient } from '../../config/tenant-db.js';
import { AppError } from '../../utils/AppError.js';
import type {
  CreatePeriodeInput,
  UpdatePeriodeInput,
  ListPeriodesQuery,
} from './periode.validation.js';

export interface PeriodeContext {
  schemaName: string;
  etablissementId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

const periodeInclude = {
  anneeScolaire: {
    select: { id: true, nom: true, estActive: true },
  },
  _count: {
    select: { notes: true, bulletins: true, appreciations: true },
  },
} as const;

export class PeriodeService {
  async create(ctx: PeriodeContext, input: CreatePeriodeInput) {
    const client = await getClient(ctx.schemaName);

    // Vérifier l'année
    const annee = await client.anneeScolaire.findUnique({
      where: { id: input.anneeScolaireId },
      select: { id: true, estArchive: true },
    });
    if (!annee) throw new AppError('Année scolaire introuvable', 404);
    if (annee.estArchive)
      throw new AppError('Impossible d\'ajouter une période à une année archivée', 400);

    // Vérifier les dates
    if (new Date(input.dateDebut) >= new Date(input.dateFin)) {
      throw new AppError('La date de fin doit être après la date de début', 400);
    }

    // Vérifier l'unicité de l'ordre dans l'année
    const dup = await client.periode.findFirst({
      where: { anneeScolaireId: input.anneeScolaireId, ordre: input.ordre },
      select: { id: true },
    });
    if (dup) {
      throw new AppError(
        `Une période avec l'ordre ${input.ordre} existe déjà pour cette année`,
        409
      );
    }

    return client.periode.create({
      data: {
        nom: input.nom.trim(),
        type: input.type,
        dateDebut: new Date(input.dateDebut),
        dateFin: new Date(input.dateFin),
        ordre: input.ordre,
        anneeScolaireId: input.anneeScolaireId,
        estActive: input.estActive ?? true,
        estCloturee: input.estCloturee ?? false,
      },
      include: periodeInclude,
    });
  }

  async findAll(ctx: PeriodeContext, q: ListPeriodesQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};
    if (q.search) {
      where.nom = { contains: q.search, mode: 'insensitive' };
    }
    if (q.anneeScolaireId) where.anneeScolaireId = q.anneeScolaireId;
    if (q.type) where.type = q.type;
    if (q.estActive !== undefined) where.estActive = q.estActive;
    if (q.estCloturee !== undefined) where.estCloturee = q.estCloturee;

    const allowedSort = ['nom', 'ordre', 'dateDebut', 'createdAt'];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'ordre';
    const sortOrder = q.sortOrder === 'desc' ? 'desc' : 'asc';

    const [total, data] = await Promise.all([
      client.periode.count({ where }),
      client.periode.findMany({
        where,
        include: periodeInclude,
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

  async findById(ctx: PeriodeContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const periode = await client.periode.findUnique({
      where: { id },
      include: periodeInclude,
    });

    if (!periode) throw new AppError('Période introuvable', 404);
    return periode;
  }

  async update(ctx: PeriodeContext, id: string, input: UpdatePeriodeInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.periode.findUnique({
      where: { id },
      select: { id: true, anneeScolaireId: true, ordre: true },
    });
    if (!existing) throw new AppError('Période introuvable', 404);

    if (input.ordre !== undefined && input.ordre !== existing.ordre) {
      const dup = await client.periode.findFirst({
        where: {
          anneeScolaireId: existing.anneeScolaireId,
          ordre: input.ordre,
          NOT: { id },
        },
        select: { id: true },
      });
      if (dup) {
        throw new AppError(
          `Une période avec l'ordre ${input.ordre} existe déjà`,
          409
        );
      }
    }

    const patch: any = {};
    if (input.nom !== undefined) patch.nom = input.nom.trim();
    if (input.type !== undefined) patch.type = input.type;
    if (input.dateDebut !== undefined) patch.dateDebut = new Date(input.dateDebut);
    if (input.dateFin !== undefined) patch.dateFin = new Date(input.dateFin);
    if (input.ordre !== undefined) patch.ordre = input.ordre;
    if (input.estActive !== undefined) patch.estActive = input.estActive;
    if (input.estCloturee !== undefined) patch.estCloturee = input.estCloturee;

    return client.periode.update({
      where: { id },
      data: patch,
      include: periodeInclude,
    });
  }

  async hardDelete(ctx: PeriodeContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.periode.findUnique({
      where: { id },
      select: { id: true, nom: true },
    });
    if (!existing) throw new AppError('Période introuvable', 404);

    // Vérifier les dépendances
    const [nbNotes, nbBulletins] = await Promise.all([
      client.note.count({ where: { periodeId: id } }),
      client.bulletin.count({ where: { periodeId: id } }),
    ]);

    if (nbNotes + nbBulletins > 0) {
      throw new AppError(
        `Suppression impossible : ${nbNotes} note(s), ${nbBulletins} bulletin(s) rattaché(s). Clôturez la période à la place.`,
        409
      );
    }

    await client.periode.delete({ where: { id } });
    return { id, message: 'Période supprimée définitivement' };
  }
}

export const periodeService = new PeriodeService();