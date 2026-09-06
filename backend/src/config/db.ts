// src/config/db.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

// Créer l'adaptateur PostgreSQL
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Créer le client Prisma avec l'adaptateur
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Fonction de connexion
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');
    return prisma;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    throw error;
  }
}

// Fonction de déconnexion
async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log('✅ Déconnexion de la base de données effectuée');
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
  }
}

export { prisma, connectDB, disconnectDB };