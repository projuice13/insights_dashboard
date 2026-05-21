import { requireAdmin } from '@/lib/dal';
import { prisma } from '@/lib/db';
import { buildCustomers } from '@/lib/dataTransforms';
import { RawOrder, Deactivations, AppNotification } from '@/lib/types';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export default async function AdminPage() {
  const session = await requireAdmin();

  // Load all raw orders from DB and build the customer list
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
  const customers = rawOrders.length > 0 ? buildCustomers(rawOrders) : null;

  // Assignments: { customerId → teamMemberName }
  const assignmentRows = await prisma.assignment.findMany({ include: { user: true } });
  const assignments: Record<string, string> = {};
  for (const a of assignmentRows) {
    assignments[a.customerId] = a.user.name;
  }

  // All users for the assign dropdowns
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });

  // Customer IDs that have at least one comment
  const commentedCustomers = await prisma.comment.findMany({
    select: { customerId: true },
    distinct: ['customerId'],
  });
  const customersWithComments = commentedCustomers.map((c) => c.customerId);

  // Deactivations (pending and active) — keyed by customerId for O(1) lookup
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

  // Latest 50 notifications for this user
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
    <AdminDashboardClient
      initialCustomers={customers}
      initialAssignments={assignments}
      initialCustomersWithComments={customersWithComments}
      users={users}
      currentUser={{ id: session.userId, name: session.name }}
      deactivations={deactivations}
      notifications={notifications}
    />
  );
}
