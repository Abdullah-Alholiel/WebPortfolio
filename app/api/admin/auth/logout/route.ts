import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/kv';

const redis = getRedis();

/**
 * Helper to refresh session cookie in API responses
 * Call this after checkAuth to ensure cookie expiration matches Redis TTL
 */
export function refreshSessionCookie(
  response: NextResponse,
  sessionId: string | undefined
): void {
  if (sessionId) {
    response.cookies.set('admin_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('admin_session')?.value;

    if (sessionId) {
      // Delete session from Redis
      await redis.del(`admin:session:${sessionId}`);
    }

    const response = NextResponse.json({ success: true });
    
    // Clear cookie
    response.cookies.delete('admin_session');

    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

// Helper to check if user is authenticated and refresh session
export async function checkAuth(request: NextRequest, refreshSession: boolean = true): Promise<{ authenticated: boolean; email?: string }> {
  try {
    const sessionId = request.cookies.get('admin_session')?.value;

    if (!sessionId) {
      return { authenticated: false };
    }

    const sessionKey = `admin:session:${sessionId}`;
    const session = await redis.get<{ email: string; createdAt: number }>(sessionKey);

    if (!session) {
      return { authenticated: false };
    }

    // Refresh session expiration if requested (sliding expiration)
    // This extends the session by 24 hours from now on each access
    if (refreshSession) {
      try {
        // Extend session TTL to 24 hours (86400 seconds) from now
        await redis.expire(sessionKey, 86400);
      } catch (refreshError) {
        // If refresh fails, log but don't fail authentication
        console.warn('Failed to refresh session TTL:', refreshError);
      }
    }

    return { authenticated: true, email: session.email };
  } catch (error) {
    console.error('Error checking auth:', error);
    return { authenticated: false };
  }
}

