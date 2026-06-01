'use client';

import { useState, useEffect } from 'react';
import { CustomerStatusType, STATUS_CONFIG } from '@/lib/types';

interface Props {
  customerName: string;
  currentStatus: CustomerStatusType | null; // null = currently 'Active'
  isTeam: boolean;
  onClose: () => void;
  // status === null means clear to Active
  onConfirm: (status: CustomerStatusType | null, reason: string) => Promise<void>;
}

const STATUS_ORDER: CustomerStatusType[] = [
  'hot', 'possible', 'seasonal', 'no_response', 'dormant', 'deactivated',
];

export default function StatusModal({
  customerName,
  currentStatus,
  isTeam,
  onClose,
  onConfirm,
}: Props) {
  const [selected, setSelected] = useState<CustomerStatusType | null>(currentStatus);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, submitting]);

  const isDeactivation = selected === 'deactivated';
  const reasonRequired = isDeactivation;
  const reasonLabel = reasonRequired ? 'Reason (required)' : 'Reason (optional)';
  const noChange = selected === currentStatus;

  const handleSubmit = async () => {
    if (noChange) {
      onClose();
      return;
    }
    if (reasonRequired && !reason.trim()) {
      setError('Please give a reason.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(selected, reason.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={() => !submitting && onClose()}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#E5E7EB] bg-white shadow-2xl">
        <div className="border-b border-[#F3F4F6] px-5 py-4">
          <h3 className="text-base font-semibold text-[#111827]">Set customer status</h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            Update the status for{' '}
            <span className="font-medium text-[#374151]">{customerName}</span>.
          </p>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Status grid */}
          <div>
            <p className="mb-2 text-xs font-medium text-[#6B7280]">Status</p>
            <div className="grid grid-cols-3 gap-2">
              {/* Active (clears) */}
              <button
                type="button"
                onClick={() => setSelected(null)}
                disabled={submitting}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  selected === null
                    ? 'border-[#374151] bg-[#111827] text-white'
                    : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#9CA3AF] hover:text-[#374151]'
                }`}
              >
                Active
              </button>
              {STATUS_ORDER.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const active = selected === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelected(s)}
                    disabled={submitting}
                    className={`cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? `${cfg.bg} ${cfg.text} ring-1 ${cfg.ring} border-transparent`
                        : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#9CA3AF] hover:text-[#374151]'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? cfg.dot : 'bg-[#D1D5DB]'}`} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Approval notice for team users picking Deactivated */}
          {isTeam && isDeactivation && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Deactivation requires admin approval. This will be sent as a request — the customer
              stays visible (with a Pending badge) until an admin approves it.
            </p>
          )}

          {/* Reason field — only shown when a status is selected (not Active) */}
          {selected !== null && (
            <div>
              <label className="block text-xs font-medium text-[#6B7280]">{reasonLabel}</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
                placeholder={reasonRequired ? 'e.g. closed down, no longer trading…' : 'Optional notes…'}
                rows={3}
                className="mt-1.5 w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none transition-colors focus:border-[#6B7280] disabled:bg-[#F9FAFB]"
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#F3F4F6] px-5 py-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:border-[#9CA3AF] hover:text-[#374151] disabled:cursor-default disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || noChange}
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium text-white transition-colors disabled:cursor-default disabled:opacity-60 ${
              isDeactivation ? 'bg-red-600 hover:bg-red-700' : 'bg-[#111827] hover:bg-[#374151]'
            }`}
          >
            {submitting
              ? 'Saving…'
              : isTeam && isDeactivation
                ? 'Submit request'
                : selected === null
                  ? 'Set to Active'
                  : 'Save status'}
          </button>
        </div>
      </div>
    </>
  );
}
