import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

/**
 * GET /api/customers/[id]/activity
 * Returns the customer's activity log (status + assignment changes), newest first.
 * [id] is the derived customerId.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: customerId } = await params;

  // Team members can only see activity for their own assigned customers.
  if (session.role === 'team') {
    const assignment = await prisma.assignment.findFirst({
      where: { customerId, userId: session.userId },
    });
    if (!assignment) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const activity = await prisma.customerActivity.findMany({
    where: { customerId },
    select: { id: true, type: true, detail: true, actorName: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(activity);
}
