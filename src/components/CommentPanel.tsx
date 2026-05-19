'use client';

import { useState, useEffect, useTransition } from 'react';

interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  user: { name: string };
}

interface CommentPanelProps {
  customerId: string;
  currentUser: { id: string; name: string };
  initialComments?: Comment[];
  onCommentAdded?: (customerId: string) => void;
  onAllCommentsDeleted?: (customerId: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function CommentPanel({
  customerId,
  currentUser,
  initialComments,
  onCommentAdded,
  onAllCommentsDeleted,
}: CommentPanelProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments ?? []);
  const [loaded, setLoaded] = useState(!!initialComments);
  const [text, setText] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fetch comments lazily if not passed in (admin view)
  useEffect(() => {
    if (loaded) return;
    fetch(`/api/comments/${encodeURIComponent(customerId)}`)
      .then((r) => r.json())
      .then((data: Comment[]) => {
        setComments(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [customerId, loaded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitError(null);

    startTransition(async () => {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, text: text.trim() }),
      });

      if (!res.ok) {
        setSubmitError('Failed to save note.');
        return;
      }

      const comment: Comment = await res.json();
      setComments((prev) => [comment, ...prev]);
      onCommentAdded?.(customerId);
      setText('');
    });
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    const res = await fetch(`/api/comment/${encodeURIComponent(commentId)}`, { method: 'DELETE' });
    setDeletingId(null);
    if (!res.ok) return;
    setComments((prev) => {
      const next = prev.filter((c) => c.id !== commentId);
      if (next.length === 0) onAllCommentsDeleted?.(customerId);
      return next;
    });
  };

  const startEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditText(c.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) return;
    setEditSaving(true);

    const res = await fetch(`/api/comment/${encodeURIComponent(commentId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editText.trim() }),
    });

    setEditSaving(false);

    if (!res.ok) return;

    const updated: Comment = await res.json();
    setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="space-y-3">
      {/* Existing comments */}
      {!loaded ? (
        <p className="text-[13px] text-[#9CA3AF]">Loading…</p>
      ) : comments.length === 0 ? (
        <p className="text-[13px] text-[#9CA3AF]">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => {
            const isOwner = c.userId === currentUser.id;
            const isEditing = editingId === c.id;

            return (
              <div
                key={c.id}
                className="group relative rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2"
              >
                {isEditing ? (
                  /* ── Edit mode ── */
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      autoFocus
                      className="w-full rounded-lg border border-[#6B7280] bg-white px-3 py-2 text-[13px] text-[#374151] outline-none resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveEdit(c.id)}
                        disabled={editSaving || !editText.trim()}
                        className="cursor-pointer rounded-lg bg-[#111827] px-3 py-1 text-[12px] font-medium text-white transition-colors hover:bg-[#374151] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {editSaving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="cursor-pointer text-[12px] text-[#9CA3AF] hover:text-[#374151]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Read mode ── */
                  <>
                    <p className="text-[13px] text-[#111827] whitespace-pre-wrap pr-14">{c.text}</p>
                    <p className="mt-1 text-[11px] text-[#9CA3AF]">
                      {c.user.name} · {formatDate(c.createdAt)}
                    </p>

                    {isOwner && (
                      <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        {/* Edit button */}
                        <button
                          onClick={() => startEdit(c)}
                          title="Edit note"
                          className="cursor-pointer rounded p-0.5 text-[#D1D5DB] hover:text-[#6B7280]"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          title="Delete note"
                          className="cursor-pointer rounded p-0.5 text-[#D1D5DB] hover:text-red-400 disabled:opacity-40"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 4h12M5 4V2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V4m2 0v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6.5 7v4M9.5 7v4" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add note form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a call note…"
          rows={3}
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-[13px] text-[#374151] outline-none focus:border-[#6B7280] resize-none"
        />
        {submitError && <p className="text-xs text-red-600">{submitError}</p>}
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="cursor-pointer rounded-lg bg-[#111827] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#374151] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Saving…' : 'Add note'}
        </button>
      </form>
    </div>
  );
}
