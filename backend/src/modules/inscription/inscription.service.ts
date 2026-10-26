// backend/src/modules/inscription/inscription.service.ts

import { getTenantClient } from '../../config/tenant-db';
import { AppError } from '../../utils/AppError';
import type {
  CreateInscriptionInput,
  UpdateInscriptionInput,
  ListInscriptionsQuery,
} from './inscription.validation';

export interface InscriptionContext {
  schemaName: string;
  etablissementId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

const inscriptionInclude = {
  eleve: {
    select: { id: true, matricule: true, prenom: true, nom: true, sexe: true, photo: true, statut: true },
  },
  classe: {
    select: { id: true, nom: true, code: true, capacite: true },
  },
  anneeScolaire: {
    select: { id: true, nom: true, estActive: true },
  },
} as const;

export class InscriptionService {
  async create(ctx: InscriptionContext, input: CreateInscriptionInput) {
    const client = await getClient(ctx.schemaName);

    // Vérifier l'élève
    const eleve = await client.eleve.findUnique({
      where: { id: input.eleveId },
      select: { id: true, statut: true },
    });
    if (!eleve) throw new AppError('Élève introuvable', 404);
    if (eleve.statut === 'ARCHIVE') {
      throw new AppError('Impossible d\'inscrire un élève archivé', 400);
    }

    // Vérifier la classe
    const classe = await client.classe.findUnique({
      where: { id: input.classeId },
      select: { id: true, capacite: true, estArchive: true },
    });
    if (!classe) throw new AppError('Classe introuvable', 404);
    if (classe.estArchive) {
      throw new AppError('Impossible de s\'inscrire dans une classe archivée', 400);
    }

    // Vérifier l'année scolaire
    const annee = await client.anneeScolaire.findUnique({
      where: { id: input.anneeScolaireId },
      select: { id: true, estArchive: true },
    });
    if (!annee) throw new AppError('Année scolaire introuvable', 404);
    if (annee.estArchive) {
      throw new AppError('Impossible de s\'inscrire dans une année archivée', 400);
    }

    // Vérifier la capacité de la classe
    if (classe.capacite) {
      const nbInscrits = await client.inscription.count({
        where: { classeId: input.classeId, estActive: true },
      });
      if (nbInscrits >= classe.capacite) {
        throw new AppError(
          `Classe pleine (${nbInscrits}/${classe.capacite})`,
          409
        );
      }
    }

    try {
      return await client.inscription.create({
        data: {
          eleveId: input.eleveId,
          classeId: input.classeId,
          anneeScolaireId: input.anneeScolaireId,
          dateInscription: input.dateInscription
            ? new Date(input.dateInscription)
            : new Date(),
          estActive: input.estActive ?? true,
        },
        include: inscriptionInclude,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError(
          'Cet élève est déjà inscrit dans cette classe pour cette année',
          409
        );
      }
      throw err;
    }
  }

  async findAll(ctx: InscriptionContext, q: ListInscriptionsQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};
    if (q.search) {
      where.eleve = {
        OR: [
          { nom: { contains: q.search, mode: 'insensitive' } },
          { prenom: { contains: q.search, mode: 'insensitive' } },
          { matricule: { contains: q.search, mode: 'insensitive' } },
        ],
      };
    }
    if (q.eleveId) where.eleveId = q.eleveId;
    if (q.classeId) where.classeId = q.classeId;
    if (q.anneeScolaireId) where.anneeScolaireId = q.anneeScolaireId;
    if (q.estActive !== undefined) where.estActive = q.estActive;

    const allowedSort = ['dateInscription', 'createdAt'];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'dateInscription';
    const sortOrder = q.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      client.inscription.count({ where }),
      client.inscription.findMany({
        where,
        include: inscriptionInclude,
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

  async findById(ctx: InscriptionContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const inscription = await client.inscription.findUnique({
      where: { id },
      include: inscriptionInclude,
    });

    if (!inscription) throw new AppError('Inscription introuvable', 404);
    return inscription;
  }

  async update(ctx: InscriptionContext, id: string, input: UpdateInscriptionInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.inscription.findUnique({
      where: { id },
      select: { id: true, classeId: true },
    });
    if (!existing) throw new AppError('Inscription introuvable', 404);

    const patch: any = {};
    if (input.classeId !== undefined) patch.classeId = input.classeId;
    if (input.anneeScolaireId !== undefined)
      patch.anneeScolaireId = input.anneeScolaireId;
    if (input.dateInscription !== undefined)
      patch.dateInscription = new Date(input.dateInscription);
    if (input.estActive !== undefined) patch.estActive = input.estActive;

    try {
      return await client.inscription.update({
        where: { id },
        data: patch,
        include: inscriptionInclude,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError(
          'Cet élève est déjà inscrit dans cette classe pour cette année',
          409
        );
      }
      throw err;
    }
  }

  async softDelete(ctx: InscriptionContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.inscription.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new AppError('Inscription introuvable', 404);

    await client.inscription.update({
      where: { id },
      data: { estActive: false },
    });

    return { id, message: 'Inscription désactivée' };
  }

  async hardDelete(ctx: InscriptionContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.inscription.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new AppError('Inscription introuvable', 404);

    // Vérifier si des dépendances existent (paiements liés via assignment)
    const nbPaiements = await client.paiement.count({
      where: { eleve: { inscriptions: { some: { id } } } },
    });

    if (nbPaiements > 0) {
      throw new AppError(
        `Suppression impossible : ${nbPaiements} paiement(s) rattaché(s). Désactivez l'inscription à la place.`,
        409
      );
    }

    await client.inscription.delete({ where: { id } });
    return { id, message: 'Inscription supprimée définitivement' };
  }
}

export const inscriptionService = new InscriptionService();