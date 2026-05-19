'use client';

import { useState, useCallback } from 'react';
import { Customer, Assignments, AdminUser } from '@/lib/types';
import { parseCSV } from '@/lib/parseCSV';

// JSON serialises Date → string; convert them back after any API response
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
import CsvUploader from './CsvUploader';
import Dashboard from './Dashboard';

interface Props {
  initialCustomers: Customer[] | null;
  initialAssignments: Assignments;
  initialCustomersWithComments: string[];
  users: AdminUser[];
  currentUser: { id: string; name: string };
}

export default function AdminDashboardClient({
  initialCustomers,
  initialAssignments,
  initialCustomersWithComments,
  users,
  currentUser,
}: Props) {
  const [customers, setCustomers] = useState<Customer[] | null>(
    initialCustomers ? rehydrateDates(initialCustomers) : null,
  );
  const [assignments, setAssignments] = useState<Assignments>(initialAssignments);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [importStats, setImportStats] = useState<{ imported: number; skipped: number } | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setImportStats(null);

    const { orders, error: parseError } = await parseCSV(file);

    if (parseError || orders.length === 0) {
      setError(parseError ?? 'No order data found in the CSV file.');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/admin/upload-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Failed to import CSV.');
      setLoading(false);
      return;
    }

    setCustomers(rehydrateDates(data.customers));
    setImportStats({ imported: data.imported, skipped: data.skipped });
    setLoading(false);
  }, []);

  const handleAssign = useCallback(
    async (ids: string[], user: AdminUser | null) => {
      setAssignments((prev) => {
        const next = { ...prev };
        if (!user) {
          ids.forEach((id) => delete next[id]);
        } else {
          ids.forEach((id) => { next[id] = user.name; });
        }
        return next;
      });

      await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds: ids, userId: user?.id ?? null }),
      });
    },
    [],
  );

  const handleReset = useCallback(async () => {
    await fetch('/api/admin/upload-csv', { method: 'DELETE' });
    setCustomers(null);
    setError(null);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#F9FAFB]" />;
  }

  if (customers) {
    return (
      <Dashboard
        customers={customers}
        assignments={assignments}
        users={users}
        currentUser={currentUser}
        initialCustomersWithComments={initialCustomersWithComments}
        importStats={importStats}
        onAssign={handleAssign}
        onImport={handleUpload}
        onReset={handleReset}
      />
    );
  }

  return <CsvUploader onUpload={handleUpload} error={error} loading={loading} />;
}
