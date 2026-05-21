import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/db';
import { buildCustomers } from '@/lib/dataTransforms';
import { RawOrder, Assignments, Deactivations, AppNotification } from '@/lib/types';
import TeamDashboardClient from '@/components/TeamDashboardClient';

export default async function MyContactsPage() {
  const session = await verifySession();

  // Admins should use the main dashboard
  if (session.role === 'admin') redirect('/');

  // Build all customers from full order history
  const rows = await prisma.rawOrderRow.findMany();
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
  const allCustomers = rawOrders.length > 0 ? buildCustomers(rawOrders) : [];

  // All assignments → map customerId → assignee name
  const allAssignmentRows = await prisma.assignment.findMany({
    include: { user: { select: { name: true } } },
  });
  const assignments: Assignments = {};
  for (const a of allAssignmentRows) {
    assignments[a.customerId] = a.user.name;
  }

  // IDs assigned specifically to this team user
  const myAssignedIds = allAssignmentRows
    .filter((a) => a.userId === session.userId)
    .map((a) => a.customerId);

  // All admin users (for the assignment display column)
  const users = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true, name: true, email: true, role: true },
  });

  // Customers that have at least one comment
  const commentedCustomerIds = await prisma.comment.findMany({
    select: { customerId: true },
    distinct: ['customerId'],
  });
  const customersWithComments = commentedCustomerIds.map((c) => c.customerId);

  // Deactivations
  const deactivationRows = await prisma.deactivation.findMany({
    include: {
      requestedBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
    },
  });
  const deactivations: Deactivations = {};
  for (const d of deactivationRows) {
    deactivations[d.customerId] = {
      customerId: d.customerId,
      customerName: d.customerName,
      status: d.status as 'pending' | 'active',
      reason: d.reason,
      requestedById: d.requestedById,
      requestedByName: d.requestedBy.name,
      requestedAt: d.requestedAt.toISOString(),
      approvedById: d.approvedById,
      approvedByName: d.approvedBy?.name ?? null,
      approvedAt: d.approvedAt?.toISOString() ?? null,
    };
  }

  // Notifications for this user
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
      deactivations={deactivations}
      notifications={notifications}
    />
  );
}
