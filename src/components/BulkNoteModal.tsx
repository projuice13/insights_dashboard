'use client';

import { useState, useEffect } from 'react';

interface BulkNoteModalProps {
  count: number;
  sending: boolean;
  error: string | null;
  onConfirm: (text: string) => void;
  onCancel: () => void;
}

export default function BulkNoteModal({ count, sending, error, onConfirm, onCancel }: BulkNoteModalProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !sending) onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel, sending]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]" onClick={() => !sending && onCancel()} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
        <div className="px-6 py-5">
          <h2 className="text-base font-semibold text-[#111827]">Add note to {count} {count === 1 ? 'customer' : 'customers'}</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            This note will be added to each selected customer&apos;s profile, attributed to you.
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={sending}
            autoFocus
            rows={4}
            placeholder="e.g. Sent Q3 re-engagement email campaign"
            className="mt-4 w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none transition-colors focus:border-[#6B7280] disabled:bg-[#F9FAFB]"
          />

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
          <button
            onClick={onCancel}
            disabled={sending}
            className="cursor-pointer rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:border-[#9CA3AF] hover:text-[#374151] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(text.trim())}
            disabled={sending || !text.trim()}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#374151] disabled:cursor-default disabled:opacity-60"
          >
            {sending && (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {sending ? 'Adding…' : 'Add note'}
          </button>
        </div>
      </div>
    </>
  );
}
