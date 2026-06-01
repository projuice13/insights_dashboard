'use client';

import { useEffect, useState } from 'react';
import { Customer, CustomerStatus, STATUS_CONFIG } from '@/lib/types';
import RiskBadge from './RiskBadge';
import YoYChart from './YoYChart';
import YoYSummary from './YoYSummary';
import OrderGapIndicator from './OrderGapIndicator';
import OrderList from './OrderList';
import CommentPanel from './CommentPanel';

interface SidePanelProps {
  customer: Customer | null;
  currentUser: { id: string; name: string };
  onClose: () => void;
  hasComments?: boolean;
  initialComments?: { id: string; userId: string; text: string; createdAt: string; user: { name: string } }[];
  onCommentAdded?: (customerId: string) => void;
  onAllCommentsDeleted?: (customerId: string) => void;
  // Status tag
  customerStatus?: CustomerStatus | null;
  isAdmin?: boolean;
  canEditStatus?: boolean;
  onSetStatus?: (customer: Customer) => void;
}

type Tab = 'data' | 'comments';

export default function SidePanel({
  customer,
  currentUser,
  onClose,
  hasComments = false,
  initialComments,
  onCommentAdded,
  onAllCommentsDeleted,
  customerStatus = null,
  isAdmin = false,
  canEditStatus = false,
  onSetStatus,
}: SidePanelProps) {
  const [tab, setTab] = useState<Tab>('data');

  // Reset to Data tab whenever a different customer opens
  useEffect(() => {
    setTab('data');
  }, [customer?.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!customer) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 z-40 flex h-full w-[40%] min-w-[380px] flex-col bg-white shadow-xl"
        style={{ animation: 'slideIn 0.3s ease' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 pt-5 pb-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-[#111827] truncate">{customer.name}</h2>
            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[13px] text-[#6B7280]">
              {customer.email && <span>{customer.email}</span>}
              <span>{customer.postcode}</span>
              <span>{customer.contactName}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RiskBadge riskLevel={customer.riskLevel} gapRatio={customer.gapRatio} />
              {customerStatus && (() => {
                const cfg = STATUS_CONFIG[customerStatus.status];
                const isPending = customerStatus.approvalStatus === 'pending';
                return (
                  <span
                    title={customerStatus.reason ? `Reason: ${customerStatus.reason}` : undefined}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      isPending
                        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                        : `${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isPending ? 'bg-amber-500' : cfg.dot}`} />
                    {isPending ? `Pending: ${cfg.label}` : cfg.label}
                  </span>
                );
              })()}
            </div>

            {/* Tabs */}
            <div className="mt-4 flex gap-0">
              <button
                onClick={() => setTab('data')}
                className={`cursor-pointer px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'data'
                    ? 'border-[#111827] text-[#111827]'
                    : 'border-transparent text-[#9CA3AF] hover:text-[#6B7280]'
                }`}
              >
                Data
              </button>
              <button
                onClick={() => setTab('comments')}
                className={`cursor-pointer relative px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'comments'
                    ? 'border-[#111827] text-[#111827]'
                    : 'border-transparent text-[#9CA3AF] hover:text-[#6B7280]'
                }`}
              >
                Comments
                {hasComments && tab !== 'comments' && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#FBB03F]" />
                )}
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 cursor-pointer rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151]"
            aria-label="Close panel"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'data' ? (
            <div className="space-y-6">
              {customer.yoyComparison && <YoYChart yoy={customer.yoyComparison} />}
              {customer.yoyComparison && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Year-on-Year Summary
                  </h3>
                  <YoYSummary yoy={customer.yoyComparison} />
                </div>
              )}
              <OrderGapIndicator customer={customer} />
              <OrderList orders={customer.orders} />

              {/* Status / tagging */}
              {onSetStatus && (
                <div className="border-t border-[#F3F4F6] pt-5 space-y-2">
                  {/* Context line for current status */}
                  {customerStatus && (customerStatus.reason || customerStatus.approvalStatus === 'pending') && (
                    <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-xs text-[#6B7280]">
                      {customerStatus.approvalStatus === 'pending' && (
                        <p className="font-medium text-amber-700">Pending admin approval</p>
                      )}
                      <p className={customerStatus.approvalStatus === 'pending' ? 'mt-1' : ''}>
                        {customerStatus.setByName}
                        {customerStatus.reason && (
                          <>
                            {' — '}
                            <span className="italic">&ldquo;{customerStatus.reason}&rdquo;</span>
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Only show button if this user has permission to edit this customer's status */}
                  {canEditStatus && (
                    <button
                      onClick={() => onSetStatus(customer)}
                      className="cursor-pointer w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#374151] transition-colors hover:border-[#9CA3AF]"
                    >
                      {customerStatus ? 'Change status' : 'Set status'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <CommentPanel
              customerId={customer.id}
              currentUser={currentUser}
              initialComments={initialComments}
              onCommentAdded={onCommentAdded}
              onAllCommentsDeleted={onAllCommentsDeleted}
            />
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
