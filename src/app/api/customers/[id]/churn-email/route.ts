import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

/**
 * POST   /api/customers/[id]/churn-email  → add the customer to the churn email list
 * DELETE /api/customers/[id]/churn-email  → remove them from it
 *
 * [id] is the customerId (name|POSTCODE). Presence of a ChurnEmailContact row
 * means the customer is on the list; this is independent of their status tag.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: customerId } = await params;

  try {
    await prisma.churnEmailContact.upsert({
      where: { customerId },
      create: { customerId, addedById: session.userId },
      update: {},
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : null;
    if (code === 'P2003') {
      return NextResponse.json(
        { error: 'Your session is out of date. Please log out and log back in, then try again.' },
        { status: 401 },
      );
    }
    console.error('[churn-email] add failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Could not update the churn email list. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: customerId } = await params;

  await prisma.churnEmailContact.deleteMany({ where: { customerId } });
  return NextResponse.json({ ok: true });
}
