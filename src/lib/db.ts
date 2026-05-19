import { PrismaClient } from '@/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
  // Resolve relative file path to absolute so it works regardless of cwd
  const absoluteUrl = dbUrl.startsWith('file:.')
    ? `file:${path.resolve(process.cwd(), dbUrl.replace('file:', ''))}`
    : dbUrl;
  const adapter = new PrismaBetterSqlite3({ url: absoluteUrl });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
