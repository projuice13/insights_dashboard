import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

/**
 * POST { customerIds: string[], text: string }
 * Adds the same comment to every given customer in one go.
 * Team members may only comment on customers assigned to them — any others in
 * the selection are skipped. Returns the customerIds that were actually written.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { customerIds, text }: { customerIds: string[]; text: string } = await req.json();

  if (!Array.isArray(customerIds) || customerIds.length === 0 || !text?.trim()) {
    return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
  }

  // Team members may only comment on their own assigned customers.
  let permittedIds = customerIds;
  if (session.role === 'team') {
    const assignments = await prisma.assignment.findMany({
      where: { userId: session.userId, customerId: { in: customerIds } },
      select: { customerId: true },
    });
    const assignedSet = new Set(assignments.map((a) => a.customerId));
    permittedIds = customerIds.filter((id) => assignedSet.has(id));
  }

  if (permittedIds.length === 0) {
    return NextResponse.json({ error: 'None of the selected customers are assigned to you.' }, { status: 403 });
  }

  const trimmed = text.trim();
  await prisma.comment.createMany({
    data: permittedIds.map((customerId) => ({
      customerId,
      userId: session.userId,
      text: trimmed,
    })),
  });

  return NextResponse.json({ created: permittedIds.length, customerIds: permittedIds });
}
