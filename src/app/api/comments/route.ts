import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { customerId, text }: { customerId: string; text: string } = await req.json();

  if (!customerId || !text?.trim()) {
    return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
  }

  // Team members can only comment on their own assigned customers
  if (session.role === 'team') {
    const assignment = await prisma.assignment.findFirst({
      where: { customerId, userId: session.userId },
    });
    if (!assignment) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const comment = await prisma.comment.create({
    data: { customerId, userId: session.userId, text: text.trim() },
    select: { id: true, customerId: true, userId: true, text: true, createdAt: true, user: { select: { name: true } } },
  });

  return NextResponse.json(comment);
}
