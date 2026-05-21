import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { makeId } from '@/lib/dataTransforms';
import { RawOrder } from '@/lib/types';

// Allow up to 60 s on Vercel
export const maxDuration = 60;

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { orders }: { orders: RawOrder[] } = await req.json();

  if (!orders?.length) {
    return NextResponse.json({ error: 'No orders provided.' }, { status: 400 });
  }

  // Skip any orders whose SalesOrder.Number already exists
  const incomingNumbers = orders.map((o) => o.sales_order_number);
  const existing = await prisma.rawOrderRow.findMany({
    where: { salesOrderNumber: { in: incomingNumbers } },
    select: { salesOrderNumber: true },
  });
  const existingSet = new Set(existing.map((r) => r.salesOrderNumber));

  const newOrders = orders.filter((o) => !existingSet.has(o.sales_order_number));
  const skipped = orders.length - newOrders.length;

  if (newOrders.length > 0) {
    await prisma.rawOrderRow.createMany({
      data: newOrders.map((o) => ({
        salesOrderNumber: o.sales_order_number,
        customerName: o.customer_name,
        postcode: o.postcode,
        contactName: o.contact_name,
        primaryEmail: o.primary_email,
        secondaryEmail: o.secondary_email,
        orderValue: o.order_value,
        orderDate: o.order_date,
      })),
    });

    // Auto-reactivate any deactivated customers who appear in the new orders
    await reactivateIfOrdered(newOrders);
  }

  return NextResponse.json({ imported: newOrders.length, skipped });
}

/**
 * If a customer was deactivated (or had a pending request) and a new order has
 * arrived for them, clear the deactivation record — they're clearly still trading.
 * Notify all admins so they have a trail of these auto-reactivations, and notify
 * the original requester if their pending request was overturned.
 */
async function reactivateIfOrdered(newOrders: RawOrder[]) {
  const newCustomerIds = Array.from(
    new Set(newOrders.map((o) => makeId(o.customer_name, o.postcode))),
  );

  const deactivations = await prisma.deactivation.findMany({
    where: { customerId: { in: newCustomerIds } },
  });

  if (deactivations.length === 0) return;

  const customerIdsToReactivate = deactivations.map((d) => d.customerId);

  // Build notifications
  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true },
  });
  const adminIds = new Set(admins.map((a) => a.id));

  const notifications: {
    userId: string;
    type: string;
    customerId: string;
    customerName: string;
    message: string;
  }[] = [];

  for (const d of deactivations) {
    // Notify every admin
    for (const admin of admins) {
      notifications.push({
        userId: admin.id,
        type: 'auto_reactivated',
        customerId: d.customerId,
        customerName: d.customerName,
        message:
          d.status === 'pending'
            ? `${d.customerName} placed a new order — pending deactivation request cancelled.`
            : `${d.customerName} placed a new order — automatically reactivated.`,
      });
    }
    // If a team member requested it, let them know it's been cancelled too
    if (d.status === 'pending' && !adminIds.has(d.requestedById)) {
      notifications.push({
        userId: d.requestedById,
        type: 'auto_reactivated',
        customerId: d.customerId,
        customerName: d.customerName,
        message: `Your deactivation request for ${d.customerName} was cancelled — they placed a new order.`,
      });
    }
  }

  await prisma.$transaction([
    // Clear the deactivation records
    prisma.deactivation.deleteMany({
      where: { customerId: { in: customerIdsToReactivate } },
    }),
    // Clear any stale "pending request" notifications now that the request is moot
    prisma.notification.deleteMany({
      where: { type: 'deactivation_request', customerId: { in: customerIdsToReactivate } },
    }),
    // Create the new "auto-reactivated" notifications
    prisma.notification.createMany({ data: notifications }),
  ]);
}

export async function DELETE() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await prisma.rawOrderRow.deleteMany();
  return NextResponse.json({ ok: true });
}
