'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createSession, deleteSession, getSession } from '@/lib/session';

export interface ActionState {
  error?: string;
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: 'Invalid email or password.' };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: 'Invalid email or password.' };

  await createSession({
    userId: user.id,
    role: user.role as 'admin' | 'team',
    name: user.name,
  });

  if (user.mustChangePass) {
    redirect('/change-password');
  }

  redirect('/');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) redirect('/login');

  const newPass = formData.get('password') as string;
  const confirm = formData.get('confirm') as string;

  if (!newPass || newPass.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }
  if (newPass !== confirm) {
    return { error: 'Passwords do not match.' };
  }

  const hash = await bcrypt.hash(newPass, 12);
  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: hash, mustChangePass: false },
  });

  redirect('/');
}
