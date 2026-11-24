import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { customerIdByOrderNumber } from '@/lib/dataTransforms';
import { parseOrderDate } from '@/lib/dateParse';
import { RawOrder } from '@/lib/types';

// Allow up to 60 s on Vercel
export const maxDuration = 60;

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
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

    // Auto-reactivate any dormant/lost/closed customers who ordered after being tagged
    await reactivateIfOrdered(newOrders, session.userId, session.name);
  }

  return NextResponse.json({ imported: newOrders.length, skipped });
}

// Statuses that mean a customer had gone quiet; a fresh order flips them to 'ordered'.
const REACTIVATE_FROM = ['dormant', 'lost', 'closed'];

/**
 * If a customer tagged dormant, lost or closed places an order AFTER that status
 * was assigned, set their status to 'ordered' — they're clearly trading again.
 * Only newly-imported orders dated on or after the day the status was set count,
 * so backdated/historical rows don't wrongly reopen anyone. Closed customers
 * additionally get the existing reopen notifications and their pending closure
 * request (if any) is cleared. Other tags are left untouched.
 */
async function reactivateIfOrdered(newOrders: RawOrder[], actingUserId: string, actorName: string) {
  // A customer's stable ID depends on its whole group, so resolve it against
  // all current raw orders + merges rather than from each new row alone.
  const [allRows, mergeRows] = await Promise.all([
    prisma.rawOrderRow.findMany({ orderBy: { salesOrderNumber: 'asc' } }),
    prisma.customerMerge.findMany(),
  ]);
  const allOrders: RawOrder[] = allRows.map((r) => ({
    sales_order_number: r.salesOrderNumber,
    customer_name: r.customerName,
    postcode: r.postcode,
    contact_name: r.contactName,
    primary_email: r.primaryEmail,
    secondary_email: r.secondaryEmail,
    order_value: r.orderValue,
    order_date: r.orderDate,
  }));
  const merges = mergeRows.map((m) => ({
    sourceId: m.sourceId,
    canonicalName: m.canonicalName,
    canonicalPostcode: m.canonicalPostcode,
  }));

  const idByOrder = customerIdByOrderNumber(allOrders, merges);

  // Latest new-order date per customer (local midnight of the order day).
  const latestNewOrderDate = new Map<string, Date>();
  for (const o of newOrders) {
    const id = idByOrder.get(o.sales_order_number);
    if (!id) continue;
    const d = parseOrderDate(o.order_date);
    const prev = latestNewOrderDate.get(id);
    if (!prev || d > prev) latestNewOrderDate.set(id, d);
  }

  const newCustomerIds = Array.from(latestNewOrderDate.keys());
  if (newCustomerIds.length === 0) return;

  const candidates = await prisma.customerStatus.findMany({
    where: { customerId: { in: newCustomerIds }, status: { in: REACTIVATE_FROM } },
  });

  // Only reactivate when the order was placed on or after the day the status was set.
  const toReactivate = candidates.filter((c) => {
    const orderDate = latestNewOrderDate.get(c.customerId);
    if (!orderDate) return false;
    const setDay = new Date(c.setAt.getFullYear(), c.setAt.getMonth(), c.setAt.getDate());
    return orderDate >= setDay;
  });

  if (toReactivate.length === 0) return;

  const now = new Date();
  const closedOnes = toReactivate.filter((c) => c.status === 'closed');

  // Reopen notifications apply only to closed customers (reopening a closed
  // account is notable; a dormant/lost customer re-ordering is routine).
  const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
  const adminIds = new Set(admins.map((a) => a.id));
  const notifications: {
    userId: string;
    type: string;
    customerId: string;
    customerName: string;
    message: string;
  }[] = [];
  for (const d of closedOnes) {
    for (const admin of admins) {
      notifications.push({
        userId: admin.id,
        type: 'auto_reactivated',
        customerId: d.customerId,
        customerName: d.customerName,
        message:
          d.approvalStatus === 'pending'
            ? `${d.customerName} placed a new order — pending closure request cancelled, status set to Ordered.`
            : `${d.customerName} placed a new order — reopened and status set to Ordered.`,
      });
    }
    if (d.approvalStatus === 'pending' && !adminIds.has(d.setById)) {
      notifications.push({
        userId: d.setById,
        type: 'auto_reactivated',
        customerId: d.customerId,
        customerName: d.customerName,
        message: `Your closure request for ${d.customerName} was cancelled — they placed a new order.`,
      });
    }
  }

  await prisma.$transaction([
    ...toReactivate.map((c) =>
      prisma.customerStatus.update({
        where: { customerId: c.customerId },
        data: {
          status: 'ordered',
          approvalStatus: 'approved',
          reason: `Auto-set to Ordered — placed an order after being marked ${c.status}.`,
          setById: actingUserId,
          setAt: now,
          approvedById: actingUserId,
          approvedAt: now,
        },
      }),
    ),
    prisma.notification.deleteMany({
      where: { type: 'deactivation_request', customerId: { in: closedOnes.map((c) => c.customerId) } },
    }),
    prisma.notification.createMany({ data: notifications }),
    prisma.customerActivity.createMany({
      data: toReactivate.map((c) => ({
        customerId: c.customerId,
        type: 'status',
        detail: `Auto-set to Ordered — placed an order after being marked ${c.status}`,
        actorName,
      })),
    }),
  ]);
}

export async function DELETE() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await prisma.rawOrderRow.deleteMany();
  return NextResponse.json({ ok: true });
}
