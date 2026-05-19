'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { YoYComparison } from '@/lib/types';

interface YoYChartProps {
  yoy: YoYComparison;
}

type View = 'orders' | 'spend';

function formatSpend(v: number): string {
  return `£${v.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
}

export default function YoYChart({ yoy }: YoYChartProps) {
  const [view, setView] = useState<View>('orders');
  const thisYear = new Date().getFullYear();
  const lastYear = thisYear - 1;

  const chartData = yoy.monthlyBreakdown.map((m) => ({
    month: m.month,
    [String(lastYear)]: view === 'orders' ? m.lastYearOrders : m.lastYearSpend,
    [String(thisYear)]: view === 'orders' ? m.thisYearOrders : m.thisYearSpend,
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#111827]">Year-on-Year Orders</h3>
        <div className="flex rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-0.5">
          {(['orders', 'spend'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all ${
                view === v
                  ? 'bg-white text-[#111827] shadow-sm ring-1 ring-[#E5E7EB]'
                  : 'text-[#6B7280] hover:text-[#374151]'
              }`}
            >
              {v === 'orders' ? 'Order Count' : 'Spend (£)'}
            </button>
          ))}
        </div>
      </div>

      {yoy.isNewCustomer && (
        <p className="mb-3 text-xs text-[#9CA3AF]">New customer — no prior year data</p>
      )}

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barCategoryGap="30%" barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={view === 'spend' ? (v) => `£${(v / 1000).toFixed(0)}k` : undefined}
            width={view === 'spend' ? 45 : 30}
          />
          <Tooltip
            cursor={{ fill: '#F3F4F6' }}
            contentStyle={{
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 12,
              color: '#374151',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
            formatter={(value, name) => {
              const num = typeof value === 'number' ? value : 0;
              return view === 'spend'
                ? ([formatSpend(num), String(name)] as [string, string])
                : ([num, String(name)] as [number, string]);
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#9CA3AF' }}
          />
          <Bar
            dataKey={String(lastYear)}
            fill="#FBB03F"
            radius={[3, 3, 0, 0]}
            maxBarSize={18}
          />
          <Bar
            dataKey={String(thisYear)}
            fill="#00334C"
            radius={[3, 3, 0, 0]}
            maxBarSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
