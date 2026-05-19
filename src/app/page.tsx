import { requireAdmin } from '@/lib/dal';
import { prisma } from '@/lib/db';
import { buildCustomers } from '@/lib/dataTransforms';
import { RawOrder } from '@/lib/types';
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

  // Load assignments: { customerId → teamMemberName }
  const assignmentRows = await prisma.assignment.findMany({ include: { user: true } });
  const assignments: Record<string, string> = {};
  for (const a of assignmentRows) {
    assignments[a.customerId] = a.user.name;
  }

  // Load all users for the assign dropdowns
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

  return (
    <AdminDashboardClient
      initialCustomers={customers}
      initialAssignments={assignments}
      initialCustomersWithComments={customersWithComments}
      users={users}
      currentUser={{ id: session.userId, name: session.name }}
    />
  );
}
