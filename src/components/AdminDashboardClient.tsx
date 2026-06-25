'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Customer, Assignments, AdminUser, CustomerStatuses, AppNotification } from '@/lib/types';
import { parseCSV } from '@/lib/parseCSV';
import CsvUploader from './CsvUploader';
import Dashboard from './Dashboard';

// JSON serialises Date → string; convert them back after any server response
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

// Vercel caps request bodies at 4.5 MB. Each order is ~200 B of JSON, so
// 500 orders per chunk = ~100 KB — well under the limit and fast to process.
const CHUNK_SIZE = 500;

interface Props {
  initialCustomers: Customer[] | null;
  initialAssignments: Assignments;
  initialCustomersWithComments: string[];
  users: AdminUser[];
  currentUser: { id: string; name: string };
  customerStatuses: CustomerStatuses;
  notifications: AppNotification[];
}

export default function AdminDashboardClient({
  initialCustomers,
  initialAssignments,
  initialCustomersWithComments,
  users,
  currentUser,
  customerStatuses,
  notifications,
}: Props) {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[] | null>(
    initialCustomers ? rehydrateDates(initialCustomers) : null,
  );
  const [assignments, setAssignments] = useState<Assignments>(initialAssignments);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [importStats, setImportStats] = useState<{ imported: number; skipped: number } | null>(null);

  // Re-sync local state when the server sends fresh data (after router.refresh)
  useEffect(() => {
    setCustomers(initialCustomers ? rehydrateDates(initialCustomers) : null);
  }, [initialCustomers]);

  useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    setImportStats(null);
    setUploadProgress({ done: 0, total: 0 });

    try {
      const { orders, error: parseError } = await parseCSV(file);

      if (parseError || orders.length === 0) {
        setError(parseError ?? 'No order data found in the CSV file.');
        setUploadProgress(null);
        return;
      }

      setUploadProgress({ done: 0, total: orders.length });

      let totalImported = 0;
      let totalSkipped = 0;

      // Send orders in chunks to stay under Vercel's 4.5 MB body limit
      for (let i = 0; i < orders.length; i += CHUNK_SIZE) {
        const chunk = orders.slice(i, i + CHUNK_SIZE);

        const res = await fetch('/api/admin/upload-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orders: chunk }),
        });

        let data: { imported?: number; skipped?: number; error?: string };
        try {
          data = await res.json();
        } catch {
          throw new Error(`Server error (${res.status} ${res.statusText})`);
        }

        if (!res.ok) {
          throw new Error(data.error ?? `Upload failed (${res.status})`);
        }

        totalImported += data.imported ?? 0;
        totalSkipped += data.skipped ?? 0;
        setUploadProgress({ done: Math.min(i + CHUNK_SIZE, orders.length), total: orders.length });
      }

      setImportStats({ imported: totalImported, skipped: totalSkipped });

      // Reload server data — the page re-runs buildCustomers() from the full DB
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during upload.');
    } finally {
      setUploadProgress(null);
    }
  }, [router]);

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

      // Build a {customerId: name} map for notification messages
      const customerNames: Record<string, string> = {};
      if (customers) {
        for (const c of customers) {
          if (ids.includes(c.id)) customerNames[c.id] = c.name;
        }
      }

      await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds: ids, userId: user?.id ?? null, customerNames }),
      });
    },
    [customers],
  );

  const handleMerge = useCallback(async (canonical: Customer, sources: Customer[]) => {
    const res = await fetch('/api/admin/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        canonical: { id: canonical.id, name: canonical.name, postcode: canonical.postcode },
        sourceIds: sources.map((s) => s.id),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? 'Failed to merge customers.');
    }
    router.refresh();
  }, [router]);

  const handleReset = useCallback(async () => {
    await fetch('/api/admin/upload-csv', { method: 'DELETE' });
    setCustomers(null);
    setError(null);
    router.refresh();
  }, [router]);

  if (uploadProgress) {
    const pct = uploadProgress.total > 0
      ? Math.round((uploadProgress.done / uploadProgress.total) * 100)
      : 0;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-4 w-72">
          <svg className="h-6 w-6 animate-spin text-[#6B7280]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <p className="text-sm text-[#374151]">Importing orders…</p>
          <div className="w-full h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
            <div
              className="h-full bg-[#111827] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-[#9CA3AF]">
            {uploadProgress.done.toLocaleString()} / {uploadProgress.total.toLocaleString()} ({pct}%)
          </p>
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
        customerStatuses={customerStatuses}
        notifications={notifications}
        importStats={importStats}
        onAssign={handleAssign}
        onMerge={handleMerge}
        onImport={handleUpload}
        onReset={handleReset}
      />
    );
  }

  return <CsvUploader onUpload={handleUpload} error={error} loading={false} />;
}
