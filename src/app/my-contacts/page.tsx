import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/db';
import { buildCustomers } from '@/lib/dataTransforms';
import { RawOrder, Assignments } from '@/lib/types';
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

  // Customers that have at least one comment (for the dot indicator)
  const commentedCustomerIds = await prisma.comment.findMany({
    select: { customerId: true },
    distinct: ['customerId'],
  });
  const customersWithComments = commentedCustomerIds.map((c) => c.customerId);

  return (
    <TeamDashboardClient
      initialCustomers={allCustomers}
      initialAssignments={assignments}
      initialCustomersWithComments={customersWithComments}
      users={users}
      currentUser={{ id: session.userId, name: session.name }}
      myAssignedIds={myAssignedIds}
    />
  );
}
