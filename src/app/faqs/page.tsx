import Link from 'next/link';
import { verifySession } from '@/lib/dal';
import FaqAccordion from './FaqAccordion';
import AskQuestion from './AskQuestion';
import ReindexButton from '@/components/ReindexButton';

export default async function FaqsPage() {
  const session = await verifySession();

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
        <div className="w-full max-w-[800px] space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-[#111827]">Helper</h1>
              <p className="mt-1 text-sm text-[#9CA3AF]">
                Ask a question or browse the guides below.
              </p>
            </div>
            {session.role === 'admin' && <ReindexButton />}
          </div>

          {/* AI Q&A */}
          <AskQuestion isAdmin={session.role === 'admin'} />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#F9FAFB] px-3 text-xs text-[#9CA3AF]">Common questions</span>
            </div>
          </div>

          {/* Static FAQ accordion */}
          <FaqAccordion />
        </div>
      </main>
    </div>
  );
}
