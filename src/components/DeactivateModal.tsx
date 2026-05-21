'use client';

import { useState, useEffect } from 'react';

interface Props {
  customerName: string;
  isTeam: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function DeactivateModal({ customerName, isTeam, onClose, onConfirm }: Props) {
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

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('Please give a reason.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(trimmed);
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
          <h3 className="text-base font-semibold text-[#111827]">
            {isTeam ? 'Request to deactivate customer' : 'Deactivate customer'}
          </h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            {isTeam ? (
              <>
                <span className="font-medium text-[#374151]">{customerName}</span> will be submitted
                for admin approval.
              </>
            ) : (
              <>
                <span className="font-medium text-[#374151]">{customerName}</span> will be hidden
                from the default list. You can reactivate them later.
              </>
            )}
          </p>
        </div>

        <div className="px-5 py-4">
          <label className="block text-xs font-medium text-[#6B7280]">
            Reason for deactivation
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
            placeholder="e.g. closed down, no longer trading…"
            rows={4}
            autoFocus
            className="mt-1.5 w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none transition-colors focus:border-[#6B7280] disabled:bg-[#F9FAFB]"
          />
          {error && (
            <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
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
            disabled={submitting}
            className="cursor-pointer rounded-lg bg-red-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-default disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : isTeam ? 'Submit request' : 'Deactivate'}
          </button>
        </div>
      </div>
    </>
  );
}
