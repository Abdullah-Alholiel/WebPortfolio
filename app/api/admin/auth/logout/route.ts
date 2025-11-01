import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function POST(request: NextRequest) {
  try {
    // Bypass SSL for corporate networks
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
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

// Helper to check if user is authenticated
export async function checkAuth(request: NextRequest): Promise<{ authenticated: boolean; email?: string }> {
  try {
    // Bypass SSL for corporate networks
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const sessionId = request.cookies.get('admin_session')?.value;

    if (!sessionId) {
      return { authenticated: false };
    }

    const session = await redis.get<{ email: string; createdAt: number }>(`admin:session:${sessionId}`);

    if (!session) {
      return { authenticated: false };
    }

    return { authenticated: true, email: session.email };
  } catch (error) {
    console.error('Error checking auth:', error);
    return { authenticated: false };
  }
}

