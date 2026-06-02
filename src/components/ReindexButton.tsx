'use client';

import { useState } from 'react';

const BATCH_SIZE = 15;

export default function ReindexButton() {
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const handleReindex = async () => {
    if (state === 'running') return;
    if (!window.confirm('This will re-crawl projuice.co.uk and rebuild the AI knowledge base. It takes 2–3 minutes. Continue?')) return;

    setState('running');
    setProgress({ done: 0, total: 0 });

    try {
      // Step 1: discover all URLs and clear old index
      const discoverRes = await fetch('/api/admin/crawl', { method: 'POST' });
      if (!discoverRes.ok) throw new Error('Discovery failed');
      const { urls, total } = await discoverRes.json() as { urls: string[]; total: number };
      setProgress({ done: 0, total });

      // Step 2: process in batches
      for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        const batch = urls.slice(i, i + BATCH_SIZE);
        const batchRes = await fetch('/api/admin/crawl/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: batch }),
        });
        if (!batchRes.ok) throw new Error('Batch failed');
        setProgress({ done: Math.min(i + BATCH_SIZE, total), total });
      }

      setState('done');
      // Trigger a page reload so the chunk count updates
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  if (state === 'running') {
    const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
    return (
      <div className="min-w-[180px] rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5">
        <p className="text-xs text-[#6B7280]">Indexing website…</p>
        <div className="mt-1.5 h-1 w-full rounded-full bg-[#E5E7EB]">
          <div
            className="h-full rounded-full bg-[#8B5CF6] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-[#9CA3AF]">
          {progress.done} / {progress.total} pages ({pct}%)
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={handleReindex}
      className={`cursor-pointer inline-flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
        state === 'done'
          ? 'border-green-200 bg-green-50 text-green-700'
          : state === 'error'
          ? 'border-red-200 bg-red-50 text-red-600'
          : 'border-[#E5E7EB] bg-white text-[#374151] hover:border-[#9CA3AF]'
      }`}
    >
      <svg
        className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]"
        fill="none" viewBox="0 0 16 16"
        stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M13.5 8A5.5 5.5 0 112.5 6M2.5 2.5V6H6" />
      </svg>
      {state === 'done' ? 'Indexed!' : state === 'error' ? 'Failed — retry?' : 'Re-index website'}
    </button>
  );
}
