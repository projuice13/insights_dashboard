import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export interface SessionPayload {
  userId: string;
  role: 'admin' | 'team';
  name: string;
  expiresAt: string;
}

const COOKIE = 'churn-session';
const DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getKey());
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(data: Omit<SessionPayload, 'expiresAt'>) {
  const expiresAt = new Date(Date.now() + DURATION_MS);
  const token = await encrypt({ ...data, expiresAt: expiresAt.toISOString() });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return decrypt(token);
}

export async function deleteSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
