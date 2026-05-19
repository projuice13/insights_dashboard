'use client';

import { useState, useCallback } from 'react';
import { Customer } from '@/lib/types';
import { logoutAction } from '@/app/actions/auth';
import SidePanel from './SidePanel';
import RiskBadge from './RiskBadge';

interface Comment {
  id: string;
  userId: string;
  customerId: string;
  text: string;
  createdAt: string;
  user: { name: string };
}

interface Props {
  customers: Customer[];
  comments: Comment[];
  currentUser: { id: string; name: string };
}

export default function TeamView({ customers, comments, currentUser }: Props) {
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [customersWithComments, setCustomersWithComments] = useState<Set<string>>(
    () => new Set(comments.map((c) => c.customerId)),
  );

  // Group comments by customerId for the side panel
  const commentsByCustomer = comments.reduce<Record<string, Comment[]>>((acc, c) => {
    (acc[c.customerId] ??= []).push(c);
    return acc;
  }, {});

  const handleCommentAdded = useCallback((customerId: string) => {
    setCustomersWithComments((prev) => new Set([...prev, customerId]));
  }, []);

  const handleAllCommentsDeleted = useCallback((customerId: string) => {
    setCustomersWithComments((prev) => {
      const next = new Set(prev);
      next.delete(customerId);
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="border-b border-[#E5E7EB] bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#111827] tracking-tight">
              My Contacts
            </h1>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              {customers.length} customer{customers.length !== 1 ? 's' : ''} assigned to you
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6B7280]">{currentUser.name}</span>
            <a
              href="/change-password"
              className="cursor-pointer text-sm text-[#9CA3AF] underline underline-offset-2 hover:text-[#374151]"
            >
              Change password
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                className="cursor-pointer text-sm text-[#9CA3AF] underline underline-offset-2 hover:text-[#374151]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="px-6 py-5">
        {customers.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#9CA3AF]">No customers have been assigned to you yet.</p>
            <p className="mt-1 text-xs text-[#C4C9D0]">Check back later or contact your admin.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customers.map((c) => {
              const noteCount = commentsByCustomer[c.id]?.length ?? 0;
              const hasComments = customersWithComments.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCustomer(c)}
                  className="w-full cursor-pointer text-left rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 transition-colors hover:border-[#9CA3AF] hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-[#111827] truncate">{c.name}</p>
                        {hasComments && (
                          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#FBB03F]" title="Has comments" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[#6B7280]">
                        {c.email || c.postcode}
                        {c.email && c.postcode && ` · ${c.postcode}`}
                      </p>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-3">
                      {noteCount > 0 && (
                        <span className="text-xs text-[#9CA3AF]">
                          {noteCount} note{noteCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      <RiskBadge riskLevel={c.riskLevel} gapRatio={c.gapRatio} compact />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <SidePanel
        customer={activeCustomer}
        currentUser={currentUser}
        onClose={() => setActiveCustomer(null)}
        hasComments={activeCustomer ? customersWithComments.has(activeCustomer.id) : false}
        initialComments={activeCustomer ? (commentsByCustomer[activeCustomer.id] ?? []) : []}
        onCommentAdded={handleCommentAdded}
        onAllCommentsDeleted={handleAllCommentsDeleted}
      />
    </div>
  );
}
