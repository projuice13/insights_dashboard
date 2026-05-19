'use client';

import { YoYComparison } from '@/lib/types';

interface YoYSummaryProps {
  yoy: YoYComparison;
}

const thisYear = new Date().getFullYear();
const lastYear = thisYear - 1;
const currentMonthName = new Date().toLocaleString('en-GB', { month: 'short' });

function formatCurrency(n: number): string {
  return `£${n.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
}

function PctChange({ pct }: { pct: number }) {
  if (pct === 0) return <span className="text-[#9CA3AF]">—</span>;
  const improved = pct > 0;
  return (
    <span className={`font-medium ${improved ? 'text-green-600' : 'text-red-600'}`}>
      {improved ? '▲' : '▼'} {Math.abs(pct).toFixed(0)}%
    </span>
  );
}

interface StatRowProps {
  label: string;
  fullLastYear: number;
  lastYearYtd: number;
  thisYearYtd: number;
  pct: number;
  currency?: boolean;
}

function StatRow({ label, fullLastYear, lastYearYtd, thisYearYtd, pct, currency = false }: StatRowProps) {
  const fmt = (v: number) => currency ? formatCurrency(v) : v.toLocaleString();
  return (
    <div className="grid grid-cols-[auto_1fr_1fr_1fr] items-center gap-x-3 py-2.5 border-b border-[#F3F4F6] last:border-0">
      <span className="text-xs font-medium text-[#6B7280] w-24">{label}</span>
      <span className="text-xs text-[#374151] text-right">{fmt(fullLastYear)}</span>
      <span className="text-xs text-[#374151] text-right">{fmt(lastYearYtd)}</span>
      <span className="text-xs text-right">
        <span className="text-[#111827] font-medium">{fmt(thisYearYtd)}</span>
        <span className="ml-1.5 text-[11px]"><PctChange pct={pct} /></span>
      </span>
    </div>
  );
}

export default function YoYSummary({ yoy }: YoYSummaryProps) {
  if (yoy.isNewCustomer) {
    return (
      <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-xs text-[#9CA3AF]">
        New customer — no prior year comparison available
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-3 border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2">
        <span className="w-24" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] text-right">
          {lastYear} full year
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] text-right">
          {lastYear} Jan–{currentMonthName}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] text-right">
          {thisYear} YTD
        </span>
      </div>

      <div className="px-4">
        <StatRow
          label="Orders"
          fullLastYear={yoy.lastYearFullOrders}
          lastYearYtd={yoy.lastYearOrders}
          thisYearYtd={yoy.thisYearOrders}
          pct={yoy.orderCountChange}
        />
        <StatRow
          label="Spend"
          fullLastYear={yoy.lastYearFullSpend}
          lastYearYtd={yoy.lastYearSpend}
          thisYearYtd={yoy.thisYearSpend}
          pct={yoy.spendChange}
          currency
        />
        <StatRow
          label="Avg Order"
          fullLastYear={yoy.lastYearFullAvgOrder}
          lastYearYtd={yoy.lastYearAvgOrder}
          thisYearYtd={yoy.thisYearAvgOrder}
          pct={yoy.avgOrderChange}
          currency
        />
      </div>
    </div>
  );
}
