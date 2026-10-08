// src/config/global-db.ts
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/global-client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const globalPrisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

export async function connectGlobalDB() {
  await globalPrisma.$connect();
  console.log('✅ Connexion au catalogue global établie');
}

export async function disconnectGlobalDB() {
  await globalPrisma.$disconnect();
  console.log('✅ Déconnexion du catalogue global');
}