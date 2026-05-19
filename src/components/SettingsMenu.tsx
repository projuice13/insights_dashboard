'use client';

import { useState, useRef, useEffect } from 'react';
import { logoutAction } from '@/app/actions/auth';

interface SettingsMenuProps {
  currentUser: { id: string; name: string };
  isTeam?: boolean;
  onImport?: (file: File) => void;
  onReset?: () => void;
}

export default function SettingsMenu({
  currentUser,
  isTeam = false,
  onImport,
  onReset,
}: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`cursor-pointer flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
          open
            ? 'border-[#9CA3AF] bg-[#F9FAFB] text-[#374151]'
            : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#9CA3AF] hover:text-[#374151]'
        }`}
      >
        {/* Gear icon */}
        <svg
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          viewBox="0 0 20 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="10" cy="10" r="2.5" />
          <path d="M10 2.5v1.25M10 16.25v1.25M2.5 10h1.25M16.25 10h1.25M4.697 4.697l.884.884M14.42 14.42l.883.883M4.697 15.303l.884-.884M14.42 5.58l.883-.883" />
        </svg>
        Settings
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[#E5E7EB] bg-white py-1.5 shadow-lg">
          {/* Signed-in user */}
          <div className="px-3.5 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">Signed in as</p>
            <p className="mt-0.5 truncate text-sm font-medium text-[#374151]">{currentUser.name}</p>
          </div>

          {/* Admin-only section */}
          {!isTeam && (
            <>
              <div className="my-1 border-t border-[#F3F4F6]" />

              <a
                href="/admin/users"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-[#374151] transition-colors hover:bg-[#F9FAFB]"
              >
                <svg className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="5" r="2.5" />
                  <path d="M1.5 14c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5"/>
                  <path d="M11 7.5v4M13 9.5h-4" />
                </svg>
                Manage users
              </a>

              {onImport && (
                <label className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-sm text-[#374151] transition-colors hover:bg-[#F9FAFB]">
                  <svg className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 10.5V3M5 6l3-3 3 3M3 13h10" />
                  </svg>
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) { e.target.value = ''; setOpen(false); onImport(file); }
                    }}
                  />
                </label>
              )}

              {onReset && (
                <button
                  onClick={() => {
                    setOpen(false);
                    if (window.confirm('Reset all data? This will permanently delete all orders, assignments and cannot be undone.')) {
                      onReset();
                    }
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
                >
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 4h10M5.5 4V2.5h5V4M6.5 7v5M9.5 7v5M4 4l.75 9.5h6.5L12 4" />
                  </svg>
                  Reset all data
                </button>
              )}
            </>
          )}

          <div className="my-1 border-t border-[#F3F4F6]" />

          <a
            href="/change-password"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-[#374151] transition-colors hover:bg-[#F9FAFB]"
          >
            <svg className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.5" y="7" width="11" height="7.5" rx="1.5" />
              <path d="M5 7V5a3 3 0 016 0v2" />
              <circle cx="8" cy="10.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            Change password
          </a>

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-[#374151] transition-colors hover:bg-[#F9FAFB]"
            >
              <svg className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.5 5.5L13 8l-2.5 2.5M13 8H6M6 2.5H3.5A1 1 0 002.5 3.5v9a1 1 0 001 1H6" />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
