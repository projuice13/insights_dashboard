'use client';

import { useEffect } from 'react';
import { Customer } from '@/lib/types';

interface AssignModalProps {
  customers: Customer[];
  teamMember: { name: string; email: string };
  onConfirm: () => void;
  onCancel: () => void;
  sending: boolean;
  error: string | null;
}

export default function AssignModal({ customers, teamMember, onConfirm, onCancel, sending, error }: AssignModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
        <div className="px-6 py-5">
          <h2 className="text-base font-semibold text-[#111827]">Assign customers</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Assigning{' '}
            <span className="font-medium text-[#374151]">
              {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
            </span>{' '}
            to{' '}
            <span className="font-medium text-[#374151]">{teamMember.name}</span>.
          </p>

          <div className="mt-4 max-h-40 overflow-y-auto rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
            {customers.map((c) => (
              <div key={c.id} className="flex items-center gap-2 border-b border-[#F3F4F6] px-3 py-2 last:border-0">
                <span className="text-[13px] font-medium text-[#111827]">{c.name}</span>
                <span className="text-[13px] text-[#9CA3AF]">·</span>
                <span className="text-[13px] text-[#6B7280]">{c.postcode}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:border-[#9CA3AF] hover:text-[#374151]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={sending}
            className="cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#374151] disabled:opacity-60 disabled:cursor-default"
          >
            {sending ? 'Sending…' : 'Assign & send email'}
          </button>
        </div>
      </div>
    </>
  );
}
