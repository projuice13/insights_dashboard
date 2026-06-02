'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Customer,
  CustomerTypeFilter,
  RegionFilter,
  SpendFilter,
  Assignments,
  AdminUser,
  CustomerStatuses,
  CustomerStatusType,
  AppNotification,
  StatusFilterValue,
} from '@/lib/types';
import { DateRange } from './DateRangePicker';
import SummaryBar from './SummaryBar';
import FilterPanel from './FilterPanel';
import CustomerTable from './CustomerTable';
import SidePanel from './SidePanel';
import SelectionActionBar from './SelectionActionBar';
import SettingsMenu from './SettingsMenu';
import NotificationsMenu from './NotificationsMenu';
import StatusModal from './StatusModal';

interface DashboardProps {
  customers: Customer[];
  assignments: Assignments;
  users: AdminUser[];
  currentUser: { id: string; name: string };
  initialCustomersWithComments: string[];
  customerStatuses: CustomerStatuses;
  notifications: AppNotification[];
  // Admin-only — omit these for team users
  importStats?: { imported: number; skipped: number } | null;
  myAssignedIds?: string[]; // team users only — the IDs assigned to them
  onAssign?: (ids: string[], user: AdminUser | null) => void;
  onImport?: (file: File) => void;
  onReset?: () => void;
}

export default function Dashboard({
  customers,
  assignments,
  users,
  currentUser,
  initialCustomersWithComments,
  customerStatuses,
  notifications,
  importStats,
  myAssignedIds,
  onAssign,
  onImport,
  onReset,
}: DashboardProps) {
  const router = useRouter();
  const isTeam = myAssignedIds !== undefined;
  const isAdmin = !isTeam;

  const [customerType, setCustomerType] = useState<CustomerTypeFilter>('standard');
  const [region, setRegion] = useState<RegionFilter>('all');
  const [lastOrdered, setLastOrdered] = useState<DateRange>({ from: null, to: null });
  const [spend, setSpend] = useState<SpendFilter>('all');
  const [riskLevels, setRiskLevels] = useState<Set<'high' | 'medium' | 'low'>>(new Set());
  // 'all' = default (no filter); 'unassigned' = no assignee; user name = that person's contacts
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all');
  const [assignedToMe, setAssignedToMe] = useState(true); // team default: on
  // Default: all statuses selected EXCEPT 'deactivated' (matches old behaviour)
  const [statusFilter, setStatusFilter] = useState<Set<StatusFilterValue>>(
    () => new Set<StatusFilterValue>(['active', 'hot', 'possible', 'seasonal', 'no_response', 'dormant']),
  );
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [statusModalCustomer, setStatusModalCustomer] = useState<Customer | null>(null);
  // Local copy of statuses so we can update the badge instantly (optimistic),
  // then let router.refresh() sync the server data in the background.
  const [localStatuses, setLocalStatuses] = useState<CustomerStatuses>(customerStatuses);
  useEffect(() => { setLocalStatuses(customerStatuses); }, [customerStatuses]);

  // Helper: default state of the status filter (used to detect "deviation from default")
  const DEFAULT_STATUS_FILTER: ReadonlySet<StatusFilterValue> = new Set<StatusFilterValue>([
    'active', 'hot', 'possible', 'seasonal', 'no_response', 'dormant',
  ]);
  const statusFilterIsDefault =
    statusFilter.size === DEFAULT_STATUS_FILTER.size &&
    Array.from(DEFAULT_STATUS_FILTER).every((s) => statusFilter.has(s));
  const [customersWithComments, setCustomersWithComments] = useState<Set<string>>(
    () => new Set(initialCustomersWithComments),
  );

  const myAssignedSet = useMemo(
    () => new Set(myAssignedIds ?? []),
    [myAssignedIds],
  );

  const allRegions = useMemo(() => {
    const seen = new Set<string>();
    for (const c of customers) {
      if (c.contactName) seen.add(c.contactName);
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [customers]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (customerType !== 'standard') count++;
    if (region !== 'all') count++;
    if (lastOrdered.from || lastOrdered.to) count++;
    if (spend !== 'all') count++;
    if (riskLevels.size > 0) count++;
    if (!isTeam && assignedToFilter !== 'all') count++;
    if (isTeam && !assignedToMe) count++;
    if (!isTeam && !statusFilterIsDefault) count++;
    return count;
  }, [customerType, region, lastOrdered, spend, riskLevels, assignedToFilter, assignedToMe, isTeam, statusFilterIsDefault]);

  const handleClearAllFilters = useCallback(() => {
    setCustomerType('standard');
    setRegion('all');
    setLastOrdered({ from: null, to: null });
    setSpend('all');
    setRiskLevels(new Set());
    setAssignedToFilter('all');
    setAssignedToMe(true);
    setStatusFilter(new Set(['active', 'hot', 'possible', 'seasonal', 'no_response', 'dormant']));
    resetSelection();
  }, []);

  const handleStatusToggle = useCallback((v: StatusFilterValue) => {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
    resetSelection();
  }, []);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (c.customerType !== customerType) return false;
      if (region !== 'all' && c.contactName.toLowerCase() !== region.toLowerCase()) return false;

      // Status filtering
      const cs = localStatuses[c.id];
      const effectiveStatus: StatusFilterValue =
        cs && cs.approvalStatus === 'approved' ? cs.status : 'active';
      // Approved 'deactivated' customers are hidden from team users full-stop.
      // Pending deactivations are treated as 'active' so they stay visible until resolved.
      if (isTeam) {
        if (cs?.status === 'deactivated' && cs.approvalStatus === 'approved') return false;
      } else {
        if (!statusFilter.has(effectiveStatus)) return false;
      }

      // Team: "Assigned to me" filter
      if (isTeam && assignedToMe && !myAssignedSet.has(c.id)) return false;
      // Admin: "Assigned to" filter
      if (!isTeam) {
        if (assignedToFilter === 'unassigned' && assignments[c.id]) return false;
        if (assignedToFilter !== 'unassigned' && assignedToFilter !== 'all' && assignments[c.id] !== assignedToFilter) return false;
      }

      if (lastOrdered.from && c.lastOrderDate < lastOrdered.from) return false;
      if (lastOrdered.to) {
        const endOfDay = new Date(
          lastOrdered.to.getFullYear(),
          lastOrdered.to.getMonth(),
          lastOrdered.to.getDate(),
          23, 59, 59, 999,
        );
        if (c.lastOrderDate > endOfDay) return false;
      }

      if (spend !== 'all') {
        if (spend === '0-999' && c.totalSpend >= 1000) return false;
        if (spend === '1000-1999' && (c.totalSpend < 1000 || c.totalSpend >= 2000)) return false;
        if (spend === '2000+' && c.totalSpend < 2000) return false;
      }

      if (riskLevels.size > 0 && !riskLevels.has(c.riskLevel)) return false;

      return true;
    });
  }, [customers, customerType, region, lastOrdered, spend, riskLevels,
      assignedToFilter, assignedToMe, isTeam, myAssignedSet, assignments,
      localStatuses, statusFilter]);

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.postcode.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }, [filtered, search]);

  const resetSelection = () => setSelected(new Set());

  const handleRiskToggle = (level: 'high' | 'medium' | 'low') => {
    setRiskLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
    resetSelection();
  };

  const handleSelect = (id: string, _shiftKey: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (ids: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleReassign = (customerId: string, userId: string | null) => {
    if (!onAssign) return;
    const user = userId ? users.find((u) => u.id === userId) ?? null : null;
    onAssign([customerId], user);
  };

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

  // Status-tag handlers
  const handleConfirmStatus = useCallback(
    async (status: CustomerStatusType | null, reason: string) => {
      if (!statusModalCustomer) return;

      let res: Response;
      if (status === null) {
        res = await fetch(`/api/customers/${statusModalCustomer.id}/status`, { method: 'DELETE' });
      } else {
        res = await fetch(`/api/customers/${statusModalCustomer.id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, reason, customerName: statusModalCustomer.name }),
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to update status.');
      }

      // Optimistically update the badge so it changes the moment the modal closes,
      // instead of waiting several seconds for router.refresh() to complete.
      setLocalStatuses((prev) => {
        const next = { ...prev };
        if (status === null) {
          delete next[statusModalCustomer.id];
        } else {
          const isPendingDeactivation = isTeam && status === 'deactivated';
          next[statusModalCustomer.id] = {
            customerId: statusModalCustomer.id,
            customerName: statusModalCustomer.name,
            status,
            approvalStatus: isPendingDeactivation ? 'pending' : 'approved',
            reason: reason || null,
            setById: currentUser.id,
            setByName: currentUser.name,
            setAt: new Date().toISOString(),
            approvedById: isAdmin ? currentUser.id : null,
            approvedByName: isAdmin ? currentUser.name : null,
            approvedAt: isAdmin ? new Date().toISOString() : null,
          };
        }
        return next;
      });

      setStatusModalCustomer(null);
      // Sync server data in the background; when it arrives the useEffect above
      // will overwrite localStatuses with the authoritative values.
      router.refresh();
    },
    [statusModalCustomer, router, isTeam, isAdmin, currentUser],
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="border-b border-[#E5E7EB] bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-[#9CA3AF] transition-colors hover:text-[#374151]"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3L5 8l5 5" />
              </svg>
              Home
            </Link>
            <h1 className="text-lg font-semibold text-[#111827] tracking-tight">
              Customer Insights Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsMenu
              initialNotifications={notifications}
              customers={customers}
              isAdmin={isAdmin}
              onOpenCustomer={setActiveCustomer}
            />
            <SettingsMenu
              currentUser={currentUser}
              isTeam={isTeam}
              onImport={onImport}
              onReset={onReset}
            />
          </div>
        </div>
        <div className="mt-4">
          <SummaryBar customers={customers} />
        </div>
      </header>

      {importStats && (
        <div className="border-b border-[#E5E7EB] bg-green-50 px-6 py-2.5 text-sm text-green-700">
          Import complete — <strong>{importStats.imported.toLocaleString()}</strong> new order{importStats.imported !== 1 ? 's' : ''} added
          {importStats.skipped > 0 && <>, <strong>{importStats.skipped.toLocaleString()}</strong> already in history (skipped)</>}.
        </div>
      )}

      <main className="px-6 py-5 space-y-4">
        {/* Bulk-assign bar — admin only */}
        {!isTeam && onAssign && (
          <SelectionActionBar
            selected={selected}
            customers={searched}
            assignments={assignments}
            users={users}
            onClear={resetSelection}
            onAssign={onAssign}
          />
        )}

        {/* Toolbar: filter button + result count | search */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Filter icon button with active-count badge */}
            <div className="relative">
              <button
                onClick={() => setFilterPanelOpen(true)}
                className={`cursor-pointer flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  activeFilterCount > 0
                    ? 'border-[#374151] bg-[#111827] text-white'
                    : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#9CA3AF] hover:text-[#374151]'
                }`}
              >
                {/* Sliders icon */}
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 4h12M2 8h12M2 12h12"/>
                  <circle cx="5" cy="4" r="1.5" fill="currentColor" stroke="none"/>
                  <circle cx="11" cy="8" r="1.5" fill="currentColor" stroke="none"/>
                  <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                </svg>
                Filters
              </button>
              {activeFilterCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold leading-none text-white">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <p className="text-xs text-[#9CA3AF]">
              {searched.length} result{searched.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]"
              fill="none"
              viewBox="0 0 16 16"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="6.5" cy="6.5" r="4.5" />
              <path d="M10.5 10.5l3 3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetSelection(); }}
              placeholder="Search name, postcode, email…"
              className="w-64 rounded-lg border border-[#E5E7EB] bg-white py-2 pl-8 pr-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#6B7280]"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); resetSelection(); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-[#9CA3AF] hover:text-[#374151]"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <CustomerTable
          customers={searched}
          selected={selected}
          assignments={assignments}
          users={users}
          customersWithComments={customersWithComments}
          isTeam={isTeam}
          customerStatuses={localStatuses}
          assignedCustomerIds={isAdmin ? undefined : myAssignedSet}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onClearAll={resetSelection}
          onClickCustomer={setActiveCustomer}
          onReassign={handleReassign}
          onSetStatus={setStatusModalCustomer}
        />
      </main>

      <SidePanel
        customer={activeCustomer}
        currentUser={currentUser}
        onClose={() => setActiveCustomer(null)}
        hasComments={activeCustomer ? customersWithComments.has(activeCustomer.id) : false}
        onCommentAdded={handleCommentAdded}
        onAllCommentsDeleted={handleAllCommentsDeleted}
        customerStatus={activeCustomer ? localStatuses[activeCustomer.id] ?? null : null}
        isAdmin={isAdmin}
        canEditStatus={isAdmin || myAssignedSet.has(activeCustomer?.id ?? '')}
        onSetStatus={setStatusModalCustomer}
      />

      {statusModalCustomer && (
        <StatusModal
          customerName={statusModalCustomer.name}
          currentStatus={localStatuses[statusModalCustomer.id]?.status ?? null}
          isTeam={isTeam}
          onClose={() => setStatusModalCustomer(null)}
          onConfirm={handleConfirmStatus}
        />
      )}

      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        activeCount={activeFilterCount}
        onClearAll={() => { handleClearAllFilters(); setFilterPanelOpen(false); }}
        customerType={customerType}
        region={region}
        lastOrdered={lastOrdered}
        spend={spend}
        riskLevels={riskLevels}
        regions={allRegions}
        isTeam={isTeam}
        hideAssigned={false}
        assignedToMe={assignedToMe}
        statusFilter={statusFilter}
        assignedToFilter={assignedToFilter}
        assignableUsers={isAdmin ? users : []}
        onCustomerType={(v) => { setCustomerType(v); resetSelection(); }}
        onRegion={(v) => { setRegion(v); resetSelection(); }}
        onLastOrdered={(v) => { setLastOrdered(v); resetSelection(); }}
        onSpend={(v) => { setSpend(v); resetSelection(); }}
        onRiskToggle={handleRiskToggle}
        onHideAssigned={() => {}}
        onAssignedToMe={(v) => { setAssignedToMe(v); resetSelection(); }}
        onStatusToggle={handleStatusToggle}
        onAssignedTo={(v) => { setAssignedToFilter(v); resetSelection(); }}
      />
    </div>
  );
}
