// backend/src/modules/import/import.service.ts

import { getTenantClient } from '../../config/tenant-db';
import { AppError } from '../../utils/AppError';
import type {
  EleveImportRow,
  ImportResult,
} from './import.types';
import type { ImportElevesInput } from './import.validation';

// ═══════════════════════════════════════════════════════════
// TYPES INTERNES
// ═══════════════════════════════════════════════════════════

export interface ImportContext {
  schemaName: string;
  etablissementId: string;
}

interface ImportOptions {
  creerClassesAuto: boolean;
  creerAnneeAuto: boolean;
  creerPlanAuto: boolean;
  creerEcheancesAuto: boolean;
  creerResponsables: boolean;
  ignorerErreurs: boolean;
  dryRun: boolean;
}

interface RowResult {
  eleve: {
    id: string;
    matricule: string;
    prenom: string;
    nom: string;
  };
  classeCreee: boolean;
  planCree: boolean;
  echeancesCreees: number;
  inscriptionCreee: boolean;
  assignmentCree: boolean;
  responsableCree: boolean;
  warnings: string[];
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

async function getClient(schemaName: string) {
  const client = await getTenantClient(schemaName);
  if (!client) throw new AppError('Client tenant introuvable', 500);
  return client;
}

/**
 * Parse une date string en Date, retourne null si invalide.
 */
function parseDate(s: string | undefined | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Considère une valeur comme vide si undefined, null, '', ou 0.
 */
function isEmpty(v: unknown): boolean {
  return v === undefined || v === null || v === '' || v === 0;
}

/**
 * Génère le prochain matricule ELV-YYYY-NNNN.
 */
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

// ═══════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════

export class ImportService {
  /**
   * Import complet : crée élèves + classes + niveaux + année + plans + échéances.
   * Tout est transactionnel par ligne (une ligne = un élève + ses dépendances).
   */
  async importEleves(
    ctx: ImportContext,
    input: ImportElevesInput
  ): Promise<ImportResult> {
    const client = await getClient(ctx.schemaName);

    const opts: ImportOptions = {
      creerClassesAuto: true,
      creerAnneeAuto: true,
      creerPlanAuto: true,
      creerEcheancesAuto: true,
      creerResponsables: true,
      ignorerErreurs: false,
      dryRun: false,
      ...input.options,
    };

    const result: ImportResult = {
      totalLignes: input.lignes.length,
      succes: 0,
      erreurs: 0,
      warnings: 0,
      elevesCrees: 0,
      classesCreees: 0,
      plansCrees: 0,
      echeancesCreees: 0,
      inscriptionsCreees: 0,
      assignmentsCrees: 0,
      responsablesCrees: 0,
      details: [],
      erreursDetaillees: [],
    };

    // Cache : niveau par code, année par nom, classe par code, plan par clé composite
    const cacheNiveaux = new Map<string, string>(); // code → id
    const cacheAnnees = new Map<string, string>(); // nom → id
    const cacheClasses = new Map<string, string>(); // code → id
    const cachePlans = new Map<string, string>(); // classeId:anneeId → planId

    // Pour chaque ligne — transaction séparée pour isolation
    for (let i = 0; i < input.lignes.length; i++) {
      const ligne = input.lignes[i];
      const numeroLigne = i + 2; // +2 car ligne 1 = en-têtes Excel

      try {
        const rowResult = await client.$transaction(async (tx: any) => {
          return this.processLigne(
            tx,
            ligne,
            opts,
            cacheNiveaux,
            cacheAnnees,
            cacheClasses,
            cachePlans
          );
        });

        // Cumul des compteurs
        result.succes += 1;
        if (rowResult.eleve) result.elevesCrees += 1;
        if (rowResult.classeCreee) result.classesCreees += 1;
        if (rowResult.planCree) result.plansCrees += 1;
        result.echeancesCreees += rowResult.echeancesCreees ?? 0;
        if (rowResult.inscriptionCreee) result.inscriptionsCreees += 1;
        if (rowResult.assignmentCree) result.assignmentsCrees += 1;
        if (rowResult.responsableCree) result.responsablesCrees += 1;
        if (rowResult.warnings?.length) result.warnings += rowResult.warnings.length;

        result.details.push({
          ligne: numeroLigne,
          eleve: rowResult.eleve,
          warnings: rowResult.warnings,
        });
      } catch (err: unknown) {
        result.erreurs += 1;
        const message =
          err instanceof Error ? err.message : 'Erreur inconnue';

        result.details.push({ ligne: numeroLigne, erreur: message });
        result.erreursDetaillees.push({ ligne: numeroLigne, message });

        if (!opts.ignorerErreurs) {
          throw new AppError(
            `Import annulé à la ligne ${numeroLigne} : ${message}`,
            400
          );
        }
      }
    }

    return result;
  }

  // ──────────────────────────────────────────
  // TRAITEMENT D'UNE LIGNE
  // ──────────────────────────────────────────

  private async processLigne(
    tx: any,
    ligne: EleveImportRow,
    opts: ImportOptions,
    cacheNiveaux: Map<string, string>,
    cacheAnnees: Map<string, string>,
    cacheClasses: Map<string, string>,
    cachePlans: Map<string, string>
  ): Promise<RowResult> {
    const warnings: string[] = [];
    let classeCreee = false;
    let planCree = false;
    let echeancesCreees = 0;
    let inscriptionCreee = false;
    let assignmentCree = false;
    let responsableCree = false;

    // ─── 1. Résolution de l'année scolaire ───
    let anneeScolaireId: string | null = null;
    if (!isEmpty(ligne.anneeScolaireNom)) {
      const nom = ligne.anneeScolaireNom!;
      anneeScolaireId = cacheAnnees.get(nom) ?? null;

      if (!anneeScolaireId) {
        let annee = await tx.anneeScolaire.findFirst({
          where: { nom, estArchive: false },
          select: { id: true },
        });

        if (!annee && opts.creerAnneeAuto) {
          const dateDebut = parseDate(ligne.anneeScolaireDebut);
          const dateFin = parseDate(ligne.anneeScolaireFin);
          if (!dateDebut || !dateFin) {
            throw new Error(
              `Année "${nom}" : dateDebut et dateFin requis pour la création`
            );
          }
          annee = await tx.anneeScolaire.create({
            data: {
              nom,
              dateDebut,
              dateFin,
              estActive: false,
              estArchive: false,
            },
            select: { id: true },
          });
        }

        if (!annee) {
          throw new Error(`Année scolaire "${nom}" introuvable`);
        }
        anneeScolaireId = annee.id;
        cacheAnnees.set(nom, annee.id);
      }
    } else {
      // Prendre l'année active par défaut
      const active = await tx.anneeScolaire.findFirst({
        where: { estActive: true, estArchive: false },
        select: { id: true, nom: true },
        orderBy: { dateDebut: 'desc' },
      });
      if (!active) {
        throw new Error(
          "Aucune année scolaire active. Spécifiez anneeScolaireNom dans l'import."
        );
      }
      anneeScolaireId = active.id;
    }

    // ─── 2. Résolution du niveau ───
    let niveauId: string | null = null;
    if (!isEmpty(ligne.niveauCode) || !isEmpty(ligne.niveauNom)) {
      const code = (ligne.niveauCode ?? ligne.niveauNom ?? '')
        .toUpperCase()
        .trim();

      niveauId = cacheNiveaux.get(code) ?? null;
      if (!niveauId) {
        let niveau = await tx.niveau.findUnique({
          where: { code },
          select: { id: true },
        });
        if (!niveau) {
          niveau = await tx.niveau.create({
            data: {
              nom: ligne.niveauNom ?? code,
              code,
              ordre: 0,
            },
            select: { id: true },
          });
        }
        niveauId = niveau.id;
        cacheNiveaux.set(code, niveau.id);
      }
    }

    // ─── 3. Résolution / création de la classe ───
    let classeId: string | null = null;
    if (!isEmpty(ligne.classeCode) || !isEmpty(ligne.classeNom)) {
      const classeCode = (ligne.classeCode ?? ligne.classeNom!)
        .toUpperCase()
        .trim();

      classeId = cacheClasses.get(classeCode) ?? null;
      if (!classeId) {
        let classe = await tx.classe.findUnique({
          where: { code: classeCode },
          select: { id: true },
        });
        if (!classe) {
          if (!opts.creerClassesAuto) {
            throw new Error(
              `Classe "${classeCode}" introuvable (création désactivée)`
            );
          }
          if (!niveauId) {
            throw new Error(
              `Niveau requis pour créer la classe "${classeCode}"`
            );
          }
          if (!anneeScolaireId) {
            throw new Error(
              `Année scolaire requise pour créer la classe "${classeCode}"`
            );
          }
          classe = await tx.classe.create({
            data: {
              nom: ligne.classeNom ?? classeCode,
              code: classeCode,
              capacite: ligne.classeCapacite ?? null,
              salle: ligne.classeSalle ?? null,
              niveauId,
              anneeScolaireId,
              estActive: true,
            },
            select: { id: true },
          });
          classeCreee = true;
        }
        classeId = classe.id;
        cacheClasses.set(classeCode, classe.id);
      }
    }

    // ─── 4. Résolution / création du plan de scolarité ───
    let planId: string | null = null;
    if (
      !isEmpty(ligne.planNom) ||
      !isEmpty(ligne.planFraisInscription) ||
      !isEmpty(ligne.planFraisScolarite)
    ) {
      if (!classeId) {
        warnings.push('Plan de scolarité ignoré : aucune classe spécifiée');
      } else {
        const cacheKey = `${classeId}:${anneeScolaireId}`;
        planId = cachePlans.get(cacheKey) ?? null;

        if (!planId) {
          const existant = await tx.planScolarite.findFirst({
            where: { classeId, anneeScolaireId, estActif: true },
            select: { id: true },
          });

          if (existant) {
            planId = existant.id;
          } else if (opts.creerPlanAuto) {
            const fraisInscription = ligne.planFraisInscription ?? 0;
            const fraisScolarite = ligne.planFraisScolarite ?? 0;
            const montantTotal = fraisInscription + fraisScolarite;

            const plan = await tx.planScolarite.create({
              data: {
                nom:
                  ligne.planNom ??
                  `Plan ${ligne.classeNom ?? 'classe'}`,
                anneeScolaireId,
                classeId,
                niveauId,
                fraisInscription,
                fraisScolarite,
                montantTotal,
                devise: ligne.planDevise ?? 'XOF',
                estActif: true,
              },
              select: { id: true },
            });
            planId = plan.id;
            planCree = true;

            // ─── 5. Création des échéances (uniquement si nom + montant > 0) ───
            if (opts.creerEcheancesAuto) {
              const echeancesData: {
                nom: string;
                montant: number;
                dateLimite: Date;
                ordre: number;
              }[] = [];

              for (let n = 1; n <= 5; n++) {
                const nomEch = (ligne as any)[`echeance${n}Nom`] as
                  | string
                  | undefined;
                const montantEch = (ligne as any)[`echeance${n}Montant`] as
                  | number
                  | undefined;
                const dateLimiteEch = (ligne as any)[
                  `echeance${n}DateLimite`
                ] as string | undefined;

                // On crée l'échéance SEULEMENT si nom ET montant > 0
                if (
                  !isEmpty(nomEch) &&
                  !isEmpty(montantEch) &&
                  typeof montantEch === 'number' &&
                  montantEch > 0
                ) {
                  const dateLimite = parseDate(dateLimiteEch);
                  if (!dateLimite) {
                    warnings.push(
                      `Échéance ${n} ignorée : dateLimite invalide`
                    );
                    continue;
                  }
                  echeancesData.push({
                    nom: nomEch as string,
                    montant: montantEch,
                    dateLimite,
                    ordre: n,
                  });
                }
              }

              if (echeancesData.length > 0) {
                await tx.echeance.createMany({
                  data: echeancesData.map((e) => ({
                    planScolariteId: planId as string,
                    nom: e.nom,
                    montant: e.montant,
                    dateLimite: e.dateLimite,
                    ordre: e.ordre,
                    estPayee: false,
                  })),
                });
                echeancesCreees = echeancesData.length;
              }
            }
          }
          if (planId) cachePlans.set(cacheKey, planId);
        }
      }
    }

    // ─── 6. Création de l'élève ───
    const matricule = await generateMatricule(tx);
    const eleve = await tx.eleve.create({
      data: {
        matricule,
        prenom: ligne.prenom.trim(),
        nom: ligne.nom.trim(),
        sexe: ligne.sexe,
        dateNaissance: parseDate(ligne.dateNaissance) ?? new Date(),
        lieuNaissance: ligne.lieuNaissance ?? null,
        nationalite: ligne.nationalite ?? null,
        adresse: ligne.adresse ?? null,
        telephone: ligne.telephone ?? null,
        email: ligne.email ?? null,
        photo: ligne.photo ?? null,
        infoMedicale: ligne.infoMedicale ?? null,
        groupeSanguin: ligne.groupeSanguin ?? null,
        allergies: ligne.allergies ?? null,
        statut: 'ACTIF',
      },
      select: {
        id: true,
        matricule: true,
        prenom: true,
        nom: true,
      },
    });

    // ─── 7. Inscription ───
    if (classeId && anneeScolaireId) {
      const deja = await tx.inscription.findFirst({
        where: { eleveId: eleve.id, anneeScolaireId },
      });
      if (!deja) {
        await tx.inscription.create({
          data: {
            eleveId: eleve.id,
            classeId,
            anneeScolaireId,
            estActive: true,
          },
        });
        inscriptionCreee = true;
      }
    }

    // ─── 8. Assignment scolarité ───
    if (planId && anneeScolaireId) {
      const existing = await tx.assignmentScolarite.findFirst({
        where: {
          eleveId: eleve.id,
          planScolariteId: planId,
          anneeScolaireId,
        },
      });
      if (!existing) {
        await tx.assignmentScolarite.create({
          data: {
            eleveId: eleve.id,
            planScolariteId: planId,
            classeId,
            anneeScolaireId,
            statut: 'ACTIF',
          },
        });
        assignmentCree = true;
      }
    }

    // ─── 9. Responsable (parent) ───
    if (
      opts.creerResponsables &&
      !isEmpty(ligne.responsableNom) &&
      !isEmpty(ligne.responsablePrenom)
    ) {
      await tx.responsable.create({
        data: {
          prenom: ligne.responsablePrenom as string,
          nom: ligne.responsableNom as string,
          lien: ligne.responsableLien ?? 'Tuteur',
          telephone: ligne.responsableTelephone ?? '—',
          email: ligne.responsableEmail ?? null,
          profession: ligne.responsableProfession ?? null,
          estPrincipal: true,
          eleveId: eleve.id,
        },
      });
      responsableCree = true;
    }

    return {
      eleve,
      classeCreee,
      planCree,
      echeancesCreees,
      inscriptionCreee,
      assignmentCree,
      responsableCree,
      warnings,
    };
  }
}

export const importService = new ImportService();