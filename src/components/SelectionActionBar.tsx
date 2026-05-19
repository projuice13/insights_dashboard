'use client';

import { useState } from 'react';
import { Customer, Assignments, AdminUser } from '@/lib/types';
import { exportCustomersCSV } from '@/lib/exportCSV';
import AssignModal from './AssignModal';

interface SelectionActionBarProps {
  selected: Set<string>;
  customers: Customer[];
  assignments: Assignments;
  users: AdminUser[];
  onClear: () => void;
  onAssign: (ids: string[], user: AdminUser | null) => void;
}

export default function SelectionActionBar({
  selected,
  customers,
  assignments,
  users,
  onClear,
  onAssign,
}: SelectionActionBarProps) {
  const [pendingUser, setPendingUser] = useState<AdminUser | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  if (selected.size === 0) return null;

  const selectedCustomers = customers.filter((c) => selected.has(c.id));
  const allAssigned =
    selectedCustomers.length > 0 &&
    selectedCustomers.every((c) => assignments[c.id]);

  const handleDownload = () => exportCustomersCSV(selectedCustomers);

  const handleUnassign = () => {
    onAssign(selectedCustomers.map((c) => c.id), null);
    onClear();
  };

  const handleAssignSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const member = users.find((m) => m.id === e.target.value);
    if (member) { setPendingUser(member); setSendError(null); }
    e.target.value = '';
  };

  const handleConfirmAssign = async () => {
    if (!pendingUser) return;
    setSending(true);
    setSendError(null);

    try {
      const res = await fetch('/api/send-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customers: selectedCustomers.map((c) => ({
            name: c.name,
            email: c.email,
            postcode: c.postcode,
            contactName: c.contactName,
            customerType: c.customerType,
            totalSpend: c.totalSpend,
            lastOrderDate:
              c.lastOrderDate instanceof Date
                ? c.lastOrderDate.toISOString().split('T')[0]
                : c.lastOrderDate,
            gapRatio: c.gapRatio,
            riskLevel: c.riskLevel,
          })),
          teamMember: { name: pendingUser.name, email: pendingUser.email },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSendError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      onAssign(selectedCustomers.map((c) => c.id), pendingUser);
      setPendingUser(null);
      onClear();
    } catch {
      setSendError('Could not reach the server. Make sure the app is running.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
        <span className="text-sm text-[#374151]">
          <span className="font-semibold">{selected.size}</span>{' '}
          {selected.size === 1 ? 'customer' : 'customers'} selected
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[#6B7280]">Assign to</label>
            <select
              defaultValue=""
              onChange={handleAssignSelect}
              className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm text-[#374151] outline-none focus:border-[#6B7280] focus:ring-0"
            >
              <option value="" disabled>Select team member…</option>
              {users.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {allAssigned && (
            <>
              <div className="h-4 w-px bg-[#E5E7EB]" />
              <button
                onClick={handleUnassign}
                className="cursor-pointer rounded-lg border border-[#E5E7EB] px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
              >
                Unassign
              </button>
            </>
          )}

          <div className="h-4 w-px bg-[#E5E7EB]" />

          <button
            onClick={handleDownload}
            className="cursor-pointer rounded-lg border border-[#E5E7EB] px-4 py-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:border-[#9CA3AF] hover:text-[#374151]"
          >
            Download CSV
          </button>
          <button
            onClick={onClear}
            className="cursor-pointer text-sm text-[#9CA3AF] hover:text-[#374151] underline underline-offset-2"
          >
            Clear
          </button>
        </div>
      </div>

      {pendingUser && (
        <AssignModal
          customers={selectedCustomers}
          teamMember={{ name: pendingUser.name, email: pendingUser.email }}
          sending={sending}
          error={sendError}
          onConfirm={handleConfirmAssign}
          onCancel={() => {
            if (!sending) { setPendingUser(null); setSendError(null); }
          }}
        />
      )}
    </>
  );
}
