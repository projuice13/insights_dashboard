'use client';

import { useMemo } from 'react';
import { Customer, Assignments, AdminUser, CustomerStatuses, AppNotification } from '@/lib/types';
import Dashboard from './Dashboard';

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
  customerStatuses: CustomerStatuses;
  notifications: AppNotification[];
}

export default function TeamDashboardClient({
  initialCustomers,
  initialAssignments,
  initialCustomersWithComments,
  users,
  currentUser,
  myAssignedIds,
  customerStatuses,
  notifications,
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
      customerStatuses={customerStatuses}
      notifications={notifications}
    />
  );
}
