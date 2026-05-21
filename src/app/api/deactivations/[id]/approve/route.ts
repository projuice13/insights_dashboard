import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

/**
 * POST /api/deactivations/[id]/approve
 * Admin approves a pending deactivation request. The customer becomes deactivated.
 * The requester gets a confirmation notification. Other admins' pending-request
 * notifications for this customer are cleared.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // The deactivation id IS the customerId (it's the primary key)
  const { id: customerId } = await params;

  const deactivation = await prisma.deactivation.findUnique({
    where: { customerId },
    include: { requestedBy: { select: { name: true } } },
  });

  if (!deactivation) {
    return NextResponse.json({ error: 'Deactivation request not found.' }, { status: 404 });
  }

  if (deactivation.status !== 'pending') {
    return NextResponse.json({ error: 'This request is no longer pending.' }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.deactivation.update({
      where: { customerId },
      data: {
        status: 'active',
        approvedById: session.userId,
        approvedAt: new Date(),
      },
    }),
    // Clear the pending-request notifications for all admins
    prisma.notification.deleteMany({
      where: { type: 'deactivation_request', customerId },
    }),
    // Notify the requester
    prisma.notification.create({
      data: {
        userId: deactivation.requestedById,
        type: 'deactivation_approved',
        customerId,
        customerName: deactivation.customerName,
        message: `${session.name} approved your deactivation request for ${deactivation.customerName}.`,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
