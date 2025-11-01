import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Verify token called');
    const { token } = await request.json();
    console.log('Token received:', token);

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 400 }
      );
    }

    // Get token data from Redis
    console.log('Fetching token from Redis...');
    const tokenData = await redis.get<{ email: string; expiresAt: number }>(`admin:token:${token}`);
    console.log('Token data:', tokenData);

    if (!tokenData) {
      console.log('Token not found in Redis');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if token expired
    if (Date.now() > tokenData.expiresAt) {
      await redis.del(`admin:token:${token}`);
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    // Create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 86400000; // 24 hours

    // Store session in Redis with TTL (24 hours = 86400 seconds)
    await redis.setex(`admin:session:${sessionId}`, 86400, {
      email: tokenData.email,
      createdAt: Date.now(),
    });

    // Delete used token
    await redis.del(`admin:token:${token}`);

    // Set session cookie
    const response = NextResponse.json({ success: true, sessionId });
    response.cookies.set('admin_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error verifying token:', error);
    console.error('Error details:', error?.message, error?.stack);
    return NextResponse.json(
      { error: 'Failed to verify token', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

