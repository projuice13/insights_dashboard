import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
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
  }

  return NextResponse.json({ imported: newOrders.length, skipped });
}

export async function DELETE() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await prisma.rawOrderRow.deleteMany();
  return NextResponse.json({ ok: true });
}
