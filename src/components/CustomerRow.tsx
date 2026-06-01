'use client';

import { useState, useRef, useEffect } from 'react';
import { Customer, AdminUser, CustomerStatus, STATUS_CONFIG } from '@/lib/types';
import RiskBadge from './RiskBadge';

interface CustomerRowProps {
  customer: Customer;
  selected: boolean;
  assignedTo: string | null;
  hasComments: boolean;
  users: AdminUser[];
  isTeam?: boolean;
  customerStatus?: CustomerStatus | null;
  onSelect: (id: string, shiftKey: boolean) => void;
  onClick: (customer: Customer) => void;
  onReassign: (id: string, userId: string | null) => void;
}

function formatCurrency(n: number): string {
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CustomerRow({
  customer,
  selected,
  assignedTo,
  hasComments,
  users,
  isTeam = false,
  customerStatus = null,
  onSelect,
  onClick,
  onReassign,
}: CustomerRowProps) {
  const cfg = customerStatus ? STATUS_CONFIG[customerStatus.status] : null;
  const isPendingDeactivation =
    customerStatus?.status === 'deactivated' &&
    customerStatus.approvalStatus === 'pending';
  const isApprovedDeactivation =
    customerStatus?.status === 'deactivated' &&
    customerStatus.approvalStatus === 'approved';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <tr
      className={`border-b border-[#E5E7EB] transition-colors ${
        selected ? 'bg-[#F3F4F6]' : 'hover:bg-[#F9FAFB]'
      }`}
    >
      {!isTeam && (
        <td className="pl-4 py-3 pr-2 w-8">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => {}}
            className="h-3.5 w-3.5 rounded border-[#D1D5DB] text-[#374151] focus:ring-0 focus:ring-offset-0 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onSelect(customer.id, e.shiftKey); }}
          />
        </td>
      )}
      <td className="py-3 px-3">
        <RiskBadge riskLevel={customer.riskLevel} gapRatio={customer.gapRatio} compact />
      </td>
      <td className="py-3 px-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onClick(customer)}
            className={`cursor-pointer inline-flex items-center gap-1.5 text-[13px] font-medium hover:underline text-left ${
              isApprovedDeactivation ? 'text-[#9CA3AF]' : 'text-[#111827] hover:text-[#374151]'
            }`}
          >
            {customer.name}
            {hasComments && (
              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#FBB03F]" title="Has comments" />
            )}
          </button>
          {customerStatus && cfg && (
            isPendingDeactivation ? (
              <span
                title="Pending admin approval"
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200"
              >
                <span className="h-1 w-1 rounded-full bg-amber-500" />
                Pending
              </span>
            ) : (
              <span
                title={customerStatus.reason ?? undefined}
                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}
              >
                {cfg.label}
              </span>
            )
          )}
        </div>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-[#374151]">{customer.contactName}</span>
          {customer.customerType === 'volume' && (
            <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#6B7280] ring-1 ring-[#E5E7EB]">
              Volume
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-3 text-[13px] text-[#374151]">{customer.postcode}</td>
      <td className="py-3 px-3 text-[13px] text-[#6B7280]">{customer.email || '—'}</td>
      <td className="py-3 px-3 text-right text-[13px] text-[#374151]">{customer.totalOrders}</td>
      <td className="py-3 px-3 text-right text-[13px] text-[#374151]">{formatCurrency(customer.totalSpend)}</td>
      <td className="py-3 px-3 pr-4 text-right text-[13px] text-[#6B7280]">{formatDate(customer.lastOrderDate)}</td>
      <td className="py-3 px-3">
        {isTeam ? (
          assignedTo ? (
            <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[11px] font-medium text-[#3B82F6] ring-1 ring-[#DBEAFE]">
              {assignedTo}
            </span>
          ) : (
            <span className="text-[13px] text-[#D1D5DB]">—</span>
          )
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              className={`cursor-pointer inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                assignedTo
                  ? 'bg-[#EFF6FF] text-[#3B82F6] ring-1 ring-[#DBEAFE] hover:bg-[#DBEAFE]'
                  : 'bg-[#F3F4F6] text-[#9CA3AF] ring-1 ring-[#E5E7EB] hover:bg-[#E5E7EB]'
              }`}
            >
              {assignedTo ?? 'Assign'}
              <svg className="h-2.5 w-2.5 opacity-60" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
                {users.map((m) => (
                  <button
                    key={m.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReassign(customer.id, m.id);
                      setMenuOpen(false);
                    }}
                    className={`flex w-full items-center px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-[#F9FAFB] ${
                      assignedTo === m.name ? 'font-medium text-[#111827]' : 'text-[#374151]'
                    }`}
                  >
                    {assignedTo === m.name ? (
                      <svg className="mr-1.5 h-3 w-3 text-[#3B82F6]" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    ) : (
                      <span className="mr-1.5 w-3" />
                    )}
                    {m.name}
                  </button>
                ))}
                {assignedTo && (
                  <>
                    <div className="my-1 border-t border-[#F3F4F6]" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReassign(customer.id, null);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center px-3 py-1.5 text-left text-[13px] text-red-500 transition-colors hover:bg-red-50"
                    >
                      <span className="mr-1.5 w-3" />
                      Unassign
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
