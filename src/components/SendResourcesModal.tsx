'use client';

import { useState } from 'react';

// Update this default message whenever needed
const DEFAULT_MESSAGE = `Hi,

We'd like to invite you to access the Projuice Resources Portal, where you can find product information, spec sheets, and more.

You can access the portal here:
https://customer-portal-black.vercel.app/

Please get in touch if you have any questions.

Kind regards,
The Projuice Team`;

export default function SendResourcesModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim() || !message.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/send-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, message }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return; }
      setSent(true);
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={() => !sending && onClose()}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#E5E7EB] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F3F4F6] px-5 py-4">
          <h3 className="text-base font-semibold text-[#111827]">Send Resources Site Link</h3>
          <button
            onClick={() => !sending && onClose()}
            className="cursor-pointer rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="px-5 py-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10l4 4 8-8" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#111827]">Email sent!</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">The resources portal link has been sent to {email}.</p>
            <button
              onClick={onClose}
              className="mt-4 cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#374151]"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 px-5 py-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-[#6B7280]">Recipient email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={sending}
                  placeholder="customer@example.com"
                  className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none transition-colors focus:border-[#6B7280] disabled:bg-[#F9FAFB]"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-[#6B7280]">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sending}
                  rows={10}
                  className="mt-1.5 w-full resize-y rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none transition-colors focus:border-[#6B7280] disabled:bg-[#F9FAFB]"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-[#F3F4F6] px-5 py-3">
              <button
                onClick={() => !sending && onClose()}
                disabled={sending}
                className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#6B7280] hover:border-[#9CA3AF] hover:text-[#374151] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !email.trim()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#374151] disabled:cursor-default disabled:opacity-50"
              >
                {sending && (
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
