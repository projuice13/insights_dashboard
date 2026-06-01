'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppNotification, Customer } from '@/lib/types';

interface Props {
  initialNotifications: AppNotification[];
  customers: Customer[];
  isAdmin: boolean;
  onOpenCustomer: (customer: Customer) => void;
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function NotificationsMenu({
  initialNotifications,
  customers,
  isAdmin,
  onOpenCustomer,
}: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [busyId, setBusyId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Keep state in sync when the page reloads server data
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = async () => {
    const wasOpen = open;
    setOpen(!wasOpen);
    // Mark everything as read when opening (if there are unread items)
    if (!wasOpen && unreadCount > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      try {
        await fetch('/api/notifications/read-all', { method: 'POST' });
      } catch {
        // ignore
      }
    }
  };

  const handleClickNotification = useCallback(
    (n: AppNotification) => {
      const customer = customers.find((c) => c.id === n.customerId);
      if (customer) {
        setOpen(false);
        onOpenCustomer(customer);
      }
    },
    [customers, onOpenCustomer],
  );

  const handleApprove = async (n: AppNotification) => {
    setBusyId(n.id);
    try {
      const res = await fetch(`/api/customer-statuses/${n.customerId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      // Remove the notification locally
      setNotifications((prev) => prev.filter((x) => x.id !== n.id));
      router.refresh();
    } catch {
      // Optimistic rollback would go here in a fancier UI
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (n: AppNotification) => {
    setBusyId(n.id);
    try {
      const res = await fetch(`/api/customer-statuses/${n.customerId}/reject`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      setNotifications((prev) => prev.filter((x) => x.id !== n.id));
      router.refresh();
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className={`cursor-pointer relative flex items-center justify-center rounded-lg border w-9 h-9 transition-colors ${
          open
            ? 'border-[#9CA3AF] bg-[#F9FAFB] text-[#374151]'
            : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#9CA3AF] hover:text-[#374151]'
        }`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 3a4.5 4.5 0 00-4.5 4.5v3.379a2 2 0 01-.586 1.414L3.5 13.71h13l-1.414-1.414A2 2 0 0114.5 10.88V7.5A4.5 4.5 0 0010 3z" />
          <path d="M8 16.5a2 2 0 004 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
          <div className="border-b border-[#F3F4F6] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#111827]">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[#9CA3AF]">
                You&apos;re all caught up.
              </p>
            ) : (
              notifications.map((n) => {
                const isPendingRequest = isAdmin && n.type === 'deactivation_request';
                return (
                  <div
                    key={n.id}
                    className="border-b border-[#F3F4F6] px-4 py-3 last:border-b-0"
                  >
                    <button
                      onClick={() => handleClickNotification(n)}
                      className="w-full cursor-pointer text-left"
                    >
                      <p className="text-sm text-[#374151] leading-snug">{n.message}</p>
                      <p className="mt-1 text-[11px] text-[#9CA3AF]">{timeAgo(n.createdAt)}</p>
                    </button>
                    {isPendingRequest && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleApprove(n)}
                          disabled={busyId === n.id}
                          className="cursor-pointer flex-1 rounded-md bg-[#111827] px-2 py-1 text-xs font-medium text-white hover:bg-[#374151] disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(n)}
                          disabled={busyId === n.id}
                          className="cursor-pointer flex-1 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-xs font-medium text-[#6B7280] hover:border-[#9CA3AF] hover:text-[#374151] disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
