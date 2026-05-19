import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { role }: { role: string } = await req.json();

  if (!role || !['admin', 'team'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
  }

  // Prevent admin from demoting themselves
  if (id === admin.userId && role !== 'admin') {
    return NextResponse.json({ error: 'You cannot change your own role.' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, mustChangePass: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  if (id === admin.userId) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
