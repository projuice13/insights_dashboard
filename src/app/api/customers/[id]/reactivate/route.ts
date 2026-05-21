import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

/**
 * POST /api/customers/[id]/reactivate
 * Admin only — removes a deactivation record so the customer reappears in the default list.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: customerId } = await params;

  await prisma.deactivation.deleteMany({ where: { customerId } });

  return NextResponse.json({ ok: true });
}
