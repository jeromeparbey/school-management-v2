// backend/src/modules/classe/classe.service.ts

import { getTenantClient } from '../../config/tenant-db';
import { AppError } from '../../utils/AppError';
import type {
  CreateClasseInput,
  UpdateClasseInput,
  ListClassesQuery,
} from './classe.validation';

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

export interface ClasseContext {
  schemaName: string;
  etablissementId: string;
}

interface ListResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Élève tel que retourné par `listEleves` (sous-ensemble des champs).
 */
interface EleveSummary {
  id: string;
  matricule: string;
  prenom: string;
  nom: string;
  sexe: string;
  dateNaissance: Date | null;
  photo: string | null;
  statut: string;
}

/**
 * Résultat brut d'une inscription avec élève inclus.
 */
interface InscriptionWithEleve {
  eleve: EleveSummary;
}

/**
 * Résultat de `groupBy` sur `eleve.sexe`.
 */
interface GroupBySexeRow {
  sexe: string;
  _count: { _all: number };
}

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) {
    throw new AppError(
      `Client tenant introuvable pour le schéma "${schemaName}"`,
      500
    );
  }
  return client;
}

/**
 * Vérifie que l'année scolaire existe et n'est pas archivée.
 */
async function assertAnneeScolaireExiste(
  client: Awaited<ReturnType<typeof getClient>>,
  anneeScolaireId: string
): Promise<void> {
  const annee = await client.anneeScolaire.findUnique({
    where: { id: anneeScolaireId },
    select: { id: true, estArchive: true },
  });
  if (!annee) {
    throw new AppError('Année scolaire introuvable', 404);
  }
  if (annee.estArchive) {
    throw new AppError(
      'Impossible de rattacher une classe à une année scolaire archivée',
      400
    );
  }
}

/**
 * Vérifie que le niveau existe.
 */
async function assertNiveauExiste(
  client: Awaited<ReturnType<typeof getClient>>,
  niveauId: string
): Promise<void> {
  const niveau = await client.niveau.findUnique({
    where: { id: niveauId },
    select: { id: true },
  });
  if (!niveau) {
    throw new AppError('Niveau introuvable', 404);
  }
}

/**
 * Vérifie l'unicité du code de classe (globalement, comme en DB).
 */
async function assertCodeUnique(
  client: Awaited<ReturnType<typeof getClient>>,
  code: string,
  excludeId?: string
): Promise<void> {
  const existing = await client.classe.findFirst({
    where: {
      code,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (existing) {
    throw new AppError(
      `Le code "${code}" est déjà utilisé par une autre classe`,
      409
    );
  }
}

/**
 * Sérialise une classe pour la réponse API (inclut relations utiles).
 */
const classeInclude = {
  niveau: {
    select: { id: true, nom: true, code: true, ordre: true },
  },
  anneeScolaire: {
    select: { id: true, nom: true, estActive: true },
  },
  _count: {
    select: {
      inscriptions: true,
      emploisTemps: true,
      affectations: true,
    },
  },
} as const;

// ──────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────

export class ClasseService {
  // ────────── CREATE ──────────

  async create(ctx: ClasseContext, input: CreateClasseInput) {
    const client = await getClient(ctx.schemaName);

    await assertAnneeScolaireExiste(client, input.anneeScolaireId);
    await assertNiveauExiste(client, input.niveauId);
    await assertCodeUnique(client, input.code);

    try {
      const classe = await client.classe.create({
        data: {
          nom: input.nom,
          code: input.code,
          capacite: input.capacite ?? null,
          salle: input.salle ?? null,
          anneeScolaireId: input.anneeScolaireId,
          niveauId: input.niveauId,
          estActive: input.estActive ?? true,
        },
        include: classeInclude,
      });
      return classe;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'P2002') {
        throw new AppError(
          `Le code "${input.code}" est déjà utilisé`,
          409
        );
      }
      if (code === 'P2003') {
        throw new AppError(
          'Référence invalide (année scolaire ou niveau inexistant)',
          400
        );
      }
      throw err;
    }
  }

  // ────────── FIND ALL (paginé) ──────────

  async findAll(
    ctx: ClasseContext,
    q: ListClassesQuery
  ): Promise<ListResult<unknown>> {
    const client = await getClient(ctx.schemaName);

    const where: Record<string, unknown> = {};

    if (q.search) {
      where.OR = [
        { nom: { contains: q.search, mode: 'insensitive' } },
        { code: { contains: q.search, mode: 'insensitive' } },
        { salle: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    if (q.anneeScolaireId) where.anneeScolaireId = q.anneeScolaireId;
    if (q.niveauId) where.niveauId = q.niveauId;
    if (q.estActive !== undefined) where.estActive = q.estActive;
    if (q.estArchive !== undefined) where.estArchive = q.estArchive;

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [q.sortBy]: q.sortOrder,
    };

    const [total, data] = await Promise.all([
      client.classe.count({ where }),
      client.classe.findMany({
        where,
        include: classeInclude,
        orderBy,
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

  // ────────── FIND BY ID ──────────

  async findById(ctx: ClasseContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const classe = await client.classe.findUnique({
      where: { id },
      include: {
        niveau: true,
        anneeScolaire: true,
        _count: {
          select: {
            inscriptions: true,
            emploisTemps: true,
            affectations: true,
            assignments: true,
            bulletins: true,
          },
        },
      },
    });

    if (!classe) throw new AppError('Classe introuvable', 404);
    return classe;
  }

  // ────────── LIST BY ANNEE ──────────

  async listByAnnee(ctx: ClasseContext, anneeScolaireId: string) {
    const client = await getClient(ctx.schemaName);

    await assertAnneeScolaireExiste(client, anneeScolaireId);

    return client.classe.findMany({
      where: {
        anneeScolaireId,
        estArchive: false,
      },
      include: classeInclude,
      orderBy: [{ niveau: { ordre: 'asc' } }, { nom: 'asc' }],
    });
  }

  // ────────── LIST ELEVES (inscrits dans la classe) ──────────

  async listEleves(ctx: ClasseContext, classeId: string) {
    const client = await getClient(ctx.schemaName);

    // Vérifier que la classe existe
    const classe = await client.classe.findUnique({
      where: { id: classeId },
      select: { id: true, nom: true },
    });
    if (!classe) throw new AppError('Classe introuvable', 404);

    // ✅ Cast typé pour donner un type aux callbacks
    const inscriptions = (await client.inscription.findMany({
      where: {
        classeId,
        estActive: true,
        eleve: { statut: 'ACTIF' },
      },
      include: {
        eleve: {
          select: {
            id: true,
            matricule: true,
            prenom: true,
            nom: true,
            sexe: true,
            dateNaissance: true,
            photo: true,
            statut: true,
          },
        },
      },
      orderBy: [{ eleve: { nom: 'asc' } }, { eleve: { prenom: 'asc' } }],
    })) as InscriptionWithEleve[];

    return {
      classe: { id: classe.id, nom: classe.nom },
      // ✅ `i` est maintenant typé via le cast ci-dessus
      eleves: inscriptions.map((i: InscriptionWithEleve) => i.eleve),
    };
  }

  // ────────── STATISTIQUES ──────────

  async statistiques(ctx: ClasseContext, classeId: string) {
    const client = await getClient(ctx.schemaName);

    const classe = await client.classe.findUnique({
      where: { id: classeId },
      select: { id: true, nom: true, capacite: true },
    });
    if (!classe) throw new AppError('Classe introuvable', 404);

    const [nbInscrits, nbActifs, nbParSexeRaw, moyennes] = await Promise.all([
      client.inscription.count({
        where: { classeId, estActive: true },
      }),
      client.eleve.count({
        where: {
          statut: 'ACTIF',
          inscriptions: {
            some: { classeId, estActive: true },
          },
        },
      }),
      client.eleve.groupBy({
        by: ['sexe'],
        where: {
          statut: 'ACTIF',
          inscriptions: {
            some: { classeId, estActive: true },
          },
        },
        _count: { _all: true },
      }),
      client.bulletin.aggregate({
        where: { classeId },
        _avg: { moyenneGenerale: true },
      }),
    ]);

    // ✅ Cast typé pour le reduce
    const nbParSexe = nbParSexeRaw as GroupBySexeRow[];

    // ✅ `acc` et `row` typés explicitement — plus d'erreur TS7006 ni TS2347
    const parSexe: Record<string, number> = nbParSexe.reduce(
      (acc: Record<string, number>, row: GroupBySexeRow) => {
        acc[row.sexe] = row._count._all;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      classe: {
        id: classe.id,
        nom: classe.nom,
        capacite: classe.capacite,
        placesRestantes:
          classe.capacite !== null
            ? Math.max(classe.capacite - nbInscrits, 0)
            : null,
      },
      effectif: {
        inscrits: nbInscrits,
        actifs: nbActifs,
        parSexe,
      },
      moyenneGenerale: moyennes._avg.moyenneGenerale ?? null,
    };
  }

  // ────────── UPDATE ──────────

  async update(ctx: ClasseContext, id: string, input: UpdateClasseInput) {
    const client = await getClient(ctx.schemaName);

    // Vérifier existence
    const existing = await client.classe.findUnique({
      where: { id },
      select: { id: true, code: true },
    });
    if (!existing) throw new AppError('Classe introuvable', 404);

    // Vérifs croisées
    if (input.anneeScolaireId) {
      await assertAnneeScolaireExiste(client, input.anneeScolaireId);
    }
    if (input.niveauId) {
      await assertNiveauExiste(client, input.niveauId);
    }
    if (input.code && input.code !== existing.code) {
      await assertCodeUnique(client, input.code, id);
    }

    try {
      return await client.classe.update({
        where: { id },
        data: {
          ...(input.nom !== undefined && { nom: input.nom }),
          ...(input.code !== undefined && { code: input.code }),
          ...(input.capacite !== undefined && { capacite: input.capacite }),
          ...(input.salle !== undefined && { salle: input.salle }),
          ...(input.anneeScolaireId !== undefined && {
            anneeScolaireId: input.anneeScolaireId,
          }),
          ...(input.niveauId !== undefined && { niveauId: input.niveauId }),
          ...(input.estActive !== undefined && {
            estActive: input.estActive,
          }),
          ...(input.estArchive !== undefined && {
            estArchive: input.estArchive,
          }),
        },
        include: classeInclude,
      });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'P2002') {
        throw new AppError(
          `Le code "${input.code}" est déjà utilisé`,
          409
        );
      }
      if (code === 'P2003') {
        throw new AppError(
          'Référence invalide (année scolaire ou niveau inexistant)',
          400
        );
      }
      throw err;
    }
  }

  // ────────── SOFT DELETE (archivage) ──────────

  async softDelete(ctx: ClasseContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.classe.findUnique({
      where: { id },
      select: { id: true, estArchive: true, nom: true },
    });
    if (!existing) throw new AppError('Classe introuvable', 404);
    if (existing.estArchive) {
      return { id, message: 'Classe déjà archivée' };
    }

    // Vérifier qu'aucune inscription active n'est rattachée
    const nbInscriptionsActives = await client.inscription.count({
      where: { classeId: id, estActive: true },
    });
    if (nbInscriptionsActives > 0) {
      throw new AppError(
        `Impossible d'archiver : ${nbInscriptionsActives} inscription(s) active(s) rattachée(s). Désactivez-les d'abord.`,
        409
      );
    }

    await client.classe.update({
      where: { id },
      data: { estActive: false, estArchive: true },
    });

    return { id, message: 'Classe archivée avec succès' };
  }

  // ────────── HARD DELETE ──────────

  async hardDelete(ctx: ClasseContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.classe.findUnique({
      where: { id },
      select: { id: true, nom: true },
    });
    if (!existing) throw new AppError('Classe introuvable', 404);

    // Vérifs d'intégrité référentielle (Prisma ne cascade pas par défaut)
    const checks = await Promise.all([
      client.inscription.count({ where: { classeId: id } }),
      client.emploiTemps.count({ where: { classeId: id } }),
      client.affectationEnseignant.count({ where: { classeId: id } }),
      client.assignmentScolarite.count({ where: { classeId: id } }),
      client.bulletin.count({ where: { classeId: id } }),
      client.groupeTD.count({ where: { classeId: id } }),
      client.objectif.count({ where: { classeId: id } }),
      client.planScolarite.count({ where: { classeId: id } }),
    ]);

    const [
      nbInscriptions,
      nbEmplois,
      nbAffectations,
      nbAssignments,
      nbBulletins,
      nbGroupesTD,
      nbObjectifs,
      nbPlans,
    ] = checks;

    const total =
      nbInscriptions +
      nbEmplois +
      nbAffectations +
      nbAssignments +
      nbBulletins +
      nbGroupesTD +
      nbObjectifs +
      nbPlans;

    if (total > 0) {
      throw new AppError(
        `Suppression impossible : la classe est référencée par ` +
          `${nbInscriptions} inscription(s), ${nbEmplois} emploi(s) du temps, ` +
          `${nbAffectations} affectation(s), ${nbAssignments} assignment(s), ` +
          `${nbBulletins} bulletin(s), ${nbGroupesTD} groupe(s) TD, ` +
          `${nbObjectifs} objectif(s), ${nbPlans} plan(s) de scolarité. ` +
          `Archivez la classe à la place.`,
        409
      );
    }

    await client.classe.delete({ where: { id } });
    return { id, message: 'Classe supprimée définitivement' };
  }
}

// ──────────────────────────────────────────
// Export unique
// ──────────────────────────────────────────

export const classeService = new ClasseService();