'use client';

import { Customer } from '@/lib/types';

interface OrderGapIndicatorProps {
  customer: Customer;
}

export default function OrderGapIndicator({ customer }: OrderGapIndicatorProps) {
  const { averageGapDays, currentGapDays, gapRatio, riskLevel } = customer;

  const barPct = Math.min(100, (gapRatio / 3) * 100);

  const barColor =
    riskLevel === 'high'
      ? 'bg-red-500'
      : riskLevel === 'medium'
      ? 'bg-amber-500'
      : 'bg-green-500';

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
        Order Gap Risk
      </h4>
      <div className="flex justify-between text-xs text-[#374151]">
        <span>
          Average gap:{' '}
          <span className="font-medium">
            Every {Math.round(averageGapDays)} days
          </span>
        </span>
        <span>
          Current gap:{' '}
          <span className={`font-medium ${riskLevel === 'high' ? 'text-red-600' : riskLevel === 'medium' ? 'text-amber-600' : 'text-green-600'}`}>
            {currentGapDays} days — {gapRatio.toFixed(1)}× their normal gap
          </span>
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${barPct}%` }}
        />
        {/* Normal marker at 33.3% (= 1.0× gap ratio) */}
        <div className="absolute top-0 h-full w-px bg-[#D1D5DB]" style={{ left: '33.3%' }} />
      </div>
      <div className="flex justify-between text-[10px] text-[#9CA3AF]">
        <span>On track</span>
        <span>1× avg</span>
        <span>2× avg</span>
        <span>3× avg</span>
      </div>
    </div>
  );
}
