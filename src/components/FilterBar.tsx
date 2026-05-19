'use client';

import { CustomerTypeFilter, RegionFilter, SpendFilter } from '@/lib/types';
import DateRangePicker, { DateRange } from './DateRangePicker';

type RiskLevel = 'high' | 'medium' | 'low';

const RISK_OPTIONS: { value: RiskLevel; label: string; active: string; dot: string }[] = [
  {
    value: 'high',
    label: 'High',
    active: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    dot: 'bg-red-500',
  },
  {
    value: 'medium',
    label: 'Medium',
    active: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
  },
  {
    value: 'low',
    label: 'Low',
    active: 'bg-green-50 text-green-700 ring-1 ring-green-200',
    dot: 'bg-green-500',
  },
];

interface FilterBarProps {
  customerType: CustomerTypeFilter;
  region: RegionFilter;
  lastOrdered: DateRange;
  spend: SpendFilter;
  riskLevels: Set<RiskLevel>;
  regions: string[];
  isTeam?: boolean;
  hideAssigned: boolean;
  assignedToMe?: boolean;
  onCustomerType: (v: CustomerTypeFilter) => void;
  onRegion: (v: RegionFilter) => void;
  onLastOrdered: (v: DateRange) => void;
  onSpend: (v: SpendFilter) => void;
  onRiskToggle: (v: RiskLevel) => void;
  onHideAssigned: (v: boolean) => void;
  onAssignedToMe?: (v: boolean) => void;
}

const SPEND_OPTIONS: { value: SpendFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '0-999', label: '£0–£999' },
  { value: '1000-1999', label: '£1,000–£1,999' },
  { value: '2000+', label: '£2,000+' },
];

const selectClass =
  'cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#6B7280] focus:ring-0';

export default function FilterBar({
  customerType,
  region,
  lastOrdered,
  spend,
  riskLevels,
  regions,
  isTeam = false,
  hideAssigned,
  assignedToMe = true,
  onCustomerType,
  onRegion,
  onLastOrdered,
  onSpend,
  onRiskToggle,
  onHideAssigned,
  onAssignedToMe,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      {/* Standard / Volume segmented toggle */}
      <div className="flex rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-0.5">
        {(['standard', 'volume'] as CustomerTypeFilter[]).map((type) => (
          <button
            key={type}
            onClick={() => onCustomerType(type)}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              customerType === type
                ? 'bg-white text-[#111827] shadow-sm ring-1 ring-[#E5E7EB]'
                : 'text-[#6B7280] hover:text-[#374151]'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Region */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-[#6B7280]">Region</label>
        <select value={region} onChange={(e) => onRegion(e.target.value)} className={selectClass}>
          <option value="all">All</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Last Ordered date range */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-[#6B7280]">Last Ordered</label>
        <DateRangePicker value={lastOrdered} onChange={onLastOrdered} />
      </div>

      {/* Total Spend */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-[#6B7280]">Spend</label>
        <select value={spend} onChange={(e) => onSpend(e.target.value as SpendFilter)} className={selectClass}>
          {SPEND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Churn Risk */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-[#6B7280]">Churn Risk</label>
        <div className="flex items-center gap-1.5">
          {RISK_OPTIONS.map(({ value, label, active, dot }) => {
            const isActive = riskLevels.has(value);
            return (
              <button
                key={value}
                onClick={() => onRiskToggle(value)}
                className={`cursor-pointer inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
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

      {/* Team: "Assigned to me" / Admin: "Hide assigned" */}
      {isTeam ? (
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={assignedToMe}
            onChange={(e) => onAssignedToMe?.(e.target.checked)}
            className="h-3.5 w-3.5 cursor-pointer rounded border-[#D1D5DB] text-[#374151] focus:ring-0"
          />
          <span className="text-xs font-medium text-[#6B7280]">Assigned to me</span>
        </label>
      ) : (
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={hideAssigned}
            onChange={(e) => onHideAssigned(e.target.checked)}
            className="h-3.5 w-3.5 cursor-pointer rounded border-[#D1D5DB] text-[#374151] focus:ring-0"
          />
          <span className="text-xs font-medium text-[#6B7280]">Hide assigned</span>
        </label>
      )}
    </div>
  );
}
