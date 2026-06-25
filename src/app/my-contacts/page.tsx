import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/db';
import { buildCustomers } from '@/lib/dataTransforms';
import {
  RawOrder,
  Assignments,
  CustomerStatuses,
  CustomerStatusType,
  AppNotification,
} from '@/lib/types';
import TeamDashboardClient from '@/components/TeamDashboardClient';

export default async function MyContactsPage() {
  const session = await verifySession();

  if (session.role === 'admin') redirect('/');

  const [rows, mergeRows] = await Promise.all([
    prisma.rawOrderRow.findMany(),
    prisma.customerMerge.findMany(),
  ]);
  const rawOrders: RawOrder[] = rows.map((r) => ({
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
  const allCustomers = rawOrders.length > 0 ? buildCustomers(rawOrders, merges) : [];

  const allAssignmentRows = await prisma.assignment.findMany({
    include: { user: { select: { name: true } } },
  });
  const assignments: Assignments = {};
  for (const a of allAssignmentRows) {
    assignments[a.customerId] = a.user.name;
  }

  const myAssignedIds = allAssignmentRows
    .filter((a) => a.userId === session.userId)
    .map((a) => a.customerId);

  const users = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true, name: true, email: true, role: true },
  });

  const commentedCustomerIds = await prisma.comment.findMany({
    select: { customerId: true },
    distinct: ['customerId'],
  });
  const customersWithComments = commentedCustomerIds.map((c) => c.customerId);

  const statusRows = await prisma.customerStatus.findMany({
    include: {
      setBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
    },
  });
  const customerStatuses: CustomerStatuses = {};
  for (const s of statusRows) {
    customerStatuses[s.customerId] = {
      customerId: s.customerId,
      customerName: s.customerName,
      status: s.status as CustomerStatusType,
      approvalStatus: s.approvalStatus as 'approved' | 'pending',
      reason: s.reason,
      setById: s.setById,
      setByName: s.setBy.name,
      setAt: s.setAt.toISOString(),
      approvedById: s.approvedById,
      approvedByName: s.approvedBy?.name ?? null,
      approvedAt: s.approvedAt?.toISOString() ?? null,
    };
  }

  const notificationRows = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const notifications: AppNotification[] = notificationRows.map((n) => ({
    id: n.id,
    type: n.type as AppNotification['type'],
    customerId: n.customerId,
    customerName: n.customerName,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <TeamDashboardClient
      initialCustomers={allCustomers}
      initialAssignments={assignments}
      initialCustomersWithComments={customersWithComments}
      users={users}
      currentUser={{ id: session.userId, name: session.name }}
      myAssignedIds={myAssignedIds}
      customerStatuses={customerStatuses}
      notifications={notifications}
    />
  );
}
