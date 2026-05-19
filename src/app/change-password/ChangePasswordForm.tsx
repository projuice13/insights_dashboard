'use client';

import { useActionState } from 'react';
import { changePasswordAction } from '@/app/actions/auth';

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, {});

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1.5">
          New password
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none transition-colors focus:border-[#6B7280]"
          placeholder="At least 8 characters"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#374151] mb-1.5">
          Confirm password
        </label>
        <input
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none transition-colors focus:border-[#6B7280]"
          placeholder="Repeat your password"
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
        {pending ? 'Saving…' : 'Change password'}
      </button>
    </form>
  );
}
