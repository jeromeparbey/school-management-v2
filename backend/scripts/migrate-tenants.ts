// scripts/migrate-tenants.ts
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { globalPrisma } from '../src/config/global-db';

const TEMPLATE = path.join(process.cwd(), 'prisma', 'tenant-template.prisma');
const TMP_DIR = path.join(process.cwd(), 'prisma', '.tmp');

function buildSchemaFile(schemaName: string): string {
  const template = fs.readFileSync(TEMPLATE, 'utf-8');
  const content = template.replace(/\$\{SCHEMA_NAME\}/g, schemaName);

  fs.mkdirSync(TMP_DIR, { recursive: true });
  const file = path.join(TMP_DIR, `${schemaName}.prisma`);
  fs.writeFileSync(file, content);
  return file;
}

function tenantDbUrl(schemaName: string): string {
  const base = process.env.DATABASE_URL!;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}schema=${schemaName}`;
}
async function migrateTenant(schemaName: string) {
  console.log(`\n🔄 Migration du tenant : ${schemaName}`);
  const schemaFile = buildSchemaFile(schemaName).replace(/\\/g, '/');
  const url = tenantDbUrl(schemaName);
  const env = { ...process.env, DATABASE_URL: url };

  // 1. Appliquer les changements SQL (sans --skip-generate, supprimé en Prisma 7)
  execSync(
    `npx prisma db push --schema="${schemaFile}" --url="${url}"`,
    { stdio: 'inherit', env }
  );

  // 2. Régénérer le client
  execSync(`npx prisma generate --schema="${schemaFile}"`, {
    stdio: 'inherit',
    env,
  });

  console.log(`✅ ${schemaName} à jour`);
}
async function main() {
  const tenants = await globalPrisma.etablissement.findMany({
    where: { estArchive: false, statutProvisionnement: 'TERMINE' },
    select: { schemaName: true },
  });

  console.log(`📋 ${tenants.length} tenant(s) à migrer`);

  const errors: { schema: string; error: any }[] = [];

  for (const { schemaName } of tenants) {
    try {
      await migrateTenant(schemaName);
    } catch (error) {
      console.error(`❌ Échec pour ${schemaName}`);
      errors.push({ schema: schemaName, error });
    }
  }

  await globalPrisma.$disconnect();

  if (errors.length) {
    console.error(`\n⚠️ ${errors.length} échec(s) :`, errors.map(e => e.schema));
    process.exit(1);
  }
  console.log('\n🎉 Tous les tenants sont à jour');
}

main();