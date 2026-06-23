import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await verifySession();
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  await prisma.order.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
