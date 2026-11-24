'use client';

import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  type: 'status' | 'assignment';
  detail: string;
  actorName: string;
  createdAt: string;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ActivityPanel({ customerId }: { customerId: string }) {
  const [items, setItems] = useState<Activity[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/customers/${encodeURIComponent(customerId)}/activity`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Activity[]) => {
        if (!active) return;
        setItems(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => active && setLoaded(true));
    return () => { active = false; };
  }, [customerId]);

  if (!loaded) return <p className="text-[13px] text-[#9CA3AF]">Loading…</p>;
  if (items.length === 0) {
    return <p className="text-[13px] text-[#9CA3AF]">No activity recorded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((a) => (
        <div key={a.id} className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
          <div className="flex items-start gap-2">
            <span
              title={a.type === 'assignment' ? 'Assignment' : 'Status'}
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                a.type === 'assignment' ? 'bg-[#3B82F6]' : 'bg-[#8B5CF6]'
              }`}
            />
            <div className="min-w-0">
              <p className="text-[13px] text-[#111827]">{a.detail}</p>
              <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                {a.actorName} · {formatDateTime(a.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
