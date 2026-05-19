'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1.5">
          Email address
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none transition-colors focus:border-[#6B7280] focus:ring-0"
          placeholder="you@projuice.co.uk"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1.5">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none transition-colors focus:border-[#6B7280] focus:ring-0"
          placeholder="••••••••"
        />
      </div>
      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full cursor-pointer rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#374151] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
