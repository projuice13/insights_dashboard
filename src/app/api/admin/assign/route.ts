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
    // Log an "Unassigned" activity only for customers that were actually assigned.
    const existing = await prisma.assignment.findMany({
      where: { customerId: { in: customerIds } },
      select: { customerId: true, user: { select: { name: true } } },
    });
    await prisma.assignment.deleteMany({ where: { customerId: { in: customerIds } } });
    if (existing.length > 0) {
      await prisma.customerActivity.createMany({
        data: existing.map((a) => ({
          customerId: a.customerId,
          type: 'assignment',
          detail: `Unassigned from ${a.user.name}`,
          actorName: session.name,
        })),
      });
    }
    return NextResponse.json({ ok: true });
  }

  // Don't notify/log for customers already assigned to this same person
  const existing = await prisma.assignment.findMany({
    where: { customerId: { in: customerIds }, userId },
    select: { customerId: true },
  });
  const alreadyAssigned = new Set(existing.map((a) => a.customerId));
  const newlyAssignedIds = customerIds.filter((id) => !alreadyAssigned.has(id));

  const assignee = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, role: true },
  });

  await prisma.$transaction(
    customerIds.map((customerId) =>
      prisma.assignment.upsert({
        where: { customerId },
        create: { customerId, userId },
        update: { userId, assignedAt: new Date() },
      }),
    ),
  );

  // Record the assignment change in each customer's activity log.
  if (newlyAssignedIds.length > 0) {
    await prisma.customerActivity.createMany({
      data: newlyAssignedIds.map((customerId) => ({
        customerId,
        type: 'assignment',
        detail: `Assigned to ${assignee?.name ?? 'a team member'}`,
        actorName: session.name,
      })),
    });
  }

  // Notify the team member if they're not an admin themselves (admins don't need
  // self-assign notifications) and only for newly assigned customers
  if (newlyAssignedIds.length > 0 && userId !== session.userId && assignee && assignee.role !== 'admin') {
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

  return NextResponse.json({ ok: true });
}
