'use client';

import { Customer } from '@/lib/types';

interface SummaryBarProps {
  customers: Customer[];
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function SummaryBar({ customers }: SummaryBarProps) {
  const totalOrders = customers.reduce((s, c) => s + c.totalOrders, 0);
  const highRisk = customers.filter((c) => c.riskLevel === 'high').length;

  const allDates = customers.flatMap((c) => c.orders.map((o) => o.date));
  const minDate = allDates.length ? new Date(Math.min(...allDates.map((d) => d.getTime()))) : null;
  const maxDate = allDates.length ? new Date(Math.max(...allDates.map((d) => d.getTime()))) : null;

  const stats = [
    { label: 'Customers', value: customers.length.toLocaleString() },
    { label: 'Total Orders', value: totalOrders.toLocaleString() },
    {
      label: 'Date Range',
      value: minDate && maxDate ? `${formatDate(minDate)} – ${formatDate(maxDate)}` : '—',
    },
    {
      label: 'High Risk',
      value: highRisk.toLocaleString(),
      highlight: highRisk > 0,
    },
  ];

  return (
    <div className="flex flex-wrap gap-6">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            {s.label}
          </span>
          <span
            className={`mt-0.5 text-xl font-semibold ${
              s.highlight ? 'text-red-600' : 'text-[#111827]'
            }`}
          >
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}
