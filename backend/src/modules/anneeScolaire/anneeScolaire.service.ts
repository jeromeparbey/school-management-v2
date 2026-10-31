// backend/src/modules/anneeScolaire/anneeScolaire.service.ts

import { getTenantClient } from '../../config/tenant-db.js';
import { AppError } from '../../utils/AppError.js';
import type {
  CreateAnneeScolaireInput,
  UpdateAnneeScolaireInput,
  ListAnneesScolairesQuery,
} from './anneeScolaire.validation.js';

export interface AnneeScolaireContext {
  schemaName: string;
  etablissementId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError(`Client tenant introuvable "${schemaName}"`, 500);
  return client;
}

export class AnneeScolaireService {
  async create(ctx: AnneeScolaireContext, input: CreateAnneeScolaireInput) {
    const client = await getClient(ctx.schemaName);

    if (new Date(input.dateDebut) >= new Date(input.dateFin)) {
      throw new AppError('La date de fin doit être après la date de début', 400);
    }

    // Si estActive=true, désactiver les autres années actives
    if (input.estActive) {
      await client.anneeScolaire.updateMany({
        where: { estActive: true },
        data: { estActive: false },
      });
    }

    return client.anneeScolaire.create({
      data: {
        nom: input.nom,
        dateDebut: new Date(input.dateDebut),
        dateFin: new Date(input.dateFin),
        estActive: input.estActive ?? false,
      },
      include: { _count: { select: { classes: true, periodes: true } } },
    });
  }

  async findAll(ctx: AnneeScolaireContext, q: ListAnneesScolairesQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};
    if (q.search) {
      where.nom = { contains: q.search, mode: 'insensitive' };
    }
    if (q.estActive !== undefined) where.estActive = q.estActive;
    if (q.estArchive !== undefined) where.estArchive = q.estArchive;

    const [total, data] = await Promise.all([
      client.anneeScolaire.count({ where }),
      client.anneeScolaire.findMany({
        where,
        include: { _count: { select: { classes: true, periodes: true } } },
        orderBy: { [q.sortBy]: q.sortOrder },
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

  async findById(ctx: AnneeScolaireContext, id: string) {
    const client = await getClient(ctx.schemaName);
    const annee = await client.anneeScolaire.findUnique({
      where: { id },
      include: { _count: { select: { classes: true, periodes: true } } },
    });
    if (!annee) throw new AppError('Année scolaire introuvable', 404);
    return annee;
  }

  async findActive(ctx: AnneeScolaireContext) {
    const client = await getClient(ctx.schemaName);
    return client.anneeScolaire.findFirst({
      where: { estActive: true },
      include: { _count: { select: { classes: true, periodes: true } } },
    });
  }

  async update(ctx: AnneeScolaireContext, id: string, input: UpdateAnneeScolaireInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.anneeScolaire.findUnique({ where: { id } });
    if (!existing) throw new AppError('Année scolaire introuvable', 404);

    if (input.dateDebut && input.dateFin) {
      if (new Date(input.dateDebut) >= new Date(input.dateFin)) {
        throw new AppError('La date de fin doit être après la date de début', 400);
      }
    }

    if (input.estActive === true) {
      await client.anneeScolaire.updateMany({
        where: { estActive: true, NOT: { id } },
        data: { estActive: false },
      });
    }

    return client.anneeScolaire.update({
      where: { id },
      data: {
        ...(input.nom !== undefined && { nom: input.nom }),
        ...(input.dateDebut !== undefined && { dateDebut: new Date(input.dateDebut) }),
        ...(input.dateFin !== undefined && { dateFin: new Date(input.dateFin) }),
        ...(input.estActive !== undefined && { estActive: input.estActive }),
        ...(input.estArchive !== undefined && { estArchive: input.estArchive }),
      },
      include: { _count: { select: { classes: true, periodes: true } } },
    });
  }

  async hardDelete(ctx: AnneeScolaireContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.anneeScolaire.findUnique({ where: { id } });
    if (!existing) throw new AppError('Année scolaire introuvable', 404);

    const nbClasses = await client.classe.count({ where: { anneeScolaireId: id } });
    if (nbClasses > 0) {
      throw new AppError(
        `Suppression impossible : ${nbClasses} classe(s) rattachée(s).`,
        409
      );
    }

    await client.anneeScolaire.delete({ where: { id } });
    return { id, message: 'Année scolaire supprimée définitivement' };
  }
}

export const anneeScolaireService = new AnneeScolaireService();