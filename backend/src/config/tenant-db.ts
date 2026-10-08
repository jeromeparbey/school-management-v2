// src/config/tenant-db.ts
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';  // ← AJOUTÉ

// Cache des clients par schéma
const tenantClients = new Map<string, any>();

/**
 * Récupère un client Prisma pour un schéma tenant donné.
 */
export async function getTenantClient(schemaName: string) {
  // 1. Vérifier le cache
  if (tenantClients.has(schemaName)) {
    return tenantClients.get(schemaName);
  }

  // 2. Vérifier que le client généré existe
  const clientPath = path.join(
    process.cwd(),
    'prisma',
    'generated',
    'tenants',
    `${schemaName}-client`
  );

  if (!fs.existsSync(clientPath)) {
    throw new Error(
      `Client Prisma introuvable pour le schéma "${schemaName}". ` +
      `Le schéma n'a peut-être pas été provisionné. ` +
      `Chemin attendu : ${clientPath}`
    );
  }

  // 3. Convertir le chemin en URL file:// (compatible Windows + Linux)
  //    On pointe vers le fichier index.js du client
  const indexPath = path.join(clientPath, 'index.js');
  const clientUrl = pathToFileURL(indexPath).href;  // ← CONVERSION

  console.log(`   📦 Chargement du client : ${clientUrl}`);

  // 4. Importer le client via l'URL file://
  const { PrismaClient } = await import(clientUrl);

  // 5. Construire l'URL avec le schéma dans search_path
  const baseUrl = process.env.DATABASE_URL!;
  const separator = baseUrl.includes('?') ? '&' : '?';
  const connectionString = `${baseUrl}${separator}options=-csearch_path%3D${schemaName}`;

  const adapter = new PrismaPg({ connectionString });

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

  // 6. Mettre en cache
  tenantClients.set(schemaName, client);

  return client;
}

/**
 * Ferme tous les clients tenant (à appeler à l'arrêt du serveur)
 */
export async function disconnectAllTenants() {
  for (const [schema, client] of tenantClients) {
    await client.$disconnect();
    console.log(`✅ Déconnexion du tenant ${schema}`);
  }
  tenantClients.clear();
}