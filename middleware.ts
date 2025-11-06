import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRedis } from './lib/kv';

const redis = getRedis();

export async function middleware(request: NextRequest) {
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

    // Validate session exists in Redis and refresh it
    try {
      const sessionKey = `admin:session:${sessionId}`;
      const session = await redis.get<{ email: string; createdAt: number }>(sessionKey);

      if (!session) {
        // Session doesn't exist or expired, redirect to login
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        const response = NextResponse.redirect(loginUrl);
        // Clear invalid cookie
        response.cookies.delete('admin_session');
        return response;
      }

      // Session is valid - refresh it (extend TTL by 24 hours)
      try {
        await redis.expire(sessionKey, 86400); // 24 hours
      } catch (refreshError) {
        // If refresh fails, log but allow request to proceed
        console.warn('Failed to refresh session TTL in middleware:', refreshError);
      }

      // Refresh cookie expiration to match Redis TTL
      const response = NextResponse.next();
      response.cookies.set('admin_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400, // 24 hours
        path: '/',
      });

      return response;
    } catch (error) {
      // If Redis check fails, redirect to login for safety
      console.error('Error validating session in middleware:', error);
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};

