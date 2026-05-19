import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from './session';

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
});

export const requireAdmin = cache(async () => {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'admin') redirect('/my-contacts');
  return session;
});
