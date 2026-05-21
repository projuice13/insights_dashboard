'use client';

import { useEffect } from 'react';
import { CustomerTypeFilter, RegionFilter, SpendFilter } from '@/lib/types';
import DateRangePicker, { DateRange } from './DateRangePicker';

type RiskLevel = 'high' | 'medium' | 'low';

const RISK_OPTIONS: { value: RiskLevel; label: string; active: string; dot: string }[] = [
  { value: 'high',   label: 'High',   active: 'bg-red-50 text-red-700 ring-1 ring-red-200',       dot: 'bg-red-500'   },
  { value: 'medium', label: 'Medium', active: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', dot: 'bg-amber-500' },
  { value: 'low',    label: 'Low',    active: 'bg-green-50 text-green-700 ring-1 ring-green-200', dot: 'bg-green-500' },
];

const SPEND_OPTIONS: { value: SpendFilter; label: string }[] = [
  { value: 'all',       label: 'All' },
  { value: '0-999',     label: '£0 – £999' },
  { value: '1000-1999', label: '£1,000 – £1,999' },
  { value: '2000+',     label: '£2,000+' },
];

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeCount: number;
  onClearAll: () => void;

  customerType: CustomerTypeFilter;
  region: RegionFilter;
  lastOrdered: DateRange;
  spend: SpendFilter;
  riskLevels: Set<RiskLevel>;
  regions: string[];
  isTeam?: boolean;
  hideAssigned: boolean;
  assignedToMe?: boolean;
  showDeactivated?: boolean;

  onCustomerType: (v: CustomerTypeFilter) => void;
  onRegion: (v: RegionFilter) => void;
  onLastOrdered: (v: DateRange) => void;
  onSpend: (v: SpendFilter) => void;
  onRiskToggle: (v: RiskLevel) => void;
  onHideAssigned: (v: boolean) => void;
  onAssignedToMe?: (v: boolean) => void;
  onShowDeactivated?: (v: boolean) => void;
}

const selectClass =
  'w-full cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#6B7280]';

export default function FilterPanel({
  isOpen,
  onClose,
  activeCount,
  onClearAll,
  customerType,
  region,
  lastOrdered,
  spend,
  riskLevels,
  regions,
  isTeam = false,
  hideAssigned,
  assignedToMe = true,
  showDeactivated = false,
  onCustomerType,
  onRegion,
  onLastOrdered,
  onSpend,
  onRiskToggle,
  onHideAssigned,
  onAssignedToMe,
  onShowDeactivated,
}: FilterPanelProps) {
  // Prevent body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-in panel */}
      <div
        role="dialog"
        aria-label="Filters"
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-[#111827]">Filters</h2>
            {activeCount > 0 && (
              <button
                onClick={onClearAll}
                className="cursor-pointer text-xs text-[#6B7280] underline underline-offset-2 hover:text-[#374151]"
              >
                Clear all
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Filter options */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* Customer type */}
          <div>
            <p className="mb-2 text-xs font-medium text-[#6B7280]">Customer type</p>
            <div className="flex rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-0.5">
              {(['standard', 'volume'] as CustomerTypeFilter[]).map((type) => (
                <button
                  key={type}
                  onClick={() => onCustomerType(type)}
                  className={`flex-1 cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                    customerType === type
                      ? 'bg-white text-[#111827] shadow-sm ring-1 ring-[#E5E7EB]'
                      : 'text-[#6B7280] hover:text-[#374151]'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="mb-2 block text-xs font-medium text-[#6B7280]">Region</label>
            <select value={region} onChange={(e) => onRegion(e.target.value)} className={selectClass}>
              <option value="all">All regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Last ordered */}
          <div>
            <p className="mb-2 text-xs font-medium text-[#6B7280]">Last ordered</p>
            <DateRangePicker value={lastOrdered} onChange={onLastOrdered} />
          </div>

          {/* Total spend */}
          <div>
            <label className="mb-2 block text-xs font-medium text-[#6B7280]">Total spend</label>
            <select
              value={spend}
              onChange={(e) => onSpend(e.target.value as SpendFilter)}
              className={selectClass}
            >
              {SPEND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Churn risk */}
          <div>
            <p className="mb-2 text-xs font-medium text-[#6B7280]">Churn risk</p>
            <div className="flex flex-wrap gap-2">
              {RISK_OPTIONS.map(({ value, label, active, dot }) => {
                const isActive = riskLevels.has(value);
                return (
                  <button
                    key={value}
                    onClick={() => onRiskToggle(value)}
                    className={`cursor-pointer inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? active
                        : 'border border-[#E5E7EB] bg-white text-[#9CA3AF] hover:border-[#9CA3AF] hover:text-[#374151]'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? dot : 'bg-[#D1D5DB]'}`} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignment + deactivation toggles */}
          <div className="space-y-3 border-t border-[#F3F4F6] pt-1">
            {isTeam ? (
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={assignedToMe}
                  onChange={(e) => onAssignedToMe?.(e.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#D1D5DB] text-[#374151] focus:ring-0"
                />
                <span className="text-sm text-[#374151]">Assigned to me</span>
              </label>
            ) : (
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={hideAssigned}
                  onChange={(e) => onHideAssigned(e.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#D1D5DB] text-[#374151] focus:ring-0"
                />
                <span className="text-sm text-[#374151]">Hide assigned</span>
              </label>
            )}

            {/* Show deactivated — admin only */}
            {!isTeam && onShowDeactivated && (
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={showDeactivated}
                  onChange={(e) => onShowDeactivated(e.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-[#D1D5DB] text-[#374151] focus:ring-0"
                />
                <span className="text-sm text-[#374151]">Show deactivated</span>
              </label>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
