// prisma/seed.ts
// Seed multi-schéma — Version RESET (dev) + auto-réparation

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { globalPrisma } from '../src/config/global-db';
import { provisioningService } from '../src/services/provisioning.service';
import { getTenantClient, disconnectAllTenants } from '../src/config/tenant-db';

// ============================================
// CONFIGURATION
// ============================================

const DEFAULT_PASSWORD = 'Test@1234';

const ETABLISSEMENT = {
  nom: 'École de Test',
  code: 'ETAB-TEST-01',
  ville: 'Abidjan',
  email: 'contact@ecole-test.ci',
  telephone: '+225 27 00 00 00 00',
};

/** Mode RESET : true = supprime tout, false = répare ce qui manque */
const RESET_MODE = process.env.SEED_RESET === 'true' || process.env.NODE_ENV === 'development';

// ============================================
// NETTOYAGE
// ============================================

async function cleanupEtablissement() {
  console.log('🧹 Nettoyage de l\'état précédent...');

  // 1. Chercher l'établissement existant
  const etablissement = await globalPrisma.etablissement.findUnique({
    where: { code: ETABLISSEMENT.code },
  });

  if (!etablissement) {
    console.log('   ⏭️  Aucun établissement à nettoyer\n');
    return;
  }

  const schemaName = etablissement.schemaName;

  // 2. Supprimer le schéma PostgreSQL (toutes les tables dedans)
  try {
    await globalPrisma.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`
    );
    console.log(`   ✅ Schéma PostgreSQL "${schemaName}" supprimé`);
  } catch (error) {
    console.log(`   ⚠️  Impossible de supprimer le schéma : ${(error as Error).message}`);
  }

  // 3. Supprimer les fichiers générés
  const tenantSchemaFile = path.join(
    process.cwd(),
    'prisma',
    'tenants',
    `${schemaName}.prisma`
  );
  const tenantClientDir = path.join(
    process.cwd(),
    'prisma',
    'generated',
    'tenants',
    `${schemaName}-client`
  );

  if (fs.existsSync(tenantSchemaFile)) {
    fs.unlinkSync(tenantSchemaFile);
    console.log(`   ✅ Fichier ${schemaName}.prisma supprimé`);
  }

  if (fs.existsSync(tenantClientDir)) {
    fs.rmSync(tenantClientDir, { recursive: true, force: true });
    console.log(`   ✅ Client Prisma ${schemaName}-client supprimé`);
  }

  // 4. Supprimer l'établissement du catalogue
  await globalPrisma.etablissement.delete({
    where: { id: etablissement.id },
  });
  console.log(`   ✅ Établissement "${etablissement.code}" supprimé du catalogue`);

  // 5. Supprimer aussi le SUPER_ADMIN pour repartir proprement
  await globalPrisma.utilisateurGlobal.deleteMany({
    where: { email: 'superadmin@system.com' },
  });
  console.log(`   ✅ Super Admin supprimé\n`);
}

// ============================================
// VÉRIFICATION (mode IDEMPOTENT)
// ============================================

async function isEtablissementFullyProvisioned(etablissement: any): Promise<boolean> {
  const schemaName = etablissement.schemaName;

  // 1. Vérifier que le schéma PostgreSQL existe
  const schemaCheck = await globalPrisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.schemata 
      WHERE schema_name = $1
    ) AS exists`,
    schemaName
  );
  const hasSchema = schemaCheck[0]?.exists === true;
  if (!hasSchema) return false;

  // 2. Vérifier que les tables existent
  const tablesCheck = await globalPrisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) as count FROM information_schema.tables 
     WHERE table_schema = $1`,
    schemaName
  );
  const tablesCount = Number(tablesCheck[0]?.count ?? 0);
  if (tablesCount === 0) return false;

  // 3. Vérifier que le client Prisma existe
  const clientPath = path.join(
    process.cwd(),
    'prisma',
    'generated',
    'tenants',
    `${schemaName}-client`
  );
  if (!fs.existsSync(clientPath)) return false;

  return true;
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('\n🌱 Démarrage du seed...');
  console.log(`   Mode : ${RESET_MODE ? '🔄 RESET (tout recréer)' : '♻️  IDEMPOTENT (réparer)'}\n`);

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // ══════════════════════════════════════════════════════
  // 1. NETTOYAGE (mode RESET uniquement)
  // ══════════════════════════════════════════════════════

  if (RESET_MODE) {
    await cleanupEtablissement();
  }

  // ══════════════════════════════════════════════════════
  // 2. ÉTABLISSEMENT
  // ══════════════════════════════════════════════════════

  console.log('🏫 Établissement (catalogue global)...');

  let etablissement = await globalPrisma.etablissement.findUnique({
    where: { code: ETABLISSEMENT.code },
  });

  // Vérification complète en mode IDEMPOTENT
  if (etablissement && !RESET_MODE) {
    const isOk = await isEtablissementFullyProvisioned(etablissement);

    if (isOk) {
      console.log(`   ⏭️  ${etablissement.nom} déjà provisionné`);
      console.log(`   📦 Schéma : ${etablissement.schemaName}\n`);
    } else {
      console.log(`   ⚠️  Provisioning incomplet → réparation...`);
      await cleanupEtablissement();
      etablissement = null;
    }
  }

  if (!etablissement) {
    console.log('   Création + provisioning du schéma dédié...');
    etablissement = await provisioningService.createEtablissementWithSchema(
      ETABLISSEMENT
    );
    console.log(`   ✅ ${etablissement.nom} (${etablissement.code})`);
    console.log(`   📦 Schéma créé : ${etablissement.schemaName}`);
    console.log(`   🔑 ID : ${etablissement.id}\n`);
  }

  // ══════════════════════════════════════════════════════
  // 3. UTILISATEURS (dans le schéma du tenant)
  // ══════════════════════════════════════════════════════

  console.log('👥 Utilisateurs (dans le schéma tenant)...');

  const tenantPrisma = await getTenantClient(etablissement.schemaName);

  // 3.1 — Directeur
  const directeur = await upsertUtilisateur(tenantPrisma, hashedPassword, {
    email: 'directeur@test1.com',
    prenom: 'Jean',
    nom: 'Dupont',
    role: 'DIRECTEUR',
    telephone: '+225 07 00 00 00 01',
  });
  console.log(`   ✅ ${directeur.email} (DIRECTEUR)`);

  // 3.2 — Secrétaire
  const secretaire = await upsertUtilisateur(tenantPrisma, hashedPassword, {
    email: 'secretaire@test.com',
    prenom: 'Aïcha',
    nom: 'Koné',
    role: 'SECRETAIRE',
    telephone: '+225 07 00 00 00 02',
  });
  console.log(`   ✅ ${secretaire.email} (SECRETAIRE)`);

  // 3.3 — Enseignant
  const enseignantUser = await upsertUtilisateur(tenantPrisma, hashedPassword, {
    email: 'enseignant@test.com',
    prenom: 'Pierre',
    nom: 'Laurent',
    role: 'ENSEIGNANT',
    telephone: '+225 07 00 00 00 03',
  });

  await tenantPrisma.enseignant.upsert({
    where: { utilisateurId: enseignantUser.id },
    update: {},
    create: {
      utilisateurId: enseignantUser.id,
      matricule: 'ENS-2026-000001',
      prenom: 'Pierre',
      nom: 'Laurent',
      sexe: 'M',
      dateNaissance: new Date('1985-06-10'),
      telephone: '+225 07 00 00 00 03',
      email: 'enseignant@test.com',
      dateEmbauche: new Date('2020-09-01'),
      typeContrat: 'CDI',
      salaireBase: 350000,
    },
  });
  console.log(`   ✅ ${enseignantUser.email} (ENSEIGNANT + profil)`);

  // 3.4 — Parent
  const parentUser = await upsertUtilisateur(tenantPrisma, hashedPassword, {
    email: 'parent@test.com',
    prenom: 'Marie',
    nom: 'Martin',
    role: 'PARENT',
    telephone: '+225 07 00 00 00 04',
  });

  await tenantPrisma.parent.upsert({
    where: { utilisateurId: parentUser.id },
    update: {},
    create: {
      utilisateurId: parentUser.id,
      profession: 'Commerçante',
      adresse: 'Cocody, Abidjan',
    },
  });
  console.log(`   ✅ ${parentUser.email} (PARENT + profil)`);

  // 3.5 — Admin
  const adminUser = await upsertUtilisateur(tenantPrisma, hashedPassword, {
    email: 'admin@test.com',
    prenom: 'Système',
    nom: 'Admin',
    role: 'ADMIN',
    telephone: '+225 07 00 00 00 05',
  });

  await tenantPrisma.admin.upsert({
    where: { utilisateurId: adminUser.id },
    update: {},
    create: {
      utilisateurId: adminUser.id,
      niveau: 'ADMIN_ETABLISSEMENT',
    },
  });
  console.log(`   ✅ ${adminUser.email} (ADMIN + profil)`);

  // 3.6 — Bibliothécaire
  const biblioUser = await upsertUtilisateur(tenantPrisma, hashedPassword, {
    email: 'bibliothecaire@test.com',
    prenom: 'Sophie',
    nom: 'Diomandé',
    role: 'BIBLIOTHECAIRE',
    telephone: '+225 07 00 00 00 06',
  });
  console.log(`   ✅ ${biblioUser.email} (BIBLIOTHECAIRE)`);

  // 3.7 — Élève
  const eleveUser = await upsertUtilisateur(tenantPrisma, hashedPassword, {
    email: 'eleve@test.com',
    prenom: 'Aya',
    nom: 'Kouassi',
    role: 'ELEVE',
    telephone: '+225 07 00 00 00 07',
  });

  await tenantPrisma.eleve.upsert({
    where: { utilisateurId: eleveUser.id },
    update: {},
    create: {
      utilisateurId: eleveUser.id,
      matricule: 'ELE-2026-000001',
      prenom: 'Aya',
      nom: 'Kouassi',
      sexe: 'F',
      dateNaissance: new Date('2010-05-15'),
      lieuNaissance: 'Abidjan',
      nationalite: 'Ivoirienne',
      adresse: 'Cocody, Abidjan',
      telephone: '+225 07 00 00 00 07',
      email: 'eleve@test.com',
      groupeSanguin: 'O+',
      statut: 'ACTIF',
    },
  });
  console.log(`   ✅ ${eleveUser.email} (ELEVE + profil)`);

  // 3.8 — Surveillant
  const surveillantUser = await upsertUtilisateur(tenantPrisma, hashedPassword, {
    email: 'surveillant@test.com',
    prenom: 'Paul',
    nom: 'Yao',
    role: 'SURVEILLANT',
    telephone: '+225 07 00 00 00 08',
  });

  await tenantPrisma.surveillant.upsert({
    where: { utilisateurId: surveillantUser.id },
    update: {},
    create: {
      utilisateurId: surveillantUser.id,
      matricule: 'SUR-2026-000001',
      prenom: 'Paul',
      nom: 'Yao',
      sexe: 'M',
      dateNaissance: new Date('1995-03-20'),
      telephone: '+225 07 00 00 00 08',
      email: 'surveillant@test.com',
      adresse: 'Yopougon, Abidjan',
      dateEmbauche: new Date('2024-01-15'),
      typeContrat: 'CDI',
      zoneSurveillance: 'Bâtiment A',
      estActif: true,
    },
  });
  console.log(`   ✅ ${surveillantUser.email} (SURVEILLANT + profil)\n`);

  // ══════════════════════════════════════════════════════
  // 4. SUPER ADMIN (catalogue global)
  // ══════════════════════════════════════════════════════

  console.log('👑 Super Admin (catalogue global)...');

  const superAdmin = await globalPrisma.utilisateurGlobal.upsert({
    where: { email: 'superadmin@system.com' },
    update: {},
    create: {
      email: 'superadmin@system.com',
      motDePasse: hashedPassword,
      prenom: 'Super',
      nom: 'Admin',
      role: 'SUPER_ADMIN',
      estActif: true,
      emailVerifie: true,
    },
  });
  console.log(`   ✅ ${superAdmin.email} (SUPER_ADMIN)\n`);

  // ══════════════════════════════════════════════════════
  // RÉCAPITULATIF
  // ══════════════════════════════════════════════════════

  console.log('🎉 Seed terminé avec succès !\n');
  console.log('═'.repeat(75));
  console.log(`   Établissement  : ${etablissement.nom}`);
  console.log(`   Code           : ${etablissement.code}`);
  console.log(`   Schéma         : ${etablissement.schemaName}`);
  console.log(`   🔑 ID          : ${etablissement.id}`);
  console.log(`   Mot de passe   : ${DEFAULT_PASSWORD}`);
  console.log('═'.repeat(75));
  console.log('   Email                          Rôle             Schéma');
  console.log('─'.repeat(75));
  console.log('   superadmin@system.com          SUPER_ADMIN      public');
  console.log('   directeur@test1.com            DIRECTEUR        tenant');
  console.log('   secretaire@test.com            SECRETAIRE       tenant');
  console.log('   enseignant@test.com            ENSEIGNANT       tenant');
  console.log('   parent@test.com                PARENT           tenant');
  console.log('   admin@test.com                 ADMIN            tenant');
  console.log('   bibliothecaire@test.com        BIBLIOTHECAIRE   tenant');
  console.log('   eleve@test.com                 ELEVE            tenant');
  console.log('   surveillant@test.com           SURVEILLANT      tenant');
  console.log('═'.repeat(75));
  console.log('');
}

// ============================================
// HELPER
// ============================================

async function upsertUtilisateur(
  tenantPrisma: any,
  hashedPassword: string,
  data: {
    email: string;
    prenom: string;
    nom: string;
    role: string;
    telephone: string;
  }
) {
  return tenantPrisma.utilisateur.upsert({
    where: { email: data.email },
    update: {},
    create: {
      email: data.email,
      motDePasse: hashedPassword,
      prenom: data.prenom,
      nom: data.nom,
      role: data.role,
      telephone: data.telephone,
      estActif: true,
      emailVerifie: true,
    },
  });
}

// ============================================
// EXÉCUTION
// ============================================

main()
  .catch((e) => {
    console.error('❌ Erreur seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await globalPrisma.$disconnect();
    await disconnectAllTenants();
  });