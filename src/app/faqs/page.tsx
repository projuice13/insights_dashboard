import Link from 'next/link';
import { verifySession } from '@/lib/dal';
import FaqAccordion from './FaqAccordion';

export default async function FaqsPage() {
  await verifySession();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Top bar */}
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
      </div>

      <main className="flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-[800px] space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#111827]">Helper</h1>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              How-to guides and answers to common questions about your tools.
            </p>
          </div>
          <FaqAccordion />
        </div>
      </main>
    </div>
  );
}
