import { NextRequest, NextResponse } from 'next/server';
import { decrypt, encrypt } from '@/lib/session';
import { cookies } from 'next/headers';

const PUBLIC_ROUTES = ['/login'];

const SESSION_COOKIE = 'churn-session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
// Refresh once the remaining lifetime drops below this, so an active user's
// session slides forward instead of expiring out from under them mid-task.
const REFRESH_THRESHOLD_MS = 6 * 24 * 60 * 60 * 1000; // 6 days

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.some((r) => path.startsWith(r));

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = token ? await decrypt(token) : null;

  // Unauthenticated user hitting a protected route → login
  if (!isPublic && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Authenticated user hitting login → landing page
  if (isPublic && session) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // Team member trying to access admin-only routes → their view
  if (session?.role === 'team' && (path.startsWith('/admin') || path.startsWith('/insights'))) {
    return NextResponse.redirect(new URL('/my-contacts', req.nextUrl));
  }

  const res = NextResponse.next();

  // Sliding session: while a valid session is in use, extend it as it nears
  // expiry so regular users are never logged out unexpectedly.
  if (session) {
    const remaining = new Date(session.expiresAt).getTime() - Date.now();
    if (Number.isFinite(remaining) && remaining < REFRESH_THRESHOLD_MS) {
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      const refreshed = await encrypt({
        userId: session.userId,
        role: session.role,
        name: session.name,
        expiresAt: expiresAt.toISOString(),
      });
      res.cookies.set(SESSION_COOKIE, refreshed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
      });
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.ico$|.*\\.png$).*)'],
};
