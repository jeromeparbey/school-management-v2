// prisma/seed.ts

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import type { RoleUtilisateur } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

// ============================================
// DRIVER ADAPTER (Prisma 7 obligatoire)
// ============================================
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = 'Test@1234';

const TEST_USERS: Array<{
  email: string;
  prenom: string;
  nom: string;
  role: RoleUtilisateur;
  telephone: string;
}> = [
  { email: 'directeur@test1.com',  prenom: 'Jean',    nom: 'Dupont',  role: 'DIRECTEUR',  telephone: '+225 07 00 00 00 01' },
  { email: 'secretaire@test.com', prenom: 'Aïcha',   nom: 'Koné',    role: 'SECRETAIRE', telephone: '+225 07 00 00 00 02' },
  { email: 'enseignant@test.com', prenom: 'Pierre',  nom: 'Laurent', role: 'ENSEIGNANT', telephone: '+225 07 00 00 00 03' },
  { email: 'parent@test.com',     prenom: 'Marie',   nom: 'Martin',  role: 'PARENT',     telephone: '+225 07 00 00 00 04' },
  { email: 'admin@test.com',      prenom: 'Système', nom: 'Admin',   role: 'ADMIN',      telephone: '+225 07 00 00 00 05' },
];

async function main() {
  console.log('🌱 Seed utilisateurs...\n');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const u of TEST_USERS) {
    const existing = await prisma.utilisateur.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`   ⏭️  ${u.email.padEnd(25)} (déjà existant)`);
      continue;
    }

    await prisma.utilisateur.create({
      data: {
        email: u.email,
        motDePasse: hashedPassword,
        prenom: u.prenom,
        nom: u.nom,
        role: u.role,
        telephone: u.telephone,
        estActif: true,
        emailVerifie: true,
      },
    });

    console.log(`   ✅ ${u.email.padEnd(25)} → ${u.prenom} ${u.nom} (${u.role})`);
  }

  console.log('\n🎉 Terminé. Mot de passe pour tous : ' + DEFAULT_PASSWORD + '\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());