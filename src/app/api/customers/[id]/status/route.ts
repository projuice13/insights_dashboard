import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { CustomerStatusType } from '@/lib/types';

const VALID_STATUSES: CustomerStatusType[] = [
  'deactivated', 'dormant', 'no_response', 'possible', 'seasonal', 'hot',
];

/**
 * POST /api/customers/[id]/status
 * Body: { status: CustomerStatusType, reason?: string, customerName: string }
 *
 * - Admin sets ANY status → applied immediately (approvalStatus = 'approved')
 * - Team sets 'deactivated' → pending request, notifies all admins (existing behaviour)
 * - Team sets any other status → applied immediately
 *
 * Behaviour for team members trying to deactivate a customer that's already pending
 * or deactivated: returns 409 (use the approve/reject flow instead).
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
  const {
    status,
    reason,
    customerName,
  }: { status: CustomerStatusType; reason?: string; customerName: string } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  if (status === 'deactivated' && !reason?.trim()) {
    return NextResponse.json({ error: 'A reason is required for deactivation.' }, { status: 400 });
  }

  const isAdmin = session.role === 'admin';
  const isDeactivation = status === 'deactivated';

  // For team users requesting deactivation, prevent duplicate requests
  if (!isAdmin && isDeactivation) {
    const existing = await prisma.customerStatus.findUnique({ where: { customerId } });
    if (existing && existing.status === 'deactivated') {
      return NextResponse.json(
        { error: 'This customer already has a deactivation in progress.' },
        { status: 409 },
      );
    }
  }

  const now = new Date();
  const trimmedReason = reason?.trim() || null;
  const needsApproval = !isAdmin && isDeactivation;

  await prisma.customerStatus.upsert({
    where: { customerId },
    create: {
      customerId,
      customerName,
      status,
      approvalStatus: needsApproval ? 'pending' : 'approved',
      reason: trimmedReason,
      setById: session.userId,
      setAt: now,
      approvedById: needsApproval ? null : session.userId,
      approvedAt: needsApproval ? null : now,
    },
    update: {
      status,
      approvalStatus: needsApproval ? 'pending' : 'approved',
      reason: trimmedReason,
      setById: session.userId,
      setAt: now,
      approvedById: needsApproval ? null : session.userId,
      approvedAt: needsApproval ? null : now,
    },
  });

  // Send notifications only when a team member requests deactivation
  if (needsApproval) {
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
        message: `${session.name} wants to deactivate ${customerName} — ${trimmedReason ?? 'no reason given'}`,
      })),
    });
  }

  return NextResponse.json({
    ok: true,
    approvalStatus: needsApproval ? 'pending' : 'approved',
  });
}

/**
 * DELETE /api/customers/[id]/status
 * Removes a status tag (back to "Active").
 * Team members can't remove 'deactivated' status (only admins reactivate).
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: customerId } = await params;

  if (session.role !== 'admin') {
    // Team users may only clear a status that is NOT a deactivation
    const existing = await prisma.customerStatus.findUnique({ where: { customerId } });
    if (existing && existing.status === 'deactivated') {
      return NextResponse.json({ error: 'Only admins can reactivate.' }, { status: 403 });
    }
  }

  await prisma.customerStatus.deleteMany({ where: { customerId } });
  return NextResponse.json({ ok: true });
}
