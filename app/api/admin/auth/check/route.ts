import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../logout/route';

export async function GET(request: NextRequest) {
  try {
    // Check auth and refresh session (sliding expiration)
    const auth = await checkAuth(request, true);
    
    if (!auth.authenticated) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Refresh cookie expiration to match Redis TTL (24 hours)
    const response = NextResponse.json({ authenticated: true, email: auth.email });
    const sessionId = request.cookies.get('admin_session')?.value;
    
    if (sessionId) {
      // Refresh cookie expiration to match Redis session TTL
      response.cookies.set('admin_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400, // 24 hours
        path: '/',
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

