import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function createPrismaClient() {
  // Vercel Postgres (Neon) exposes POSTGRES_PRISMA_URL (pooled, Prisma-safe).
  // Fall back to POSTGRES_URL then DATABASE_URL for other setups.
  const connectionString =
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'No database connection string found. Set POSTGRES_PRISMA_URL, POSTGRES_URL, or DATABASE_URL.'
    );
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
