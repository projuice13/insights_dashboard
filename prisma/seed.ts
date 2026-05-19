import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
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
  console.log('  Tim will be prompted to change this password on first login.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
