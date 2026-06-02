import Image from 'next/image';
import Link from 'next/link';
import { verifySession } from '@/lib/dal';
import { logoutAction } from '@/app/actions/auth';

export default async function HomePage() {
  const session = await verifySession();
  const dashboardHref = session.role === 'admin' ? '/insights' : '/my-contacts';

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Top bar */}
      <div className="flex justify-end px-6 py-4">
        <form action={logoutAction}>
          <button
            type="submit"
            className="cursor-pointer text-sm text-[#9CA3AF] transition-colors hover:text-[#374151]"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Main container */}
      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-[800px] space-y-10">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/box-logo.png"
              alt="Box Logo"
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
              href="https://projuice-postcode-checker.vercel.app/"
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

            {/* FAQs */}
            <Link
              href="/faqs"
              className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-6 py-5 shadow-sm transition-all hover:border-[#9CA3AF] hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6]">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.879 7.519c1.171-1.025 3.071-.966 4.242.036a3 3 0 01.29 4.229c-.29.36-.706.695-1.411 1.028C12 13.125 12 13.63 12 14.25" />
                    <circle cx="12" cy="17.25" r=".75" fill="white" stroke="none" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">FAQs</p>
                  <p className="mt-0.5 text-xs text-[#9CA3AF]">Frequently asked questions and how-to guides</p>
                </div>
              </div>
              <svg className="h-4 w-4 shrink-0 text-[#D1D5DB]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
