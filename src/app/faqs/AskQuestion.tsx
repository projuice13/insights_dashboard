'use client';

import { useState, useRef, useEffect } from 'react';

export default function AskQuestion({ isAdmin = false }: { isAdmin?: boolean }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chunkCount, setChunkCount] = useState<number | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  // Check how many pages are indexed on mount
  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/helper/status')
      .then((r) => r.json())
      .then((d) => setChunkCount(d.total))
      .catch(() => {});
  }, [isAdmin]);

  // Scroll answer into view as it streams
  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [answer]);

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || loading) return;

    setAnswer('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/helper/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        setError('Something went wrong. Please try again.');
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setAnswer(text);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Admin: show indexed chunk count */}
      {isAdmin && chunkCount !== null && (
        <p className={`text-xs ${chunkCount === 0 ? 'text-red-500 font-medium' : 'text-[#9CA3AF]'}`}>
          {chunkCount === 0
            ? '⚠ Knowledge base is empty — click Re-index website above before asking questions.'
            : `${chunkCount.toLocaleString()} content chunks indexed across the website.`}
        </p>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAsk(); }}
          placeholder="Ask a question about our products, delivery or services…"
          disabled={loading}
          className="flex-1 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#6B7280] disabled:bg-[#F9FAFB]"
        />
        <button
          onClick={handleAsk}
          disabled={!question.trim() || loading}
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#111827] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#374151] disabled:cursor-default disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Thinking…
            </>
          ) : (
            <>
              Ask
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Streaming answer */}
      {(answer || loading) && (
        <div ref={answerRef} className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-4">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
              AI Answer — based on projuice.co.uk content
            </p>
          </div>
          {answer ? (
            <div className="space-y-2 text-sm leading-relaxed text-[#374151] whitespace-pre-wrap">
              {answer}
              {loading && <span className="inline-block h-4 w-0.5 animate-pulse bg-[#9CA3AF]" />}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Searching knowledge base…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
