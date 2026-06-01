import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

/**
 * POST /api/customer-statuses/[id]/reject
 * Admin rejects a pending deactivation. Deletes the row, clears stale
 * notifications, and notifies the team member who requested it.
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

  const cs = await prisma.customerStatus.findUnique({ where: { customerId } });

  if (!cs) {
    return NextResponse.json({ error: 'Status not found.' }, { status: 404 });
  }

  if (cs.approvalStatus !== 'pending') {
    return NextResponse.json({ error: 'This request is no longer pending.' }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.customerStatus.delete({ where: { customerId } }),
    prisma.notification.deleteMany({
      where: { type: 'deactivation_request', customerId },
    }),
    prisma.notification.create({
      data: {
        userId: cs.setById,
        type: 'deactivation_rejected',
        customerId,
        customerName: cs.customerName,
        message: `${session.name} rejected your deactivation request for ${cs.customerName}.`,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
