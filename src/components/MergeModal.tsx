'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/lib/types';

interface MergeModalProps {
  customers: Customer[];
  merging: boolean;
  error: string | null;
  onConfirm: (canonical: Customer, sources: Customer[]) => void;
  onCancel: () => void;
}

export default function MergeModal({ customers, merging, error, onConfirm, onCancel }: MergeModalProps) {
  const [canonicalId, setCanonicalId] = useState(customers[0]?.id ?? '');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  const canonical = customers.find((c) => c.id === canonicalId) ?? customers[0];
  const sources = customers.filter((c) => c.id !== canonicalId);

  const formatDate = (d: Date | string) => {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]" onClick={() => !merging && onCancel()} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
        <div className="px-6 py-5">
          <h2 className="text-base font-semibold text-[#111827]">Merge customers</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Choose which profile to keep as primary. All order history and comments will be combined into it.
          </p>

          <div className="mt-4 space-y-2">
            {customers.map((c) => (
              <label
                key={c.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  canonicalId === c.id
                    ? 'border-[#111827] bg-[#F9FAFB]'
                    : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
                }`}
              >
                <input
                  type="radio"
                  name="canonical"
                  value={c.id}
                  checked={canonicalId === c.id}
                  onChange={() => setCanonicalId(c.id)}
                  className="mt-0.5 accent-[#111827]"
                  disabled={merging}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#111827]">{c.name}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    {c.postcode} · {c.totalOrders} order{c.totalOrders !== 1 ? 's' : ''} · Last order {formatDate(c.lastOrderDate)}
                  </p>
                </div>
                {canonicalId === c.id && (
                  <span className="shrink-0 rounded-full bg-[#111827] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Primary
                  </span>
                )}
              </label>
            ))}
          </div>

          <p className="mt-3 text-xs text-[#9CA3AF]">
            The primary profile's name and details will be used going forward. Source profiles will no longer appear separately.
          </p>

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
          <button
            onClick={onCancel}
            disabled={merging}
            className="cursor-pointer rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:border-[#9CA3AF] hover:text-[#374151] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(canonical, sources)}
            disabled={merging}
            className="cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#374151] disabled:cursor-default disabled:opacity-60"
          >
            {merging ? 'Merging…' : 'Merge customers'}
          </button>
        </div>
      </div>
    </>
  );
}
