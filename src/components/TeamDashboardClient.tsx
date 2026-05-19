'use client';

import { useMemo } from 'react';
import { Customer, Assignments, AdminUser } from '@/lib/types';
import Dashboard from './Dashboard';

// JSON serialises Date → string; convert them back after crossing the server/client boundary
function rehydrateDates(customers: Customer[]): Customer[] {
  return customers.map((c) => ({
    ...c,
    lastOrderDate: new Date(c.lastOrderDate as unknown as string),
    orders: c.orders.map((o) => ({
      ...o,
      date: new Date(o.date as unknown as string),
    })),
  }));
}

interface Props {
  initialCustomers: Customer[];
  initialAssignments: Assignments;
  initialCustomersWithComments: string[];
  users: AdminUser[];
  currentUser: { id: string; name: string };
  myAssignedIds: string[];
}

export default function TeamDashboardClient({
  initialCustomers,
  initialAssignments,
  initialCustomersWithComments,
  users,
  currentUser,
  myAssignedIds,
}: Props) {
  const customers = useMemo(() => rehydrateDates(initialCustomers), [initialCustomers]);

  return (
    <Dashboard
      customers={customers}
      assignments={initialAssignments}
      users={users}
      currentUser={currentUser}
      initialCustomersWithComments={initialCustomersWithComments}
      myAssignedIds={myAssignedIds}
    />
  );
}
