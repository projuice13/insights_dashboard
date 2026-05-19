import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import { buildCustomers } from '@/lib/dataTransforms';
import { RawOrder } from '@/lib/types';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}

function rowToRawOrder(r: {
  salesOrderNumber: string;
  customerName: string;
  postcode: string;
  contactName: string;
  primaryEmail: string | null;
  secondaryEmail: string | null;
  orderValue: number;
  orderDate: string;
}): RawOrder {
  return {
    sales_order_number: r.salesOrderNumber,
    customer_name: r.customerName,
    postcode: r.postcode,
    contact_name: r.contactName,
    primary_email: r.primaryEmail,
    secondary_email: r.secondaryEmail,
    order_value: r.orderValue,
    order_date: r.orderDate,
  };
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { orders }: { orders: RawOrder[] } = await req.json();

  if (!orders?.length) {
    return NextResponse.json({ error: 'No orders provided.' }, { status: 400 });
  }

  // Find which order numbers already exist so we can skip them
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

  const imported = newOrders.length;

  // Rebuild customers from the full historical dataset
  const allRows = await prisma.rawOrderRow.findMany();
  const customers = buildCustomers(allRows.map(rowToRawOrder));

  return NextResponse.json({ customers, imported, skipped });
}

export async function DELETE() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await prisma.rawOrderRow.deleteMany();
  return NextResponse.json({ ok: true });
}
