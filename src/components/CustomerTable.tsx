'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Customer, SortField, SortDirection, Assignments, AdminUser, CustomerStatuses } from '@/lib/types';
import CustomerRow from './CustomerRow';

const PAGE_SIZE = 50;

interface CustomerTableProps {
  customers: Customer[];
  selected: Set<string>;
  assignments: Assignments;
  users: AdminUser[];
  customersWithComments: Set<string>;
  isTeam?: boolean;
  customerStatuses?: CustomerStatuses;
  assignedCustomerIds?: Set<string>;
  onSelect: (id: string, shiftKey: boolean) => void;
  onSelectAll: (ids: string[]) => void;
  onClearAll: () => void;
  onClickCustomer: (customer: Customer) => void;
  onReassign: (id: string, userId: string | null) => void;
  onSetStatus?: (customer: Customer) => void;
}

interface Column {
  key: SortField | 'assigned' | 'status';
  label: string;
  align?: 'right';
  sortable: boolean;
  colWidth?: string; // CSS width value e.g. '60px'
}

const COLUMNS: Column[] = [
  { key: 'gapRatio',       label: 'Churn Risk',    sortable: true },
  { key: 'name',           label: 'Customer Name', sortable: true },
  { key: 'contactName',    label: 'Region',        sortable: true },
  { key: 'postcode',       label: 'Postcode',      sortable: true },
  { key: 'totalOrders',    label: 'Orders',        sortable: true,  align: 'right', colWidth: '60px' },
  { key: 'totalSpend',     label: 'Total Spend',   sortable: true,  align: 'right' },
  { key: 'lastOrderDate',  label: 'Last Order',    sortable: true,  align: 'right' },
  { key: 'status',         label: 'Status',        sortable: false,                 colWidth: '140px' },
  { key: 'assigned',       label: 'Assigned',      sortable: false },
];

export default function CustomerTable({
  customers,
  selected,
  assignments,
  users,
  customersWithComments,
  isTeam = false,
  customerStatuses = {},
  assignedCustomerIds,
  onSelect,
  onSelectAll,
  onClearAll,
  onClickCustomer,
  onReassign,
  onSetStatus,
}: CustomerTableProps) {
  const [sortField, setSortField] = useState<SortField>('gapRatio');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const lastClickedIndex = useRef<number | null>(null);

  // Reset to page 1 whenever the filtered customer list changes
  useEffect(() => {
    setPage(1);
    lastClickedIndex.current = null;
  }, [customers]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    return [...customers].sort((a, b) => {
      let av: string | number;
      let bv: string | number;

      switch (sortField) {
        case 'gapRatio':      av = a.gapRatio;                    bv = b.gapRatio;                    break;
        case 'name':          av = a.name.toLowerCase();           bv = b.name.toLowerCase();           break;
        case 'contactName':   av = a.contactName.toLowerCase();    bv = b.contactName.toLowerCase();    break;
        case 'postcode':      av = a.postcode;                     bv = b.postcode;                     break;
        case 'email':         av = a.email.toLowerCase();          bv = b.email.toLowerCase();          break;
        case 'totalOrders':   av = a.totalOrders;                  bv = b.totalOrders;                  break;
        case 'totalSpend':    av = a.totalSpend;                   bv = b.totalSpend;                   break;
        case 'lastOrderDate': av = a.lastOrderDate.getTime();      bv = b.lastOrderDate.getTime();      break;
        default: return 0;
      }

      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [customers, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Shift-click range selection within the current page
  const handleRowSelect = (id: string, index: number, shiftKey: boolean) => {
    if (shiftKey && lastClickedIndex.current !== null) {
      const from = Math.min(lastClickedIndex.current, index);
      const to = Math.max(lastClickedIndex.current, index);
      const idsInRange = paginated.slice(from, to + 1).map((c) => c.id);
      const isSelecting = !selected.has(id);
      if (isSelecting) {
        onSelectAll(idsInRange);
      } else {
        idsInRange.forEach((rangeId) => onSelect(rangeId, false));
      }
    } else {
      onSelect(id, false);
      lastClickedIndex.current = index;
    }
  };

  const allPageSelected = paginated.length > 0 && paginated.every((c) => selected.has(c.id));
  const somePageSelected = paginated.some((c) => selected.has(c.id));
  const allGlobalSelected = customers.length > 0 && customers.every((c) => selected.has(c.id));
  // Banner shows when the whole page is ticked but there are more rows on other pages
  const showSelectAllBanner = !isTeam && allPageSelected && customers.length > paginated.length;
  const colSpan = isTeam ? COLUMNS.length : COLUMNS.length + 1;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        {customers.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#9CA3AF]">
            No customers match the selected filters
          </div>
        ) : (
          <table className="w-full min-w-[960px] border-collapse text-left">
            <colgroup>
              {!isTeam && <col style={{ width: '2rem' }} />}
              {COLUMNS.map((col) => (
                <col key={col.key} style={col.colWidth ? { width: col.colWidth } : undefined} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {!isTeam && (
                  <th className="pl-4 py-3 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = somePageSelected && !allPageSelected;
                      }}
                      onChange={() => {
                        if (allPageSelected) onClearAll();
                        else onSelectAll(paginated.map((c) => c.id));
                      }}
                      className="h-3.5 w-3.5 rounded border-[#D1D5DB] text-[#374151] focus:ring-0 cursor-pointer"
                    />
                  </th>
                )}
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={col.sortable ? () => handleSort(col.key as SortField) : undefined}
                    className={`py-3 px-3 text-xs font-medium uppercase tracking-wide text-[#6B7280] select-none ${
                      col.sortable ? 'cursor-pointer hover:text-[#374151]' : ''
                    } ${col.align === 'right' ? 'text-right' : ''} ${
                      col.key === 'lastOrderDate' ? 'pr-4' : ''
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && (
                        sortField === col.key ? (
                          <span className="text-[#374151]">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        ) : (
                          <span className="text-[#D1D5DB]">↕</span>
                        )
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Select-all-global banner */}
              {showSelectAllBanner && (
                <tr>
                  <td
                    colSpan={colSpan}
                    className="border-b border-[#DBEAFE] bg-[#EFF6FF] px-4 py-2 text-center text-xs text-[#374151]"
                  >
                    {allGlobalSelected ? (
                      <>
                        All{' '}
                        <span className="font-semibold">{customers.length}</span>{' '}
                        customers are selected.{' '}
                        <button
                          onClick={onClearAll}
                          className="cursor-pointer font-medium text-[#3B82F6] hover:underline"
                        >
                          Clear selection
                        </button>
                      </>
                    ) : (
                      <>
                        All{' '}
                        <span className="font-semibold">{paginated.length}</span>{' '}
                        customers on this page are selected.{' '}
                        <button
                          onClick={() => onSelectAll(customers.map((c) => c.id))}
                          className="cursor-pointer font-medium text-[#3B82F6] hover:underline"
                        >
                          Select all {customers.length} customers
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )}
              {paginated.map((customer, index) => {
                // Admin: can always edit. Team: only if this customer is assigned to them.
                const canEditStatus = assignedCustomerIds
                  ? assignedCustomerIds.has(customer.id)  // team user
                  : true;                                  // admin
                return (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    selected={selected.has(customer.id)}
                    assignedTo={assignments[customer.id] ?? null}
                    hasComments={customersWithComments.has(customer.id)}
                    users={users}
                    isTeam={isTeam}
                    customerStatus={customerStatuses[customer.id] ?? null}
                    canEditStatus={canEditStatus}
                    onSelect={(id, shiftKey) => handleRowSelect(id, index, shiftKey)}
                    onClick={onClickCustomer}
                    onReassign={onReassign}
                    onSetStatus={onSetStatus}
                  />
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-[#9CA3AF]">
            Showing{' '}
            <span className="font-medium text-[#6B7280]">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)}
            </span>{' '}
            of{' '}
            <span className="font-medium text-[#6B7280]">{sorted.length}</span> customers
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:border-[#9CA3AF] hover:text-[#374151] disabled:cursor-default disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | '…')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('…');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === '…' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-[#9CA3AF]">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      page === p
                        ? 'border-[#374151] bg-[#111827] text-white'
                        : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#9CA3AF] hover:text-[#374151]'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:border-[#9CA3AF] hover:text-[#374151] disabled:cursor-default disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
