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
    // ✅ Peut être null si titulaire de classe (primaire)
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

    // 1. Vérifier l'enseignant
    const enseignant = await client.enseignant.findUnique({
      where: { id: input.enseignantId },
      select: { id: true, estActif: true, estArchive: true },
    });
    if (!enseignant) throw new AppError('Enseignant introuvable', 404);
    if (enseignant.estArchive)
      throw new AppError("Impossible d'affecter un enseignant archivé", 400);
    if (!enseignant.estActif)
      throw new AppError("Impossible d'affecter un enseignant inactif", 400);

    // 2. Vérifier la classe
    const classe = await client.classe.findUnique({
      where: { id: input.classeId },
      select: { id: true, estArchive: true },
    });
    if (!classe) throw new AppError('Classe introuvable', 404);
    if (classe.estArchive)
      throw new AppError("Impossible d'affecter une classe archivée", 400);

    // 3. ✅ Vérifier la matière UNIQUEMENT si fournie
    if (input.matiereId) {
      const matiere = await client.matiere.findUnique({
        where: { id: input.matiereId },
        select: { id: true, estArchive: true },
      });
      if (!matiere) throw new AppError('Matière introuvable', 404);
      if (matiere.estArchive)
        throw new AppError("Impossible d'affecter une matière archivée", 400);
    }

    // 4. Vérifier l'année
    const annee = await client.anneeScolaire.findUnique({
      where: { id: input.anneeScolaireId },
      select: { id: true, estArchive: true },
    });
    if (!annee) throw new AppError('Année scolaire introuvable', 404);
    if (annee.estArchive)
      throw new AppError("Impossible d'affecter dans une année archivée", 400);

    // 5. Vérifier les dates
    if (
      input.valableAu &&
      new Date(input.valableDu) >= new Date(input.valableAu)
    ) {
      throw new AppError(
        'La date "valableAu" doit être après "valableDu"',
        400
      );
    }

    // 6. Vérifier les doublons (unique constraint)
    // ✅ matiereId ?? null permet de matcher les titulaires (matiereId = null)
    const dup = await client.affectationEnseignant.findFirst({
      where: {
        enseignantId: input.enseignantId,
        classeId: input.classeId,
        matiereId: input.matiereId ?? null,
        anneeScolaireId: input.anneeScolaireId,
      },
      select: { id: true },
    });
    if (dup) {
      throw new AppError(
        input.matiereId
          ? 'Cet enseignant est déjà affecté à cette classe pour cette matière et cette année'
          : 'Cet enseignant est déjà titulaire de cette classe pour cette année',
        409
      );
    }

    try {
      return await client.affectationEnseignant.create({
        data: {
          enseignantId: input.enseignantId,
          classeId: input.classeId,
          // ✅ null explicite = titulaire de classe
          matiereId: input.matiereId ?? null,
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

  const TAG = '[affectation.findAll]';
  const t0 = Date.now();

  // ─────────────────────────────────────────
  // 1. LOG DU CONTEXTE
  // ─────────────────────────────────────────
  console.log(`\n${TAG} ═══════════ DÉBUT ═══════════`);
  console.log(`${TAG} 🏢 schemaName :`, ctx.schemaName);
  console.log(`${TAG} 🆔 etablissementId :`, ctx.etablissementId);
  console.log(`${TAG} 📥 query reçue :`, JSON.stringify(q, null, 2));

  // ─────────────────────────────────────────
  // 2. CONSTRUCTION DU WHERE
  // ─────────────────────────────────────────
  const where: any = {};

  if (q.search) {
    where.OR = [
      { enseignant: { nom: { contains: q.search, mode: 'insensitive' } } },
      { enseignant: { prenom: { contains: q.search, mode: 'insensitive' } } },
      { classe: { nom: { contains: q.search, mode: 'insensitive' } } },
      { matiere: { nom: { contains: q.search, mode: 'insensitive' } } },
    ];
    console.log(`${TAG} 🔎 search appliqué :`, q.search);
  }

  if (q.enseignantId) {
    where.enseignantId = q.enseignantId;
    console.log(`${TAG} 🔎 enseignantId :`, q.enseignantId);
  }
  if (q.classeId) {
    where.classeId = q.classeId;
    console.log(`${TAG} 🔎 classeId :`, q.classeId);
  }
  if (q.matiereId) {
    where.matiereId = q.matiereId;
    console.log(`${TAG} 🔎 matiereId :`, q.matiereId);
  }
  if (q.anneeScolaireId) {
    where.anneeScolaireId = q.anneeScolaireId;
    console.log(`${TAG} 🔎 anneeScolaireId :`, q.anneeScolaireId);
  }
  if (q.estActive !== undefined) {
    where.estActive = q.estActive;
    console.log(`${TAG} 🔎 estActive :`, q.estActive);
  }
  if (q.estPrincipal !== undefined) {
    where.estPrincipal = q.estPrincipal;
    console.log(`${TAG} 🔎 estPrincipal :`, q.estPrincipal);
  }

  if (q.estTitulaire === true) {
    where.matiereId = null;
    console.log(`${TAG} 🔎 estTitulaire=true → matiereId = null`);
  }
  if (q.estTitulaire === false) {
    where.matiereId = { not: null };
    console.log(`${TAG} 🔎 estTitulaire=false → matiereId = { not: null }`);
  }

  console.log(
    `${TAG} 🎯 where FINAL :`,
    JSON.stringify(where, null, 2)
  );

  // ─────────────────────────────────────────
  // 3. TRIPLE COMPTAGE (diagnostic)
  // ─────────────────────────────────────────
  // 3a. TOTAL sans AUCUN filtre (pour vérifier que les données existent)
  const totalSansFiltre = await client.affectationEnseignant.count();
  console.log(`${TAG} 📊 count SANS filtre :`, totalSansFiltre);

  // 3b. TOTAL avec le where (le vrai résultat)
  const totalAvecFiltre = await client.affectationEnseignant.count({ where });
  console.log(`${TAG} 📊 count AVEC where :`, totalAvecFiltre);

  // 3c. Diagnostic : si 0 avec filtre mais > 0 sans → problème de filtre
  if (totalSansFiltre > 0 && totalAvecFiltre === 0) {
    console.warn(
      `${TAG} ⚠️⚠️⚠️ ALERTE : ${totalSansFiltre} affectations existent en base MAIS 0 ne passent les filtres !`
    );

    // Test sans le filtre estActive pour isoler la cause
    const testSansActive = await client.affectationEnseignant.count({
      where: { ...where, estActive: undefined },
    });
    console.log(
      `${TAG} 🔬 count avec where MAIS sans estActive :`,
      testSansActive
    );

    // Test sans les autres filtres un par un
    if (where.anneeScolaireId) {
      const test = await client.affectationEnseignant.count({
        where: { ...where, anneeScolaireId: undefined },
      });
      console.log(`${TAG} 🔬 count sans anneeScolaireId :`, test);
    }
    if (where.classeId) {
      const test = await client.affectationEnseignant.count({
        where: { ...where, classeId: undefined },
      });
      console.log(`${TAG} 🔬 count sans classeId :`, test);
    }
    if (where.enseignantId) {
      const test = await client.affectationEnseignant.count({
        where: { ...where, enseignantId: undefined },
      });
      console.log(`${TAG} 🔬 count sans enseignantId :`, test);
    }
    if (where.matiereId !== undefined) {
      const test = await client.affectationEnseignant.count({
        where: { ...where, matiereId: undefined },
      });
      console.log(`${TAG} 🔬 count sans matiereId :`, test);
    }
  }

  // ─────────────────────────────────────────
  // 4. TRI
  // ─────────────────────────────────────────
  const allowedSort = ['createdAt', 'heuresHebdo', 'valableDu'];
  const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'createdAt';
  const sortOrder = q.sortOrder === 'asc' ? 'asc' : 'desc';

  console.log(`${TAG} 🔀 tri : ${sortBy} ${sortOrder}`);

  // ─────────────────────────────────────────
  // 5. RÉCUPÉRATION DES DONNÉES
  // ─────────────────────────────────────────
  const data = await client.affectationEnseignant.findMany({
    where,
    include: affectationInclude,
    orderBy: { [sortBy]: sortOrder },
    skip: (q.page - 1) * q.limit,
    take: q.limit,
  });

  console.log(`${TAG} 📦 items récupérés :`, data.length);

  // Log un échantillon pour vérifier la forme des données
  if (data.length > 0) {
    console.log(`${TAG} 🔬 échantillon[0] :`, {
      id: data[0].id,
      enseignant: data[0].enseignant
        ? `${data[0].enseignant.prenom} ${data[0].enseignant.nom}`
        : null,
      classe: data[0].classe?.nom ?? null,
      matiere: data[0].matiere?.nom ?? null,
      anneeScolaire: data[0].anneeScolaire?.nom ?? null,
      estActive: data[0].estActive,
      heuresHebdo: data[0].heuresHebdo,
    });
  } else {
    console.warn(`${TAG} ⚠️ AUCUN item retourné`);
  }

  // ─────────────────────────────────────────
  // 6. RETOUR
  // ─────────────────────────────────────────
  const result = {
    data,
    pagination: {
      page: q.page,
      limit: q.limit,
      total: totalAvecFiltre,
      totalPages: Math.ceil(totalAvecFiltre / q.limit) || 1,
    },
  };

  console.log(
    `${TAG} ✅ RÉSULTAT : ${data.length} item(s) affiché(s) / ${totalAvecFiltre} total / page ${q.page}/${result.pagination.totalPages}`
  );
  console.log(`${TAG} ⏱️ durée : ${Date.now() - t0}ms`);
  console.log(`${TAG} ═══════════ FIN ═══════════\n`);

  return result;
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

  // ✅ Filtre les nulls (titulaires sans matière)
  const matieresUniques: string[] = [
    ...new Set<string>(
      affectations
        .map((a: any): string | undefined => a.matiere?.nom)
        .filter((v: string | undefined): v is string => Boolean(v))
    ),
  ];

  const classesUniques: string[] = [
    ...new Set<string>(
      affectations
        .map((a: any): string | undefined => a.classe?.nom)
        .filter((v: string | undefined): v is string => Boolean(v))
    ),
  ];

  return {
    affectations,
    stats: {
      nombreAffectations: affectations.length,
      totalHeuresHebdo: totalHeures,
      classes: classesUniques,
      matieres: matieresUniques,
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
      // ✅ Prisma gère null : les titulaires (matiereId=null) apparaîtront en premier
      // avec orderBy matiere.nom asc (nulls first par défaut)
      orderBy: [{ matiere: { nom: 'asc' } }, { createdAt: 'asc' }],
    });

    return affectations;
  }

  // ──────────────────────────────────────────
  // UPDATE
  // ──────────────────────────────────────────

  async update(
    ctx: AffectationContext,
    id: string,
    input: UpdateAffectationInput
  ) {
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

    // 1. Vérifier les dates si modifiées
    const newValableDu = input.valableDu ?? existing.valableDu;
    const newValableAu =
      input.valableAu !== undefined ? input.valableAu : existing.valableAu;

    if (newValableAu && new Date(newValableDu) >= new Date(newValableAu)) {
      throw new AppError(
        'La date "valableAu" doit être après "valableDu"',
        400
      );
    }

    // 2. ✅ Gestion de matiereId : distinguer undefined / null / cuid
    //   - undefined → on garde existing.matiereId
    //   - null      → on met null (devient titulaire)
    //   - cuid      → on met le cuid
    const newMatiereId =
      input.matiereId !== undefined ? input.matiereId : existing.matiereId;

    // 3. Vérifier les doublons si changement de clé
    const newEnseignantId = input.enseignantId ?? existing.enseignantId;
    const newClasseId = input.classeId ?? existing.classeId;
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
          matiereId: newMatiereId ?? null, // ✅ null si titulaire
          anneeScolaireId: newAnneeId,
          NOT: { id },
        },
        select: { id: true },
      });
      if (dup) {
        throw new AppError('Une affectation identique existe déjà', 409);
      }
    }

    // 4. Construire le patch
    const patch: any = {};
    if (input.enseignantId !== undefined)
      patch.enseignantId = input.enseignantId;
    if (input.classeId !== undefined) patch.classeId = input.classeId;
    // ✅ On utilise `!== undefined` (pas `??`) pour préserver `null` explicite
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
  // SOFT DELETE
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
      select: {
        id: true,
        enseignantId: true,
        classeId: true,
        matiereId: true, // ✅ peut être null
      },
    });
    if (!existing) throw new AppError('Affectation introuvable', 404);

    // ✅ Vérifier les notes en tenant compte du cas "titulaire" (matiereId = null)
    const noteWhere: any = {
      enseignantId: existing.enseignantId,
      eleve: {
        inscriptions: {
          some: { classeId: existing.classeId, estActive: true },
        },
      },
    };

    if (existing.matiereId) {
      // Cas normal : note liée à cette matière
      noteWhere.matiereId = existing.matiereId;
    } else {
      // Cas titulaire : on compte TOUTES les notes de cet enseignant
      // dans cette classe (toutes matières confondues)
      // Note : si le prof est titulaire ET prof de matières, on bloque tout
      // (l'admin doit désactiver les autres affectations d'abord)
    }

    const nbNotes = await client.note.count({ where: noteWhere });

    if (nbNotes > 0) {
      throw new AppError(
        existing.matiereId
          ? `Suppression impossible : ${nbNotes} note(s) saisie(s) pour cet enseignant dans cette matière. Désactivez l'affectation à la place.`
          : `Suppression impossible : ${nbNotes} note(s) saisie(s) par cet enseignant dans cette classe. Désactivez l'affectation à la place.`,
        409
      );
    }

    await client.affectationEnseignant.delete({ where: { id } });
    return { id, message: 'Affectation supprimée définitivement' };
  }
}

export const affectationService = new AffectationService();