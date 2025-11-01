import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Protect /admin routes (except /admin/login and /admin/verify)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const isLoginPage = request.nextUrl.pathname === '/admin/login';
    const isVerifyPage = request.nextUrl.pathname.startsWith('/admin/verify');
    
    // Allow access to login and verify pages
    if (isLoginPage || isVerifyPage) {
      return NextResponse.next();
    }

    // Check for session cookie
    const sessionId = request.cookies.get('admin_session')?.value;

    // If no session cookie, redirect to login
    if (!sessionId) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Allow request to proceed (session validation happens in page)
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};

