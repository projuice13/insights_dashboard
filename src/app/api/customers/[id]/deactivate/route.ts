import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

/**
 * POST /api/customers/[id]/deactivate
 * Body: { reason: string, customerName: string }
 *
 * - Admin: deactivates customer immediately (status = "active")
 * - Team member: creates a pending request, notifies all admins
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: customerId } = await params;
  const { reason, customerName }: { reason: string; customerName: string } = await req.json();

  if (!reason?.trim()) {
    return NextResponse.json({ error: 'A reason is required.' }, { status: 400 });
  }

  // Already a record? Don't create a duplicate.
  const existing = await prisma.deactivation.findUnique({ where: { customerId } });
  if (existing) {
    return NextResponse.json(
      { error: 'This customer already has a deactivation in progress.' },
      { status: 409 },
    );
  }

  const isAdmin = session.role === 'admin';
  const now = new Date();

  await prisma.deactivation.create({
    data: {
      customerId,
      customerName,
      reason: reason.trim(),
      status: isAdmin ? 'active' : 'pending',
      requestedById: session.userId,
      requestedAt: now,
      approvedById: isAdmin ? session.userId : null,
      approvedAt: isAdmin ? now : null,
    },
  });

  // Send notifications
  if (isAdmin) {
    // Admin deactivated directly — no notification needed
  } else {
    // Team member requested — notify all admins
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    });
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type: 'deactivation_request',
        customerId,
        customerName,
        message: `${session.name} wants to deactivate ${customerName} — ${reason.trim()}`,
      })),
    });
  }

  return NextResponse.json({ ok: true, status: isAdmin ? 'active' : 'pending' });
}
