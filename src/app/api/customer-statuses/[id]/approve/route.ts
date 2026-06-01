import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

/**
 * POST /api/customer-statuses/[id]/approve
 * Admin approves a pending deactivation request. Updates the row to approved,
 * clears stale pending-request notifications for other admins, and notifies
 * the requester.
 *
 * [id] here is the customerId (primary key of CustomerStatus).
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

  const cs = await prisma.customerStatus.findUnique({
    where: { customerId },
    include: { setBy: { select: { name: true } } },
  });

  if (!cs) {
    return NextResponse.json({ error: 'Status not found.' }, { status: 404 });
  }

  if (cs.approvalStatus !== 'pending') {
    return NextResponse.json({ error: 'This request is no longer pending.' }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.customerStatus.update({
      where: { customerId },
      data: {
        approvalStatus: 'approved',
        approvedById: session.userId,
        approvedAt: new Date(),
      },
    }),
    prisma.notification.deleteMany({
      where: { type: 'deactivation_request', customerId },
    }),
    prisma.notification.create({
      data: {
        userId: cs.setById,
        type: 'deactivation_approved',
        customerId,
        customerName: cs.customerName,
        message: `${session.name} approved your deactivation request for ${cs.customerName}.`,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
