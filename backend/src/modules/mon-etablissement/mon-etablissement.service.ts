// backend/src/modules/mon-etablissement/mon-etablissement.service.ts

import { globalPrisma } from '../../config/global-db.js';
import { Prisma } from '../../../prisma/generated/global-client/index.js';
import { AppError } from '../../utils/AppError.js';

export const monEtablissementService = {
  // ─────────────────────────────────────────────────────
  // GET — Lire son établissement
  // ─────────────────────────────────────────────────────
  async getMonEtablissement(etablissementId: string) {
    const etablissement = await globalPrisma.etablissement.findUnique({
      where: { id: etablissementId },
      select: {
        id: true,
        nom: true,
        code: true,
        schemaName: true,
        type: true,
        logo: true,
        adresse: true,
        ville: true,
        pays: true,
        telephone: true,
        email: true,
        siteWeb: true,
        numeroAgrement: true,
        devise: true,
        fuseauHoraire: true,
        formatDate: true,
        joursOuvrables: true,
        heureDebut: true,
        heureFin: true,
        toleranceRetard: true,
        tauxHeureSup: true,
        estActif: true,
        estArchive: true,
        planAbonnement: true,
        dateExpiration: true,
        maxUtilisateurs: true,
        statutProvisionnement: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!etablissement) {
      throw new AppError('Établissement introuvable', 404);
    }

    return etablissement;
  },

  // ─────────────────────────────────────────────────────
  // UPDATE — Modifier son établissement
  // ─────────────────────────────────────────────────────
  /**
   * ⚠️ Champs IMMUABLES (ignorés si présents dans le body) :
   *   - id, code, schemaName
   *   - planAbonnement, maxUtilisateurs (gérés par SUPER_ADMIN)
   *   - dateExpiration, statutProvisionnement
   *   - estActif, estArchive (gérés par SUPER_ADMIN)
   *
   * ✅ Champs MODIFIABLES par le directeur :
   *   - nom, logo, adresse, ville, pays
   *   - telephone, email, siteWeb, numeroAgrement
   *   - devise, fuseauHoraire, formatDate
   *   - joursOuvrables, heureDebut, heureFin
   *   - toleranceRetard, tauxHeureSup
   */
  async updateMonEtablissement(
    etablissementId: string,
    data: Record<string, any>
  ) {
    // Vérifier que l'établissement existe
    const existing = await globalPrisma.etablissement.findUnique({
      where: { id: etablissementId },
      select: { id: true, schemaName: true },
    });

    if (!existing) {
      throw new AppError('Établissement introuvable', 404);
    }

    // 🔥 Filtrer les champs autorisés
    const allowedFields = [
      'nom',
      'logo',
      'adresse',
      'ville',
      'pays',
      'telephone',
      'email',
      'siteWeb',
      'numeroAgrement',
      'devise',
      'fuseauHoraire',
      'formatDate',
      'joursOuvrables',
      'heureDebut',
      'heureFin',
      'toleranceRetard',
      'tauxHeureSup',
    ];

    const cleanData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        cleanData[field] = data[field];
      }
    }

    if (Object.keys(cleanData).length === 0) {
      throw new AppError(
        'Aucun champ valide à mettre à jour. Champs autorisés : ' +
          allowedFields.join(', '),
        400
      );
    }

    // Nettoyage : undefined → null pour les champs optionnels
    const finalData: Prisma.EtablissementUpdateInput = {};
    for (const [key, value] of Object.entries(cleanData)) {
      if (value === undefined) continue;

      // String vide → null
      if (value === '' && typeof value === 'string') {
        (finalData as any)[key] = null;
      } else {
        (finalData as any)[key] = value;
      }
    }

    const updated = await globalPrisma.etablissement.update({
      where: { id: etablissementId },
      data: finalData,
      select: {
        id: true,
        nom: true,
        code: true,
        schemaName: true,
        type: true,
        logo: true,
        adresse: true,
        ville: true,
        pays: true,
        telephone: true,
        email: true,
        siteWeb: true,
        numeroAgrement: true,
        devise: true,
        fuseauHoraire: true,
        formatDate: true,
        joursOuvrables: true,
        heureDebut: true,
        heureFin: true,
        toleranceRetard: true,
        tauxHeureSup: true,
        estActif: true,
        estArchive: true,
        planAbonnement: true,
        dateExpiration: true,
        maxUtilisateurs: true,
        statutProvisionnement: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  },
};