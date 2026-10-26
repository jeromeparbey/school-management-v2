// backend/src/modules/eleve/eleve.service.ts

import { getTenantClient } from '../../config/tenant-db';
import { AppError } from '../../utils/AppError';
import { compteService } from '../compte/compte.service';
import type {
  CreateEleveInput,
  UpdateEleveInput,
  ListElevesQuery,
} from './eleve.validation';

export interface EleveContext {
  schemaName: string;
  etablissementId: string;
}

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError(`Client tenant introuvable`, 500);
  return client;
}

// ──────────────────────────────────────────
// MATRICULE
// ──────────────────────────────────────────

async function generateMatricule(client: any): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `ELV-${year}-`;
  const last = await client.eleve.findFirst({
    where: { matricule: { startsWith: pattern } },
    orderBy: { matricule: 'desc' },
    select: { matricule: true },
  });
  let next = 1;
  if (last?.matricule) {
    const parts = last.matricule.split('-');
    next = parseInt(parts[parts.length - 1], 10) + 1;
  }
  return `${pattern}${String(next).padStart(4, '0')}`;
}

// ──────────────────────────────────────────
// RÉSOLUTION ANNÉE SCOLAIRE ACTIVE
// ──────────────────────────────────────────

async function resolveAnneeScolaireActive(
  client: any,
  anneeScolaireId?: string | null
): Promise<{ id: string; nom: string }> {
  if (anneeScolaireId) {
    const annee = await client.anneeScolaire.findUnique({
      where: { id: anneeScolaireId },
      select: { id: true, nom: true },
    });
    if (!annee) throw new AppError('Année scolaire introuvable', 404);
    return annee;
  }
  const active = await client.anneeScolaire.findFirst({
    where: { estActive: true, estArchive: false },
    select: { id: true, nom: true },
    orderBy: { dateDebut: 'desc' },
  });
  if (!active) {
    throw new AppError(
      "Aucune année scolaire active. Activez une année avant d'inscrire un élève.",
      400
    );
  }
  return active;
}

// ──────────────────────────────────────────
// RÉSOLUTION DU PLAN DE SCOLARITÉ POUR UNE CLASSE
// ──────────────────────────────────────────
//
// Priorité :
//   1) Plan lié directement à la classe (classeId = classe.id)
//   2) Plan lié au niveau de la classe (niveauId = classe.niveauId, classeId = null)
//   3) Aucun → retourne null (l'élève est créé sans assignment)
//
async function resolvePlanScolariteForClasse(
  client: any,
  classe: { id: string; niveauId: string },
  anneeScolaireId: string
): Promise<{ id: string; nom: string; montantTotal: number } | null> {
  // 1. Plan spécifique à la classe
  const planClasse = await client.planScolarite.findFirst({
    where: {
      anneeScolaireId,
      classeId: classe.id,
      estActif: true,
    },
    select: { id: true, nom: true, montantTotal: true },
    orderBy: { createdAt: 'desc' },
  });
  if (planClasse) return planClasse;

  // 2. Plan du niveau (non restreint à une classe)
  const planNiveau = await client.planScolarite.findFirst({
    where: {
      anneeScolaireId,
      niveauId: classe.niveauId,
      classeId: null,
      estActif: true,
    },
    select: { id: true, nom: true, montantTotal: true },
    orderBy: { createdAt: 'desc' },
  });
  if (planNiveau) return planNiveau;

  // 3. Aucun plan → null (pas d'erreur, l'élève peut être créé sans scolarité)
  return null;
}

// ──────────────────────────────────────────
// INCLUDES PARTAGÉS
// ──────────────────────────────────────────

const eleveInclude = {
  utilisateur: {
    select: {
      id: true,
      email: true,
      emailVerifie: true,
      estActif: true,
      derniereConnexion: true,
    },
  },
  inscriptions: {
    where: { estActive: true },
    include: {
      classe: { select: { id: true, nom: true, code: true } },
      anneeScolaire: { select: { id: true, nom: true, estActive: true } },
    },
    orderBy: { dateInscription: 'desc' as const },
    take: 5,
  },
  parents: {
    include: {
      parent: {
        include: {
          utilisateur: {
            select: {
              id: true,
              email: true,
              prenom: true,
              nom: true,
              telephone: true,
              photoProfil: true,
            },
          },
        },
      },
    },
    orderBy: [{ estPrincipal: 'desc' as const }, { createdAt: 'asc' as const }],
  },
  responsables: {
    orderBy: [{ estPrincipal: 'desc' as const }, { nom: 'asc' as const }],
  },
  _count: {
    select: {
      paiements: true,
      notes: true,
      presences: true,
      absences: true,
      empruntsLivres: true,
      bulletins: true,
      incidents: true,
      objectifs: true,
      reductions: true,
      communications: true,
      membresGroupesTD: true,
      objectifsSuivis: true,
    },
  },
} as const;

// ──────────────────────────────────────────
// SERVICE
// ──────────────────────────────────────────

export class EleveService {
  // ──────────────────────────────────────────
  // CREATE (avec inscription + assignment automatiques)
  // ──────────────────────────────────────────

  async create(ctx: EleveContext, input: CreateEleveInput) {
    const client = await getClient(ctx.schemaName);

    // 1. Valider la classe si fournie
    let classe: { id: string; niveauId: string; nom: string; code: string } | null = null;
    if (input.classeId) {
      classe = await client.classe.findUnique({
        where: { id: input.classeId },
        select: { id: true, niveauId: true, nom: true, code: true },
      });
      if (!classe) throw new AppError('Classe introuvable', 404);
    }

    // 2. Résoudre l'année scolaire active (ou celle fournie)
    const anneeScolaire = await resolveAnneeScolaireActive(
      client,
      input.anneeScolaireId
    );

    // 3. Résoudre le plan de scolarité pour cette classe (peut être null)
    let planScolarite: { id: string; nom: string; montantTotal: number } | null = null;
    if (classe) {
      planScolarite = await resolvePlanScolariteForClasse(
        client,
        classe,
        anneeScolaire.id
      );
    }

    // 4. Générer le matricule
    const matricule = await generateMatricule(client);

    // 5. Créer / lier le compte utilisateur
    const compteResult = await compteService.createOrLinkUser(ctx, {
      email: input.email,
      motDePasse: input.motDePasse,
      prenom: input.prenom,
      nom: input.nom,
      role: 'ELEVE',
      telephone: input.telephone,
      photoProfil: input.photo,
      matricule,
      hasProfilCheck: (u) => !!u.eleve,
    });

    try {
      // 6. Créer l'élève + inscription + assignment dans une transaction
      const eleve = await client.$transaction(async (tx: any) => {
        const created = await tx.eleve.create({
          data: {
            matricule,
            prenom: input.prenom.trim(),
            nom: input.nom.trim(),
            sexe: input.sexe,
            dateNaissance: input.dateNaissance,
            lieuNaissance: input.lieuNaissance ?? null,
            nationalite: input.nationalite ?? null,
            adresse: input.adresse ?? null,
            telephone: input.telephone ?? null,
            email: compteResult.email,
            photo: input.photo ?? null,
            infoMedicale: input.infoMedicale ?? null,
            groupeSanguin: input.groupeSanguin ?? null,
            allergies: input.allergies ?? null,
            statut: input.statut ?? 'ACTIF',
            utilisateurId: compteResult.utilisateurId,
          },
        });

        // 6a. Inscription automatique si classe fournie
        if (classe) {
          await tx.inscription.create({
            data: {
              eleveId: created.id,
              classeId: classe.id,
              anneeScolaireId: anneeScolaire.id,
              estActive: true,
            },
          });
        }

        // 6b. Assignment scolarité automatique si plan trouvé
        if (classe && planScolarite) {
          await tx.assignmentScolarite.create({
            data: {
              eleveId: created.id,
              planScolariteId: planScolarite.id,
              classeId: classe.id,
              anneeScolaireId: anneeScolaire.id,
              statut: 'ACTIF',
            },
          });
        }

        return created;
      });

      // 7. Recharger avec les includes complets
      const eleveComplet = await client.eleve.findUnique({
        where: { id: eleve.id },
        include: eleveInclude,
      });

      // 8. Signaler si un plan manquait (info non bloquante)
      if (classe && !planScolarite) {
        // On pourrait logger / notifier ici. On retourne juste l'info.
        return {
          ...eleveComplet,
          _warnings: [
            `Aucun plan de scolarité actif trouvé pour la classe ${classe.nom} (${classe.code}). ` +
              `L'élève a été inscrit mais aucun assignment de scolarité n'a été créé.`,
          ],
        };
      }

      return eleveComplet;
    } catch (err: any) {
      // Rollback : supprimer l'utilisateur créé si l'élève échoue
      if (compteResult.created && compteResult.utilisateurId) {
        await compteService.deleteLinkedUser(ctx, compteResult.utilisateurId);
      }
      if (err?.code === 'P2002') {
        throw new AppError(
          err.meta?.target?.includes('email')
            ? 'Cet email est déjà utilisé'
            : 'Ce matricule existe déjà',
          409
        );
      }
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // LIST
  // ──────────────────────────────────────────

  async findAll(ctx: EleveContext, q: ListElevesQuery) {
    const client = await getClient(ctx.schemaName);

    const where: any = {};

    if (q.search) {
      where.OR = [
        { nom: { contains: q.search, mode: 'insensitive' } },
        { prenom: { contains: q.search, mode: 'insensitive' } },
        { matricule: { contains: q.search, mode: 'insensitive' } },
        { email: { contains: q.search, mode: 'insensitive' } },
        { telephone: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    if (q.statut) where.statut = q.statut;
    if (q.sexe) where.sexe = q.sexe;
    if (q.hasCompte === true) where.utilisateurId = { not: null };
    if (q.hasCompte === false) where.utilisateurId = null;

    if (q.classeId || q.anneeScolaireId) {
      where.inscriptions = {
        some: {
          estActive: true,
          ...(q.classeId && { classeId: q.classeId }),
          ...(q.anneeScolaireId && { anneeScolaireId: q.anneeScolaireId }),
        },
      };
    }

    const allowedSort = ['nom', 'prenom', 'matricule', 'dateNaissance', 'createdAt'];
    const sortBy = allowedSort.includes(q.sortBy) ? q.sortBy : 'createdAt';
    const sortOrder = q.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await Promise.all([
      client.eleve.count({ where }),
      client.eleve.findMany({
        where,
        include: eleveInclude,
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

  async findById(ctx: EleveContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const eleve = await client.eleve.findUnique({
      where: { id },
      include: {
        ...eleveInclude,
        inscriptions: {
          include: {
            classe: { select: { id: true, nom: true, code: true } },
            anneeScolaire: {
              select: { id: true, nom: true, estActive: true },
            },
          },
          orderBy: { dateInscription: 'desc' },
        },
        // ✅ Assignment scolarité + plan
        assignmentsScolarite: {
          include: {
            planScolarite: {
              select: {
                id: true,
                nom: true,
                montantTotal: true,
                devise: true,
                fraisInscription: true,
                fraisScolarite: true,
              },
            },
            anneeScolaire: { select: { id: true, nom: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        bulletins: {
          take: 5,
          orderBy: { genereLe: 'desc' },
          include: {
            periode: { select: { id: true, nom: true } },
            anneeScolaire: { select: { id: true, nom: true } },
          },
        },
        empruntsLivres: {
          take: 5,
          orderBy: { dateEmprunt: 'desc' },
          include: {
            livre: { select: { id: true, titre: true, auteur: true } },
          },
        },
        incidents: {
          take: 5,
          orderBy: { dateIncident: 'desc' },
        },
        objectifs: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        reductions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!eleve) throw new AppError('Élève introuvable', 404);
    return eleve;
  }

  // ──────────────────────────────────────────
  // UPDATE (gère aussi le changement de classe)
  // ──────────────────────────────────────────

  async update(ctx: EleveContext, id: string, input: UpdateEleveInput) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.eleve.findUnique({
      where: { id },
      select: {
        id: true,
        utilisateurId: true,
        matricule: true,
        email: true,
      },
    });
    if (!existing) throw new AppError('Élève introuvable', 404);

    let utilisateurId = existing.utilisateurId;

    // Création de compte a posteriori
    if (!utilisateurId && input.createCompte) {
      if (!input.email) {
        throw new AppError('Email requis pour créer un compte utilisateur', 400);
      }

      const compteResult = await compteService.createOrLinkUser(ctx, {
        email: input.email,
        motDePasse: input.motDePasse,
        prenom: input.prenom ?? '',
        nom: input.nom ?? '',
        role: 'ELEVE',
        telephone: input.telephone,
        photoProfil: input.photo,
        matricule: existing.matricule,
        hasProfilCheck: (u) => !!u.eleve,
      });

      utilisateurId = compteResult.utilisateurId;
    }

    // Mise à jour de l'utilisateur lié
    if (utilisateurId) {
      await compteService.updateLinkedUser(ctx, utilisateurId, {
        email: input.email,
        motDePasse: input.motDePasse,
        prenom: input.prenom,
        nom: input.nom,
        telephone: input.telephone,
        photoProfil: input.photo,
      });
    }

    // Mise à jour du profil élève
    const patch: any = {};
    if (input.prenom !== undefined) patch.prenom = input.prenom.trim();
    if (input.nom !== undefined) patch.nom = input.nom.trim();
    if (input.sexe !== undefined) patch.sexe = input.sexe;
    if (input.dateNaissance !== undefined)
      patch.dateNaissance = input.dateNaissance;
    if (input.lieuNaissance !== undefined)
      patch.lieuNaissance = input.lieuNaissance;
    if (input.nationalite !== undefined) patch.nationalite = input.nationalite;
    if (input.adresse !== undefined) patch.adresse = input.adresse;
    if (input.telephone !== undefined) patch.telephone = input.telephone;
    if (input.email !== undefined)
      patch.email = input.email?.toLowerCase().trim() ?? null;
    if (input.photo !== undefined) patch.photo = input.photo;
    if (input.infoMedicale !== undefined)
      patch.infoMedicale = input.infoMedicale;
    if (input.groupeSanguin !== undefined)
      patch.groupeSanguin = input.groupeSanguin;
    if (input.allergies !== undefined) patch.allergies = input.allergies;
    if (input.statut !== undefined) patch.statut = input.statut;
    if (utilisateurId && utilisateurId !== existing.utilisateurId) {
      patch.utilisateurId = utilisateurId;
    }

    // 🔁 Gestion du changement de classe (optionnel via input.classeId)
    // Si une nouvelle classe est fournie, on :
    //   - désactive les inscriptions actives
    //   - crée une nouvelle inscription
    //   - crée un nouvel assignment si un plan existe
    const changementClasse = (input as any).classeId !== undefined;
    const nouvelleClasseId: string | null = (input as any).classeId ?? null;

    try {
      const updated = await client.$transaction(async (tx: any) => {
        const eleveMaj = await tx.eleve.update({
          where: { id },
          data: patch,
        });

        if (changementClasse) {
          if (nouvelleClasseId) {
            const classe = await tx.classe.findUnique({
              where: { id: nouvelleClasseId },
              select: { id: true, niveauId: true, nom: true, code: true },
            });
            if (!classe) throw new AppError('Classe introuvable', 404);

            const anneeScolaire = await resolveAnneeScolaireActive(
              tx,
              (input as any).anneeScolaireId ?? null
            );

            // Désactiver les inscriptions actives
            await tx.inscription.updateMany({
              where: { eleveId: id, estActive: true },
              data: { estActive: false },
            });

            // Créer la nouvelle inscription
            await tx.inscription.create({
              data: {
                eleveId: id,
                classeId: classe.id,
                anneeScolaireId: anneeScolaire.id,
                estActive: true,
              },
            });

            // Résoudre le plan et créer l'assignment si trouvé
            const plan = await resolvePlanScolariteForClasse(
              tx,
              classe,
              anneeScolaire.id
            );

            if (plan) {
              // Éviter les doublons
              const deja = await tx.assignmentScolarite.findFirst({
                where: {
                  eleveId: id,
                  planScolariteId: plan.id,
                  anneeScolaireId: anneeScolaire.id,
                },
                select: { id: true },
              });
              if (!deja) {
                await tx.assignmentScolarite.create({
                  data: {
                    eleveId: id,
                    planScolariteId: plan.id,
                    classeId: classe.id,
                    anneeScolaireId: anneeScolaire.id,
                    statut: 'ACTIF',
                  },
                });
              }
            }
          } else {
            // nouvelleClasseId === null → on retire l'élève de sa classe
            await tx.inscription.updateMany({
              where: { eleveId: id, estActive: true },
              data: { estActive: false },
            });
          }
        }

        return eleveMaj;
      });

      return client.eleve.findUnique({
        where: { id: updated.id },
        include: eleveInclude,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new AppError('Cet email est déjà utilisé', 409);
      }
      throw err;
    }
  }

  // ──────────────────────────────────────────
  // SOFT DELETE
  // ──────────────────────────────────────────

  async softDelete(ctx: EleveContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.eleve.findUnique({
      where: { id },
      select: { id: true, utilisateurId: true, statut: true },
    });
    if (!existing) throw new AppError('Élève introuvable', 404);

    if (existing.statut === 'ARCHIVE') {
      return { id, message: 'Élève déjà archivé' };
    }

    await client.eleve.update({
      where: { id },
      data: { statut: 'ARCHIVE' },
    });

    if (existing.utilisateurId) {
      await client.utilisateur.update({
        where: { id: existing.utilisateurId },
        data: { estActif: false, jetonActualisation: null },
      });
    }

    return { id, message: 'Élève archivé et compte désactivé' };
  }

  // ──────────────────────────────────────────
  // HARD DELETE
  // ──────────────────────────────────────────

  async hardDelete(ctx: EleveContext, id: string) {
    const client = await getClient(ctx.schemaName);

    const existing = await client.eleve.findUnique({
      where: { id },
      select: { id: true, utilisateurId: true, matricule: true },
    });
    if (!existing) throw new AppError('Élève introuvable', 404);

    const [
      nbInscriptions,
      nbPaiements,
      nbNotes,
      nbBulletins,
      nbPresences,
      nbAbsences,
      nbIncidents,
      nbEmprunts,
      nbAssignments,
    ] = await Promise.all([
      client.inscription.count({ where: { eleveId: id } }),
      client.paiement.count({ where: { eleveId: id } }),
      client.note.count({ where: { eleveId: id } }),
      client.bulletin.count({ where: { eleveId: id } }),
      client.presenceEleve.count({ where: { eleveId: id } }),
      client.absenceEleve.count({ where: { eleveId: id } }),
      client.incident.count({ where: { eleveId: id } }),
      client.empruntLivre.count({ where: { eleveId: id } }),
      client.assignmentScolarite.count({ where: { eleveId: id } }),
    ]);

    const total =
      nbInscriptions +
      nbPaiements +
      nbNotes +
      nbBulletins +
      nbPresences +
      nbAbsences +
      nbIncidents +
      nbEmprunts +
      nbAssignments;

    if (total > 0) {
      throw new AppError(
        `Suppression impossible : ${nbInscriptions} inscription(s), ` +
          `${nbPaiements} paiement(s), ${nbNotes} note(s), ` +
          `${nbBulletins} bulletin(s), ${nbPresences} présence(s), ` +
          `${nbAbsences} absence(s), ${nbIncidents} incident(s), ` +
          `${nbEmprunts} emprunt(s), ${nbAssignments} assignment(s). ` +
          `Archivez l'élève à la place.`,
        409
      );
    }

    const utilisateurId = existing.utilisateurId;

    await client.eleve.delete({ where: { id } });

    if (utilisateurId) {
      await compteService.deleteLinkedUser(ctx, utilisateurId);
    }

    return { id, message: 'Élève et compte supprimés définitivement' };
  }
}

export const eleveService = new EleveService();