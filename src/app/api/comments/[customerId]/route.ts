import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { customerId } = await params;

  // Team members can only see comments on their assigned customers
  if (session.role === 'team') {
    const assignment = await prisma.assignment.findFirst({
      where: { customerId, userId: session.userId },
    });
    if (!assignment) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const comments = await prisma.comment.findMany({
    where: { customerId },
    select: { id: true, customerId: true, userId: true, text: true, createdAt: true, user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(comments);
}
