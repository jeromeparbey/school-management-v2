// backend/src/modules/mon-etablissement/mon-etablissement.routes.ts

import { Router } from 'express';
import { monEtablissementController } from './mon-etablissement.controller';
import { validateRequest } from '../../middleware/validateRequest';
import {
  updateMonEtablissementSchema,
} from './mon-etablissement.validation';

// ⚠️ Le loader dynamique (server.ts) applique :
//   - authMiddleware (authentification)
//   - rbacMiddleware (rôle DIRECTEUR uniquement via `roles` exporté plus bas)

const router = Router();

// ─── Lecture ───────────────────────────────────────────────
router.get(
  '/',
  monEtablissementController.getMonEtablissement
);

// ─── Modification ──────────────────────────────────────────
router.put(
  '/',
  validateRequest(updateMonEtablissementSchema),
  monEtablissementController.updateMonEtablissement
);

export default router;

// ============================================
// MÉTADONNÉES POUR LE LOADER DYNAMIQUE
// ============================================
export const publicRoute = false;
export const basePath = '/mon-etablissement';
export const roles: string[] = ['DIRECTEUR']; // 🔥 DIRECTEUR uniquement
export const disableAudit = true; // catalogue global → pas de logs_audit