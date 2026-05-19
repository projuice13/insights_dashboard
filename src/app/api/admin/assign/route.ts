import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { customerIds, userId }: { customerIds: string[]; userId: string | null } =
    await req.json();

  if (!customerIds?.length) {
    return NextResponse.json({ error: 'No customer IDs provided.' }, { status: 400 });
  }

  if (userId === null) {
    await prisma.assignment.deleteMany({ where: { customerId: { in: customerIds } } });
  } else {
    // Upsert each assignment in a transaction
    await prisma.$transaction(
      customerIds.map((customerId) =>
        prisma.assignment.upsert({
          where: { customerId },
          create: { customerId, userId },
          update: { userId, assignedAt: new Date() },
        }),
      ),
    );
  }

  return NextResponse.json({ ok: true });
}
