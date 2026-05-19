import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Use the direct (non-pooling) connection for a one-off script
const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL;

if (!connectionString) throw new Error('No database URL found. Run: vercel env pull .env.local --environment=production --yes');

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
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
  console.log('  You will be prompted to change this password on first login.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
