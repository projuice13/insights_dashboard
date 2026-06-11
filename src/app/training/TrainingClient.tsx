'use client';

import { useState } from 'react';
import Link from 'next/link';
import MapsContent from './categories/MapsContent';
import ContactsContent from './categories/ContactsContent';
import DhlContent from './categories/DhlContent';
import OrderProcessingContent from './categories/OrderProcessingContent';
import StreamContent from './categories/StreamContent';
import WebsiteContent from './categories/WebsiteContent';

interface Category {
  key: string;
  label: string;
  content: React.ReactNode;
}

const CATEGORIES: Category[] = [
  { key: 'maps', label: 'Delivery Info', content: <MapsContent /> },
  { key: 'contacts', label: 'Contacts', content: <ContactsContent /> },
  { key: 'dhl', label: 'DHL', content: <DhlContent /> },
  { key: 'order-processing', label: 'Order Processing', content: <OrderProcessingContent /> },
  { key: 'website', label: 'Website', content: <WebsiteContent /> },
  { key: 'stream', label: 'Stream', content: <StreamContent /> },
];

export default function TrainingClient() {
  const [active, setActive] = useState(CATEGORIES[0].key);
  const activeCategory = CATEGORIES.find((c) => c.key === active) ?? CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Top bar */}
      <div className="flex items-center border-b border-[#E5E7EB] bg-white px-6 py-4 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] transition-colors hover:text-[#374151]"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Back
        </Link>
        <h1 className="ml-4 text-lg font-semibold text-[#111827]">Training</h1>

        <button
          onClick={() => window.print()}
          className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6V2h8v4M4 11H2.5A1.5 1.5 0 011 9.5v-2A1.5 1.5 0 012.5 6h11A1.5 1.5 0 0115 7.5v2a1.5 1.5 0 01-1.5 1.5H12M4 9h8v5H4V9z" />
          </svg>
          Print
        </button>
      </div>

      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8 print:block print:max-w-none print:p-0">
        {/* Left menu */}
        <nav className="w-48 shrink-0 print:hidden">
          <ul className="space-y-1">
            {CATEGORIES.map((cat) => (
              <li key={cat.key}>
                <button
                  onClick={() => setActive(cat.key)}
                  className={`w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    active === cat.key
                      ? 'bg-[#111827] text-white'
                      : 'text-[#6B7280] hover:bg-white hover:text-[#374151]'
                  }`}
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <main className="min-w-0 flex-1 print:w-full">
          {activeCategory.content}
        </main>
      </div>
    </div>
  );
}
