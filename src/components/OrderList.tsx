'use client';

import { Order } from '@/lib/types';

interface OrderListProps {
  orders: Order[];
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(n: number): string {
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function OrderList({ orders }: OrderListProps) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
        Order History
      </h4>
      <div className="divide-y divide-[#F3F4F6] rounded-lg border border-[#E5E7EB] bg-white">
        {orders.map((order, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[13px] text-[#374151]">{formatDate(order.date)}</span>
            <span className="text-[13px] font-medium text-[#111827]">
              {formatCurrency(order.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
