import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

/**
 * POST /api/deactivations/[id]/reject
 * Admin rejects a pending deactivation. The request is deleted, the requester
 * is notified, and other admins' notifications for it are cleared.
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

  const deactivation = await prisma.deactivation.findUnique({
    where: { customerId },
  });

  if (!deactivation) {
    return NextResponse.json({ error: 'Deactivation request not found.' }, { status: 404 });
  }

  if (deactivation.status !== 'pending') {
    return NextResponse.json({ error: 'This request is no longer pending.' }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.deactivation.delete({ where: { customerId } }),
    prisma.notification.deleteMany({
      where: { type: 'deactivation_request', customerId },
    }),
    prisma.notification.create({
      data: {
        userId: deactivation.requestedById,
        type: 'deactivation_rejected',
        customerId,
        customerName: deactivation.customerName,
        message: `${session.name} rejected your deactivation request for ${deactivation.customerName}.`,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
