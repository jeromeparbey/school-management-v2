// backend/src/modules/matiere/matiere.service.ts

import { getTenantClient } from '../../config/tenant-db.js';
import { AppError } from '../../utils/AppError.js';
import type {
  CreateMatiereInput,
  UpdateMatiereInput,
  ListMatieresQuery,
} from './matiere.validation.js';

export interface MatiereContext {
  schemaName: string;
  etablissementId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

// ══════════════════════════════════════════
// INCLUDES
// ══════════════════════════════════════════

const matiereInclude = {
  niveau: { select: { id: true, nom: true, code: true, ordre: true } },
  _count: {
    select: {
      notes: true,
      affectations: true,
      emploisTemps: true,
      reglesEvaluation: true,
      documents: true,
      groupesTD: true,
    },
  },
} as const;

/**
 * Include détaillé pour la fiche matière : tout ce qu'il faut pour
 * afficher le déroulement, les professeurs et l'emploi du temps.
 */
const matiereDetailInclude = {
  niveau: { select: { id: true, nom: true, code: true, ordre: true } },
  // ─── Professeurs affectés à cette matière ───
  affectations: {
    where: { estActive: true },
    include: {
      enseignant: {
        select: {
          id: true,
          matricule: true,
          prenom: true,
          nom: true,
          specialite: true,
          photo: true,
          estActif: true,
        },
      },
      classe: {
        select: {
          id: true,
          nom: true,
          code: true,
          salle: true,
          niveau: { select: { id: true, nom: true, code: true } },
        },
      },
      anneeScolaire: {
        select: { id: true, nom: true, estActive: true },
      },
    },
    orderBy: [{ enseignant: { nom: 'asc' } }],
  },
  // ─── Créneaux d'emploi du temps programmés ───
  emploisTemps: {
    where: { estActive: true },
    include: {
      classe: {
        select: {
          id: true,
          nom: true,
          code: true,
          salle: true,
        },
      },
      enseignant: {
        select: {
          id: true,
          matricule: true,
          prenom: true,
          nom: true,
          photo: true,
        },
      },
    },
    orderBy: [{ jour: 'asc' }, { heureDebut: 'asc' }],
  },
  // ─── Règles d'évaluation (aperçu) ───
  reglesEvaluation: {
    take: 10,
    orderBy: { nom: 'asc' },
  },
  // ─── Documents (aperçu) ───
  documents: {
    take: 5,
    orderBy: { createdAt: 'desc' },
  },
  // ─── Compteurs ───
  _count: {
    select: {
      notes: true,
      affectations: true,
      emploisTemps: true,
      reglesEvaluation: true,
      documents: true,
      groupesTD: true,
    },
  },
} as const;

// ══════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════

/**
 * Résout la valeur de coefficient :
 * - `undefined` (non fourni) → fallback 1.0
 * - `null` (fourni explicitement) → null (matière générique primaire)
 * - `number` (fourni) → valeur
 */
function resolveCoefficient(value: number | null | undefined): number | null {
  if (value === undefined) return 1.0;
  return value;
}

function resolveDureeCours(value: number | null | undefined): number | null {
  if (value === undefined) return 60;
  return value;
}

/**
 * Formate le nom complet d'un enseignant.
 */
function nomEnseignant(e: any): string {
  if (!e) return '—';
  return `${e.prenom ?? ''} ${e.nom ?? ''}`.trim();
}

// ══════════════════════════════════════════
// SERVICE
// ══════════════════════════════════════════

export class MatiereService {
  // ══════════════════════════════════════════
  // CREATE (+ affectation optionnelle d'enseignant)
  // ══════════════════════════════════════════

  async create(ctx: MatiereContext, input: CreateMatiereInput) {
    const client = await getClient(ctx.schemaName);

    // 1. Vérifier le niveau
    const niveau = await client.niveau.findUnique({
      where: { id: input.niveauId },
      select: { id: true },
    });
    if (!niveau) throw new AppError('Niveau introuvable', 404);

    // 2. Vérifier l'unicité du code
    const dup = await client.matiere.findUnique({
      where: { code: input.code },
      select: { id: true },
    });
    if (dup) {
      throw new AppError(`Le code "${input.code}" est déjà utilisé`, 409);
    }

    // 3. Si un enseignant est fourni, le vérifier AVANT la création
    let enseignant: { id: string } | null = null;
    if (input.enseignantId) {
      enseignant = await client.enseignant.findUnique({
        where: { id: input.enseignantId },
        select: { id: true },
      });
      if (!enseignant) {
        throw new AppError('Enseignant introuvable', 404);
      }
    }

    // 4. Si une affectation est demandée, il faut aussi une classe + année
    if (input.enseignantId && (!input.classeId || !input.anneeScolaireId)) {
      throw new AppError(
        'Pour affecter un enseignant, fournissez aussi classeId et anneeScolaireId',
        400
      );
    }

    try {
      const result = await client.$transaction(async (tx: any) => {
        // 4.1. Créer la matière
        const matiere = await tx.matiere.create({
          data: {
            nom: input.nom.trim(),
            code: input.code.trim().toUpperCase(),
            niveauId: input.niveauId,
            coefficient: resolveCoefficient(input.coefficient),
            dureeCours: resolveDureeCours(input.dureeCours),
            description: input.description ?? null,
            estActive: input.estActive ?? true,
          },
          include: matiereInclude,
        });

        // 4.2. Créer l'affectation si demandé
        let affectation = null;
        if (input.enseignantId && input.classeId && input.anneeScolaireId) {
          // Vérifier que la classe et l'année existent
          const classe = await tx.classe.findUnique({
            where: { id: input.classeId },
            select: { id: true },
          });
          if (!classe) throw new AppError('Classe introuvable', 404);

          const annee = await tx.anneeScolaire.findUnique({
            where: { id: input.anneeScolaireId },
            select: { id: true },
          });
          if (!annee) throw new AppError('Année scolaire introuvable', 404);

          affectation = await tx.affectationEnseignant.create({
            data: {
              enseignantId: input.enseignantId,
              classeId: input.classeId,
              matiereId: matiere.id,
              anneeScolaireId: input.anneeScolaireId,
              heuresHebdo: input.heuresHebdo ?? 0,
              estPrincipal: false,
              valableDu: new Date(),
              estActive: true,
            },
            include: {
              enseignant: {
                select: {
                  id: true,
                  matricule: true,
                  prenom: true,
                  nom: true,
                },
              },
              classe: { select: { id: true, nom: true, code: true } },
            },
          });
        }

        return { matiere, affectation };
      });

      return {
        ...result.matiere,
        _affectation: result.affectation,
      };
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError('Ce code de matière est déjà utilisé', 409);
      }
      if (err?.code === 'P2003') {
        throw new AppError('Référence invalide (niveau inexistant)', 400);
      }
      throw err;
    }
  }

  // ══════════════════════════════════════════
  // LIST (enrichie)
  // ══════════════════════════════════════════

  async findAll(ctx: MatiereContext, q: ListMatieresQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};
    if (q.search) {
      where.OR = [
        { nom: { contains: q.search, mode: 'insensitive' } },
        { code: { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
      ];
    }
    if (q.niveauId) where.niveauId = q.niveauId;
    if (q.estActive !== undefined) where.estActive = q.estActive;
    if (q.estArchive !== undefined) where.estArchive = q.estArchive;

    const allowedSort = ['nom', 'code', 'coefficient', 'createdAt'];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'nom';
    const sortOrder = q.sortOrder === 'desc' ? 'desc' : 'asc';

    const [total, data] = await Promise.all([
      client.matiere.count({ where }),
      client.matiere.findMany({
        where,
        include: matiereInclude,
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

  // ══════════════════════════════════════════
  // GET BY ID (enrichi — déroulement + profs + emploi du temps)
  // ══════════════════════════════════════════

  async findById(ctx: MatiereContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const matiere = await client.matiere.findUnique({
      where: { id },
      include: matiereDetailInclude,
    });

    if (!matiere) throw new AppError('Matière introuvable', 404);

    // ─── Enrichir : professeurs uniques ───
    const professeursMap = new Map<string, any>();
    for (const aff of matiere.affectations ?? []) {
      if (aff.enseignant && !professeursMap.has(aff.enseignant.id)) {
        professeursMap.set(aff.enseignant.id, aff.enseignant);
      }
    }
    const professeurs = Array.from(professeursMap.values());

    // ─── Enrichir : emploi du temps groupé par jour ───
    const JOURS_ORDER = [
      'LUNDI',
      'MARDI',
      'MERCREDI',
      'JEUDI',
      'VENDREDI',
      'SAMEDI',
      'DIMANCHE',
    ];
    const emploiTempsParJour = JOURS_ORDER.map((jour) => ({
      jour,
      cours: (matiere.emploisTemps ?? []).filter(
        (c: any) => c.jour === jour
      ),
    })).filter((d) => d.cours.length > 0);

    // ─── Enrichir : classes concernées ───
    const classesMap = new Map<string, any>();
    for (const aff of matiere.affectations ?? []) {
      if (aff.classe && !classesMap.has(aff.classe.id)) {
        classesMap.set(aff.classe.id, aff.classe);
      }
    }
    for (const cr of matiere.emploisTemps ?? []) {
      if (cr.classe && !classesMap.has(cr.classe.id)) {
        classesMap.set(cr.classe.id, cr.classe);
      }
    }
    const classes = Array.from(classesMap.values());

    // ─── Enrichir : résumé ───
    const stats = {
      nombreProfesseurs: professeurs.length,
      nombreAffectations: matiere.affectations?.length ?? 0,
      nombreCreneaux: matiere.emploisTemps?.length ?? 0,
      nombreClasses: classes.length,
      nombreNotes: matiere._count?.notes ?? 0,
      nombreReglesEvaluation: matiere._count?.reglesEvaluation ?? 0,
      nombreDocuments: matiere._count?.documents ?? 0,
      nombreGroupesTD: matiere._count?.groupesTD ?? 0,
    };

    return {
      ...matiere,
      // Aplati pour le frontend
      professeurs,
      classes,
      emploiTempsParJour,
      // Stats dérivées
      _stats: stats,
    };
  }

  // ══════════════════════════════════════════
  // AFFECTER UN ENSEIGNANT (ajout après création)
  // ══════════════════════════════════════════

  async affecterEnseignant(
    ctx: MatiereContext,
    matiereId: string,
    input: {
      enseignantId: string;
      classeId: string;
      anneeScolaireId: string;
      heuresHebdo?: number;
    }
  ) {
    const client = await getClient(ctx.schemaName);

    // 1. Vérifier matière
    const matiere = await client.matiere.findUnique({
      where: { id: matiereId },
      select: { id: true, nom: true },
    });
    if (!matiere) throw new AppError('Matière introuvable', 404);

    // 2. Vérifier enseignant
    const enseignant = await client.enseignant.findUnique({
      where: { id: input.enseignantId },
      select: { id: true, prenom: true, nom: true },
    });
    if (!enseignant) throw new AppError('Enseignant introuvable', 404);

    // 3. Vérifier classe + année
    const classe = await client.classe.findUnique({
      where: { id: input.classeId },
      select: { id: true, nom: true },
    });
    if (!classe) throw new AppError('Classe introuvable', 404);

    const annee = await client.anneeScolaire.findUnique({
      where: { id: input.anneeScolaireId },
      select: { id: true },
    });
    if (!annee) throw new AppError('Année scolaire introuvable', 404);

    // 4. Vérifier doublon
    const dup = await client.affectationEnseignant.findFirst({
      where: {
        enseignantId: input.enseignantId,
        classeId: input.classeId,
        matiereId,
        anneeScolaireId: input.anneeScolaireId,
      },
      select: { id: true },
    });
    if (dup) {
      throw new AppError(
        'Cet enseignant est déjà affecté à cette matière pour cette classe et cette année',
        409
      );
    }

    // 5. Créer l'affectation
    return client.affectationEnseignant.create({
      data: {
        enseignantId: input.enseignantId,
        classeId: input.classeId,
        matiereId,
        anneeScolaireId: input.anneeScolaireId,
        heuresHebdo: input.heuresHebdo ?? 0,
        valableDu: new Date(),
        estActive: true,
      },
      include: {
        enseignant: {
          select: {
            id: true,
            matricule: true,
            prenom: true,
            nom: true,
            photo: true,
          },
        },
        classe: { select: { id: true, nom: true, code: true } },
        anneeScolaire: { select: { id: true, nom: true, estActive: true } },
      },
    });
  }

  // ══════════════════════════════════════════
  // UPDATE
  // ══════════════════════════════════════════

  async update(ctx: MatiereContext, id: string, input: UpdateMatiereInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.matiere.findUnique({
      where: { id },
      select: { id: true, code: true },
    });
    if (!existing) throw new AppError('Matière introuvable', 404);

    if (input.niveauId) {
      const niveau = await client.niveau.findUnique({
        where: { id: input.niveauId },
        select: { id: true },
      });
      if (!niveau) throw new AppError('Niveau introuvable', 404);
    }

    if (input.code && input.code !== existing.code) {
      const dup = await client.matiere.findUnique({
        where: { code: input.code },
        select: { id: true },
      });
      if (dup) throw new AppError('Ce code est déjà utilisé', 409);
    }

    const patch: any = {};
    if (input.nom !== undefined) patch.nom = input.nom.trim();
    if (input.code !== undefined) patch.code = input.code.trim().toUpperCase();
    if (input.niveauId !== undefined) patch.niveauId = input.niveauId;
    if (input.coefficient !== undefined) patch.coefficient = input.coefficient;
    if (input.dureeCours !== undefined) patch.dureeCours = input.dureeCours;
    if (input.description !== undefined) patch.description = input.description;
    if (input.estActive !== undefined) patch.estActive = input.estActive;
    if (input.estArchive !== undefined) patch.estArchive = input.estArchive;

    try {
      return await client.matiere.update({
        where: { id },
        data: patch,
        include: matiereInclude,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError('Ce code est déjà utilisé', 409);
      }
      throw err;
    }
  }

  // ══════════════════════════════════════════
  // SOFT DELETE
  // ══════════════════════════════════════════

  async softDelete(ctx: MatiereContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.matiere.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new AppError('Matière introuvable', 404);

    await client.matiere.update({
      where: { id },
      data: { estActive: false, estArchive: true },
    });

    return { id, message: 'Matière archivée' };
  }

  // ══════════════════════════════════════════
  // HARD DELETE
  // ══════════════════════════════════════════

  async hardDelete(ctx: MatiereContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.matiere.findUnique({
      where: { id },
      select: { id: true, nom: true },
    });
    if (!existing) throw new AppError('Matière introuvable', 404);

    const [nbNotes, nbAffectations, nbEmplois, nbRegles] = await Promise.all([
      client.note.count({ where: { matiereId: id } }),
      client.affectationEnseignant.count({ where: { matiereId: id } }),
      client.emploiTemps.count({ where: { matiereId: id } }),
      client.regleEvaluation.count({ where: { matiereId: id } }),
    ]);

    const total = nbNotes + nbAffectations + nbEmplois + nbRegles;
    if (total > 0) {
      throw new AppError(
        `Suppression impossible : référencée par ${nbNotes} note(s), ${nbAffectations} affectation(s), ${nbEmplois} emploi(s) du temps, ${nbRegles} règle(s). Archivez à la place.`,
        409
      );
    }

    await client.matiere.delete({ where: { id } });
    return { id, message: 'Matière supprimée définitivement' };
  }
}

export const matiereService = new MatiereService();