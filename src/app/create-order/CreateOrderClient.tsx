'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProductAutocomplete from '@/components/ProductAutocomplete';

// ── Types ────────────────────────────────────────────────────────────────────

interface Row {
  id: string;
  product: string;
  quantity: number;
  confirmed: boolean;
}

interface PlacedOrder {
  id: string;
  businessName: string;
  contactName: string;
  address: string;
  postcode: string;
  phone: string;
  openingTimes: string;
  placedAt: string;
  placedBy: { name: string };
  items: { id: string; product: string; quantity: number }[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRow(): Row {
  return { id: crypto.randomUUID(), product: '', quantity: 1, confirmed: false };
}

function makeRows(n: number): Row[] {
  return Array.from({ length: n }, makeRow);
}

const inputClass =
  'w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition-colors focus:border-[#6B7280] disabled:bg-[#F9FAFB]';

const labelClass = 'block text-xs font-medium text-[#6B7280] mb-1';

// ── Form tab ─────────────────────────────────────────────────────────────────

function OrderForm({ onSubmitted, products }: { onSubmitted: () => void; products: string[] }) {
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [openingTimes, setOpeningTimes] = useState('');
  const [rows, setRows] = useState<Row[]>(() => makeRows(6));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const activeRows = rows.filter((r) => r.product.trim());
  const allConfirmed = activeRows.length > 0 && activeRows.every((r) => r.confirmed);
  const canSubmit = allConfirmed && businessName.trim() && postcode.trim();

  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, makeRow()]);

  const removeRow = (id: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      return next.length === 0 ? [makeRow()] : next;
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postcode, address, businessName, contactName, phone, openingTimes,
          items: activeRows.map((r) => ({ product: r.product, quantity: r.quantity })),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'Something went wrong.');
      }
      setSuccess(true);
      // Reset form
      setPostcode(''); setAddress(''); setBusinessName('');
      setContactName(''); setPhone(''); setOpeningTimes('');
      setRows(makeRows(6));
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10l4 4 8-8" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-[#111827]">Order placed!</p>
        <p className="text-sm text-[#6B7280]">The team has been notified.</p>
        <button
          onClick={() => setSuccess(false)}
          className="cursor-pointer rounded-lg bg-[#111827] px-5 py-2 text-sm font-medium text-white hover:bg-[#374151]"
        >
          Place another order
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer details */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-[#111827]">Customer details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Business name</label>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} placeholder="Acme Café" disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>Contact name</label>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass} placeholder="Jane Smith" disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>Customer address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="123 High Street" disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>Customer postcode</label>
            <input value={postcode} onChange={(e) => setPostcode(e.target.value)} className={inputClass} placeholder="SW1A 1AA" disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>Phone number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="07700 900000" disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>Opening times</label>
            <input value={openingTimes} onChange={(e) => setOpeningTimes(e.target.value)} className={inputClass} placeholder="Mon–Fri 8am–6pm" disabled={submitting} />
          </div>
        </div>
      </div>

      {/* Order details table */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#F3F4F6] px-6 py-4">
          <h2 className="text-sm font-semibold text-[#111827]">Order details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">Product</th>
                <th className="py-3 px-4 text-center text-xs font-medium uppercase tracking-wide text-[#6B7280] w-32">Quantity</th>
                <th className="py-3 px-4 text-center text-xs font-medium uppercase tracking-wide text-[#6B7280] w-24">Confirm</th>
                <th className="py-3 px-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[#F3F4F6] last:border-b-0">
                  {/* Product */}
                  <td className="py-2 px-4">
                    <ProductAutocomplete
                      value={row.product}
                      onChange={(v) => updateRow(row.id, { product: v, confirmed: false })}
                      products={products}
                      disabled={submitting}
                    />
                  </td>
                  {/* Quantity */}
                  <td className="py-2 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateRow(row.id, { quantity: Math.max(1, row.quantity - 1) })}
                        disabled={submitting || row.quantity <= 1}
                        className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:border-[#9CA3AF] hover:text-[#374151] disabled:opacity-40"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2"><path d="M2 6h8" strokeLinecap="round"/></svg>
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-[#111827]">{row.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateRow(row.id, { quantity: row.quantity + 1 })}
                        disabled={submitting}
                        className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:border-[#9CA3AF] hover:text-[#374151] disabled:opacity-40"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2"><path d="M6 2v8M2 6h8" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  </td>
                  {/* Confirm */}
                  <td className="py-2 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={row.confirmed}
                      disabled={submitting || !row.product.trim()}
                      onChange={(e) => updateRow(row.id, { confirmed: e.target.checked })}
                      className="h-4 w-4 cursor-pointer rounded border-[#D1D5DB] text-[#111827] focus:ring-0 disabled:cursor-default disabled:opacity-40"
                    />
                  </td>
                  {/* Remove */}
                  <td className="py-2 px-2">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={submitting || rows.length === 1}
                      className="cursor-pointer text-[#D1D5DB] transition-colors hover:text-red-400 disabled:opacity-0"
                      title="Remove row"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 4h10M5.5 4V2.5h5V4M6.5 7v5M9.5 7v5M4 4l.75 9.5h6.5L12 4"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-[#F3F4F6]">
          <button
            type="button"
            onClick={addRow}
            disabled={submitting}
            className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-[#6B7280] transition-colors hover:text-[#374151]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
            Add row
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#9CA3AF]">
          {activeRows.length === 0
            ? 'Add at least one product to place an order.'
            : !allConfirmed
            ? 'Check the Confirm box for each product before placing.'
            : ''}
        </p>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#111827] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#374151] disabled:cursor-default disabled:opacity-40"
        >
          {submitting && (
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          {submitting ? 'Placing order…' : 'Place order'}
        </button>
      </div>
    </div>
  );
}

// ── History tab ───────────────────────────────────────────────────────────────

function OrderHistory({ refreshKey }: { refreshKey: number }) {
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="h-6 w-6 animate-spin text-[#9CA3AF]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  if (orders.length === 0) {
    return <p className="py-16 text-center text-sm text-[#9CA3AF]">No orders placed yet.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isOpen = expanded === order.id;
        const date = new Date(order.placedAt).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });
        return (
          <div key={order.id} className="rounded-xl border border-[#E5E7EB] bg-white">
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left hover:bg-[#F9FAFB] transition-colors rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{order.businessName}</p>
                  <p className="text-xs text-[#9CA3AF]">{order.contactName} · {order.postcode} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-[#9CA3AF]">{date}</p>
                  <p className="text-xs text-[#9CA3AF]">by {order.placedBy.name}</p>
                </div>
                <svg
                  className={`h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M3 6l5 5 5-5" />
                </svg>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-[#F3F4F6] px-5 pb-5 pt-4 space-y-4">
                {/* Customer details */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  {[
                    ['Address', order.address],
                    ['Postcode', order.postcode],
                    ['Phone', order.phone],
                    ['Opening times', order.openingTimes],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span className="text-[#9CA3AF]">{label}: </span>
                      <span className="text-[#374151]">{value}</span>
                    </div>
                  ))}
                </div>
                {/* Items */}
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="py-2 text-left text-xs font-medium text-[#6B7280]">Product</th>
                      <th className="py-2 text-right text-xs font-medium text-[#6B7280]">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b border-[#F3F4F6] last:border-b-0">
                        <td className="py-1.5 text-[#374151]">{item.product}</td>
                        <td className="py-1.5 text-right font-medium text-[#111827]">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────

export default function CreateOrderClient() {
  const [tab, setTab] = useState<'form' | 'history'>('form');
  const [historyKey, setHistoryKey] = useState(0);
  const [products, setProducts] = useState<string[]>([]);

  // Fetch product list once on mount
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data: string[]) => setProducts(data))
      .catch(() => {}); // graceful fallback — user can still type freely
  }, []);

  const handleSubmitted = () => {
    setHistoryKey((k) => k + 1);
    setTab('history');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="flex items-center border-b border-[#E5E7EB] bg-white px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] transition-colors hover:text-[#374151]"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Back
        </Link>
        <h1 className="ml-4 text-lg font-semibold text-[#111827]">Create Order</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E7EB] bg-white px-6">
        <div className="flex gap-0">
          {(['form', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`cursor-pointer px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-[#111827] text-[#111827]'
                  : 'border-transparent text-[#9CA3AF] hover:text-[#6B7280]'
              }`}
            >
              {t === 'form' ? 'New Order' : 'Order History'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        {tab === 'form'
          ? <OrderForm onSubmitted={handleSubmitted} products={products} />
          : <OrderHistory refreshKey={historyKey} />
        }
      </main>
    </div>
  );
}
