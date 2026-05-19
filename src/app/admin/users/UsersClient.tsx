'use client';

import { useState } from 'react';
import { logoutAction } from '@/app/actions/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  mustChangePass: boolean;
  createdAt: string;
}

interface Props {
  initialUsers: User[];
}

export default function UsersClient({ initialUsers }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'team'>('team');
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<{ name: string; password: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setFormError(null);

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), role }),
    });

    const data = await res.json();
    setAdding(false);

    if (!res.ok) {
      setFormError(data.error ?? 'Failed to create user.');
      return;
    }

    setUsers((prev) => [...prev, data.user].sort((a, b) => a.name.localeCompare(b.name)));
    setNewPassword({ name: data.user.name, password: data.temporaryPassword });
    setName('');
    setEmail('');
    setRole('team');
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user? Their assignments and notes will also be deleted.')) return;
    setDeletingId(userId);

    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });

    setDeletingId(null);
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="border-b border-[#E5E7EB] bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="cursor-pointer text-sm text-[#6B7280] hover:text-[#374151]"
            >
              ← Dashboard
            </a>
            <h1 className="text-lg font-semibold text-[#111827] tracking-tight">
              Manage Users
            </h1>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="cursor-pointer text-sm text-[#9CA3AF] underline underline-offset-2 hover:text-[#374151]"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 space-y-8">
        {/* Existing users */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[#374151]">Team members</h2>
          <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
            {users.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#9CA3AF]">No users yet.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280]">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-[#E5E7EB] last:border-0">
                      <td className="px-4 py-3 text-sm font-medium text-[#111827]">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">{u.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-sm text-[#374151] outline-none focus:border-[#6B7280]"
                        >
                          <option value="admin">Admin</option>
                          <option value="team">Team</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {u.mustChangePass ? (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
                            Temp password
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700 ring-1 ring-green-200">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deletingId === u.id}
                          className="cursor-pointer text-[13px] text-red-500 hover:text-red-700 disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add user form */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[#374151]">Add a new user</h2>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Hollie"
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#6B7280]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="hollie@projuice.co.uk"
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#6B7280]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'team')}
                  className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#6B7280]"
                >
                  <option value="team">Team — sees only their assigned contacts</option>
                  <option value="admin">Admin — full access</option>
                </select>
              </div>
              {formError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              )}
              <button
                type="submit"
                disabled={adding}
                className="cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#374151] disabled:opacity-60"
              >
                {adding ? 'Adding…' : 'Add user'}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Temporary password modal */}
      {newPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xl mx-4">
            <h3 className="text-base font-semibold text-[#111827]">
              User created — temporary password
            </h3>
            <p className="mt-2 text-sm text-[#6B7280]">
              Share this password with <strong>{newPassword.name}</strong>. It will only be shown once.
            </p>
            <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
              <code className="text-sm font-mono font-semibold text-[#111827] select-all">
                {newPassword.password}
              </code>
            </div>
            <p className="mt-2 text-xs text-[#9CA3AF]">
              They will be prompted to change this when they first sign in.
            </p>
            <button
              onClick={() => setNewPassword(null)}
              className="mt-4 w-full cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#374151]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
