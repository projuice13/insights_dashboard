import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

const PUBLIC_ROUTES = ['/login'];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.some((r) => path.startsWith(r));

  const token = (await cookies()).get('churn-session')?.value;
  const session = token ? await decrypt(token) : null;

  // Unauthenticated user hitting a protected route → login
  if (!isPublic && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // Authenticated user hitting login → their home
  if (isPublic && session) {
    const dest = session.role === 'admin' ? '/' : '/my-contacts';
    return NextResponse.redirect(new URL(dest, req.nextUrl));
  }

  // Team member trying to access admin routes → their view
  if (session?.role === 'team' && path.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/my-contacts', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.ico$|.*\\.png$).*)'],
};
