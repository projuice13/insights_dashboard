import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, mustChangePass: true, createdAt: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, email, role }: { name: string; email: string; role: string } = await req.json();

  if (!name?.trim() || !email?.trim() || !role) {
    return NextResponse.json({ error: 'Name, email and role are required.' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    return NextResponse.json({ error: 'A user with that email already exists.' }, { status: 409 });
  }

  const temporaryPassword = generatePassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      mustChangePass: true,
    },
    select: { id: true, name: true, email: true, role: true, mustChangePass: true, createdAt: true },
  });

  return NextResponse.json({ user, temporaryPassword }, { status: 201 });
}
