import { PrismaClient } from './generated/global-client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'jeromekparbey@gmail.com';
  const password = 'Zomati430!';
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.utilisateurGlobal.upsert({
    where: { email },
    update: { motDePasse: hashed },
    create: {
      email,
      motDePasse: hashed,
      nom: 'Parbey',
      prenom: 'Jerome',
      role: 'SUPER_ADMIN',
      estActif: true,
      emailVerifie: true,
    },
  });

  console.log('Utilisateur prêt :', user.email, '- rôle :', user.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });