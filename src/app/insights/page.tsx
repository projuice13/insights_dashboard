import { requireAdmin } from '@/lib/dal';
import { prisma } from '@/lib/db';
import { buildCustomers } from '@/lib/dataTransforms';
import { RawOrder, CustomerStatuses, CustomerStatusType, AppNotification } from '@/lib/types';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export default async function AdminPage() {
  const session = await requireAdmin();

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

  const assignmentRows = await prisma.assignment.findMany({ include: { user: true } });
  const assignments: Record<string, string> = {};
  for (const a of assignmentRows) {
    assignments[a.customerId] = a.user.name;
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });

  const commentedCustomers = await prisma.comment.findMany({
    select: { customerId: true },
    distinct: ['customerId'],
  });
  const customersWithComments = commentedCustomers.map((c) => c.customerId);

  // Customer status tags (deactivated, dormant, hot, etc.)
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
    <AdminDashboardClient
      initialCustomers={customers}
      initialAssignments={assignments}
      initialCustomersWithComments={customersWithComments}
      users={users}
      currentUser={{ id: session.userId, name: session.name }}
      customerStatuses={customerStatuses}
      notifications={notifications}
    />
  );
}
