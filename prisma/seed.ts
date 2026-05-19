import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const absoluteUrl = dbUrl.startsWith('file:.')
  ? `file:${path.resolve(process.cwd(), dbUrl.replace('file:', ''))}`
  : dbUrl;
const adapter = new PrismaBetterSqlite3({ url: absoluteUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'tim@projuice.co.uk' },
  });

  if (existing) {
    console.log('Admin user already exists — skipping seed.');
    return;
  }

  const passwordHash = await bcrypt.hash('<REDACTED>', 12);

  await prisma.user.create({
    data: {
      name: 'Tim',
      email: 'tim@projuice.co.uk',
      passwordHash,
      role: 'admin',
      mustChangePass: true,
    },
  });

  console.log('✓ Admin user created: tim@projuice.co.uk / <REDACTED>');
  console.log('  Tim will be prompted to change this password on first login.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
