import Image from 'next/image';
import Link from 'next/link';
import { verifySession } from '@/lib/dal';
import SendResourcesButton from '@/components/SendResourcesButton';
import SettingsMenu from '@/components/SettingsMenu';

export default async function HomePage() {
  const session = await verifySession();
  const dashboardHref = session.role === 'admin' ? '/insights' : '/my-contacts';

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Top bar */}
      <div className="flex justify-end px-6 py-4">
        <SettingsMenu
          currentUser={{ id: session.userId, name: session.name }}
          isTeam={session.role !== 'admin'}
        />
      </div>

      {/* Main container */}
      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-[800px] space-y-10">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={180}
              height={80}
              className="object-contain"
              priority
            />
          </div>

          {/* Welcome */}
          <div className="text-center">
            <p className="text-base text-[#6B7280]">
              Welcome back,{' '}
              <span className="font-medium text-[#374151]">{session.name}</span>.
              Choose a tool to get started.
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex flex-col gap-3">
            {/* Customer Insights Dashboard */}
            <Link
              href={dashboardHref}
              className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-6 py-5 shadow-sm transition-all hover:border-[#9CA3AF] hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#111827]">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,17 8,12 12,16 17,10 21,13" />
                    <line x1="3" y1="20" x2="21" y2="20" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Customer Insights Dashboard</p>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">View churn risk, manage contacts and track customer status</p>
                </div>
              </div>
              <svg className="h-4 w-4 shrink-0 text-[#D1D5DB]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </Link>

            {/* Postcode Checker */}
            <a
              href="https://resources.projuice.com/postcode-checker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-6 py-5 shadow-sm transition-all hover:border-[#9CA3AF] hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3B82F6]">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6z" />
                    <circle cx="12" cy="8" r="2" fill="white" stroke="none" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Postcode Checker</p>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">Look up delivery zones and coverage by postcode</p>
                </div>
              </div>
              <svg className="h-4 w-4 shrink-0 text-[#D1D5DB]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </a>

            {/* Delivery Portal */}
            <a
              href="https://deliveries.projuice.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-6 py-5 shadow-sm transition-all hover:border-[#9CA3AF] hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#10B981]">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h18M3 8l2-4h14l2 4M3 8v10a1 1 0 001 1h16a1 1 0 001-1V8" />
                    <circle cx="8.5" cy="19.5" r="1.5" fill="white" stroke="none" />
                    <circle cx="15.5" cy="19.5" r="1.5" fill="white" stroke="none" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Delivery Portal</p>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">Manage and track customer deliveries</p>
                </div>
              </div>
              <svg className="h-4 w-4 shrink-0 text-[#D1D5DB]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </a>

            {/* Create Order */}
            <Link
              href="/create-order"
              className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-6 py-5 shadow-sm transition-all hover:border-[#9CA3AF] hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EF4444]">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <path d="M9 12h6M9 16h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Create Order</p>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">Place a new customer order and view order history</p>
                </div>
              </div>
              <svg className="h-4 w-4 shrink-0 text-[#D1D5DB]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </Link>

            {/* Resources Portal */}
            <a
              href="https://resources.projuice.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-6 py-5 shadow-sm transition-all hover:border-[#9CA3AF] hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Resources Portal</p>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">Access product resources, guides and materials</p>
                </div>
              </div>
              <svg className="h-4 w-4 shrink-0 text-[#D1D5DB]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </a>

            {/* Training */}
            <Link
              href="/training"
              className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-6 py-5 shadow-sm transition-all hover:border-[#9CA3AF] hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6]">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4L2 9l10 5 10-5-10-5z" />
                    <path d="M6 11.5V16c0 1.1 2.69 2 6 2s6-.9 6-2v-4.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Training</p>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">Reference guides and resources for staff</p>
                </div>
              </div>
              <svg className="h-4 w-4 shrink-0 text-[#D1D5DB]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </Link>

          </div>

          {/* Send resources link */}
          <div className="flex justify-center">
            <SendResourcesButton />
          </div>
        </div>
      </main>
    </div>
  );
}
