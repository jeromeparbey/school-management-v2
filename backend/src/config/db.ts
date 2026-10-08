// src/config/db.ts
// ⚠️ Ce fichier est une passerelle de compatibilité.
// Pour le multi-schéma, utilisez directement :
//   - `globalPrisma` (depuis `./global-db`) pour le catalogue
//   - `getTenantClient(schemaName)` (depuis `./tenant-db`) pour les données d'une école

import 'dotenv/config';
import {
  globalPrisma,
  connectGlobalDB,
  disconnectGlobalDB,
} from './global-db';
import {
  getTenantClient,
  disconnectAllTenants,
} from './tenant-db';

// ============================================
// EXPORTS DE COMPATIBILITÉ
// ============================================

/**
 * Client Prisma "par défaut" → pointe vers le CATALOGUE GLOBAL (schéma public).
 *
 * ⚠️ Pour accéder aux données d'une école (élèves, notes, paiements...),
 * utilisez `getTenantClient(schemaName)`.
 */
export const prisma = globalPrisma;

/**
 * Connexion au catalogue global.
 */
export async function connectDB() {
  try {
    await connectGlobalDB();
    return globalPrisma;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    throw error;
  }
}

/**
 * Déconnexion du catalogue global + de tous les clients tenant en cache.
 */
export async function disconnectDB() {
  try {
    await disconnectGlobalDB();
    await disconnectAllTenants();
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
  }
}

// ============================================
// RÉ-EXPORTS POUR LE MULTI-SCHÉMA
// ============================================

export { globalPrisma, getTenantClient };

/**
 * Alias sémantique pour plus de clarté dans le code métier.
 *
 * @example
 * ```typescript
 * import { getTenantPrisma } from '../config/db';
 *
 * const tenantPrisma = await getTenantPrisma(etablissement.schemaName);
 * const eleves = await tenantPrisma.eleve.findMany();
 * ```
 */
export const getTenantPrisma = getTenantClient;