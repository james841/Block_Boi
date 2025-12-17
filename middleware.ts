// middleware.ts (in project root, same level as app/ folder)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect all /admin routes except login
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const adminSession = await getAdminSession();

    if (!adminSession) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};