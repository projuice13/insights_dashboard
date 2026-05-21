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

    try {
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

      let data: { customers?: unknown[]; imported?: number; skipped?: number; error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server error (${res.status} ${res.statusText})`);
      }

      if (!res.ok) {
        throw new Error(data.error ?? `Upload failed (${res.status})`);
      }

      if (!data.customers) {
        throw new Error('No customer data returned from server.');
      }

      setCustomers(rehydrateDates(data.customers as never));
      setImportStats({ imported: data.imported ?? 0, skipped: data.skipped ?? 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during upload.');
    } finally {
      setLoading(false);
    }
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-6 w-6 animate-spin text-[#6B7280]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p className="text-sm text-[#6B7280]">Importing, please wait…</p>
        </div>
      </div>
    );
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
