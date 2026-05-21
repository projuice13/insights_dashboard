import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const {
    customerIds,
    userId,
    customerNames = {},
  }: {
    customerIds: string[];
    userId: string | null;
    customerNames?: Record<string, string>;
  } = await req.json();

  if (!customerIds?.length) {
    return NextResponse.json({ error: 'No customer IDs provided.' }, { status: 400 });
  }

  if (userId === null) {
    await prisma.assignment.deleteMany({ where: { customerId: { in: customerIds } } });
    return NextResponse.json({ ok: true });
  }

  // Don't notify the team member if they're already the current assignee
  const existing = await prisma.assignment.findMany({
    where: { customerId: { in: customerIds }, userId },
    select: { customerId: true },
  });
  const alreadyAssigned = new Set(existing.map((a) => a.customerId));
  const newlyAssignedIds = customerIds.filter((id) => !alreadyAssigned.has(id));

  await prisma.$transaction(
    customerIds.map((customerId) =>
      prisma.assignment.upsert({
        where: { customerId },
        create: { customerId, userId },
        update: { userId, assignedAt: new Date() },
      }),
    ),
  );

  // Notify the team member if they're not an admin themselves (admins don't need
  // self-assign notifications) and only for newly assigned customers
  if (newlyAssignedIds.length > 0 && userId !== session.userId) {
    const recipient = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (recipient && recipient.role !== 'admin') {
      await prisma.notification.createMany({
        data: newlyAssignedIds.map((customerId) => ({
          userId,
          type: 'assignment',
          customerId,
          customerName: customerNames[customerId] ?? 'a customer',
          message: `${session.name} assigned ${customerNames[customerId] ?? 'a customer'} to you.`,
        })),
      });
    }
  }

  return NextResponse.json({ ok: true });
}
