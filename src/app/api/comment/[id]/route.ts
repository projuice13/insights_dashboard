import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

async function getOwnedComment(id: string, userId: string) {
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return { error: 'Not found', status: 404, comment: null };
  if (comment.userId !== userId) return { error: 'Forbidden', status: 403, comment: null };
  return { error: null, status: 200, comment };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: 'Text is required.' }, { status: 400 });
  }

  const { error, status } = await getOwnedComment(id, session.userId);
  if (error) return NextResponse.json({ error }, { status });

  const updated = await prisma.comment.update({
    where: { id },
    data: { text: text.trim() },
    select: { id: true, userId: true, text: true, createdAt: true, user: { select: { name: true } } },
  });

  return NextResponse.json({ ...updated, createdAt: updated.createdAt.toISOString() });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const { error, status } = await getOwnedComment(id, session.userId);
  if (error) return NextResponse.json({ error }, { status });

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
