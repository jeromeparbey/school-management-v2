// src/services/provisioning.service.ts
import { globalPrisma } from '../config/global-db';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export class ProvisioningService {
  // ============================================
  // CRÉATION D'UN ÉTABLISSEMENT + SON SCHÉMA
  // ============================================

  async createEtablissementWithSchema(data: {
    nom: string;
    code: string;
    ville?: string;
    email?: string;
    telephone?: string;
  }) {
    const schemaName = this.buildSchemaName(data.code);

    // 1. Créer l'entrée dans le catalogue global
    const etablissement = await globalPrisma.etablissement.create({
      data: {
        nom: data.nom,
        code: data.code,
        schemaName,
        ville: data.ville,
        email: data.email,
        telephone: data.telephone,
        statutProvisionnement: 'EN_COURS',
      },
    });

    try {
      // 2. Créer le schéma PostgreSQL
      await globalPrisma.$executeRawUnsafe(
        `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`
      );

      // 3. Générer le fichier schema.prisma du tenant (avec @@schema)
      await this.generateTenantSchema(schemaName);

      // 4. Appliquer les tables + générer le client Prisma
      await this.pushTenantSchema(schemaName);

      // 5. Seed initial (niveaux + paramètres)
      await this.seedTenant(schemaName);

      // 6. Marquer comme terminé
      await globalPrisma.etablissement.update({
        where: { id: etablissement.id },
        data: { statutProvisionnement: 'TERMINE' },
      });

      return etablissement;
    } catch (error) {
      await globalPrisma.etablissement.update({
        where: { id: etablissement.id },
        data: {
          statutProvisionnement: 'ECHEC',
          erreurProvisionnement: (error as Error).message,
        },
      });
      throw error;
    }
  }

  // ============================================
  // RE-PROVISIONNER UN TENANT EXISTANT
  // ============================================

  async reprovisionTenant(schemaName: string): Promise<void> {
    console.log(`🔄 Re-provisioning de ${schemaName}...`);

    // 1. S'assurer que le schéma PostgreSQL existe
    await globalPrisma.$executeRawUnsafe(
      `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`
    );

    // 2. Générer le fichier schema.prisma du tenant
    await this.generateTenantSchema(schemaName);

    // 3. Appliquer les tables + générer le client
    await this.pushTenantSchema(schemaName);

    // 4. Seed initial (idempotent)
    await this.seedTenant(schemaName);

    console.log(`✅ ${schemaName} re-provisionné`);
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  private buildSchemaName(code: string): string {
    const clean = code
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/^[^a-z]/, 't_')
      .replace(/_+/g, '_')
      .replace(/_$/, '');
    return `tenant_${clean}`.slice(0, 50);
  }

  // ============================================
  // GÉNÉRATION DU SCHEMA PRISMA DU TENANT
  // ============================================

  private async generateTenantSchema(schemaName: string): Promise<void> {
    const templatePath = path.join(
      process.cwd(),
      'prisma',
      'tenant-template.prisma'
    );
    const template = fs.readFileSync(templatePath, 'utf-8');

    // 1. Remplacer ${SCHEMA_NAME}
    let tenantSchema = template.replace(/\$\{SCHEMA_NAME\}/g, schemaName);

    // 2. Ajouter @@schema() à chaque modèle/enum qui n'en a pas
    tenantSchema = this.addSchemaAttribute(tenantSchema, schemaName);

    const outputPath = path.join(
      process.cwd(),
      'prisma',
      'tenants',
      `${schemaName}.prisma`
    );

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, tenantSchema);

    console.log(`   📝 Fichier généré : ${outputPath}`);
  }

  /**
   * Ajoute @@schema("nom") à chaque modèle et enum qui n'en a pas
   */
  private addSchemaAttribute(schema: string, schemaName: string): string {
    const lines = schema.split('\n');
    let blockType: 'model' | 'enum' | 'none' = 'none';
    let blockStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Début d'un modèle ou enum
      if (/^(model|enum)\s+\w+\s*\{/.test(trimmed)) {
        blockType = trimmed.startsWith('model') ? 'model' : 'enum';
        blockStart = i;
      }

      // Fin d'un bloc
      if (blockType !== 'none' && trimmed === '}') {
        const blockLines = lines.slice(blockStart, i);
        const blockContent = blockLines.join('\n');
        const hasSchema = /@@schema\s*\(/.test(blockContent);

        if (!hasSchema) {
          const mapIndex = blockLines.findIndex((l) =>
            l.trim().startsWith('@@map')
          );

          if (mapIndex !== -1) {
            const insertAt = blockStart + mapIndex + 1;
            lines.splice(insertAt, 0, `  @@schema("${schemaName}")`);
            i++;
          } else {
            lines.splice(i, 0, `  @@schema("${schemaName}")`);
            i++;
          }
        }

        blockType = 'none';
      }
    }

    return lines.join('\n');
  }

  // ============================================
  // APPLICATION DU SCHÉMA + GÉNÉRATION DU CLIENT
  // ============================================

  /**
   * Applique le schéma du tenant dans PostgreSQL
   * - Étape 1 : `prisma db push` → crée les tables
   * - Étape 2 : `prisma generate` → génère le client Prisma
   */
  private async pushTenantSchema(schemaName: string): Promise<void> {
    const schemaPath = path.join(
      process.cwd(),
      'prisma',
      'tenants',
      `${schemaName}.prisma`
    );

    // ═══════════════════════════════════════════════
    // ÉTAPE 1 : Créer les tables dans le schéma
    // ═══════════════════════════════════════════════
    console.log(`   🚀 Application du schéma dans PostgreSQL...`);
    execSync(
      `npx prisma db push --schema="${schemaPath}" --accept-data-loss`,
      { stdio: 'inherit', env: process.env }
    );

    // ═══════════════════════════════════════════════
    // ÉTAPE 2 : Générer le client Prisma du tenant
    // ═══════════════════════════════════════════════
    console.log(`   🔧 Génération du client Prisma du tenant...`);
    execSync(
      `npx prisma generate --schema="${schemaPath}"`,
      { stdio: 'inherit', env: process.env }
    );

    // Vérifier que le client est bien généré
    const clientPath = path.join(
      process.cwd(),
      'prisma',
      'generated',
      'tenants',
      `${schemaName}-client`
    );

    if (!fs.existsSync(clientPath)) {
      throw new Error(
        `Le client Prisma n'a pas été généré à l'emplacement attendu : ${clientPath}`
      );
    }

    console.log(`   ✅ Tables créées + client Prisma généré`);
  }

  // ============================================
  // SEED INITIAL DU TENANT
  // ============================================

  private async seedTenant(schemaName: string): Promise<void> {
    console.log(`   🌱 Seed initial du tenant...`);

    const { getTenantClient } = await import('../config/tenant-db');
    const client = await getTenantClient(schemaName);

    // Niveaux par défaut
    await client.niveau.createMany({
      data: [
        { nom: 'Primaire', code: 'PRIM', ordre: 1, description: 'École primaire' },
        { nom: 'Collège', code: 'COLL', ordre: 2, description: 'Collège' },
        { nom: 'Lycée', code: 'LYC', ordre: 3, description: 'Lycée' },
      ],
      skipDuplicates: true,
    });

    // Paramètres par défaut
    await client.parametreTenant.createMany({
      data: [
        {
          cle: 'systeme.devise',
          valeur: 'XOF',
          categorie: 'SYSTEME',
          type: 'STRING',
          estSysteme: true,
        },
        {
          cle: 'paie.tauxHeureSupp',
          valeur: 1.5,
          categorie: 'PAIE',
          type: 'NUMBER',
          estSysteme: true,
        },
        {
          cle: 'presence.toleranceRetard',
          valeur: 15,
          categorie: 'PRESENCE',
          type: 'NUMBER',
          estSysteme: true,
        },
      ],
      skipDuplicates: true,
    });

    console.log(`   ✅ Seed initial terminé`);
  }
}

export const provisioningService = new ProvisioningService();