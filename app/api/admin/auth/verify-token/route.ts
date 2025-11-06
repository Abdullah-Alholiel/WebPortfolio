import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getRedis } from '@/lib/kv';

const redis = getRedis();

export async function POST(request: NextRequest) {
  try {
    console.log('Verify token called');
    const { token } = await request.json();
    console.log('Token received:', token);

    if (!token || typeof token !== 'string') {
      console.log('Invalid token format');
      return NextResponse.json(
        { error: 'Token required' },
        { status: 400 }
      );
    }

    // Get token data from Redis
    const redisKey = `admin:token:${token}`;
    console.log('Fetching token from Redis with key:', redisKey);
    
    try {
      const tokenData = await redis.get<{ email: string; expiresAt: number }>(redisKey);
      console.log('Token data retrieved:', tokenData ? 'Found' : 'Not found');
      
      if (tokenData) {
        console.log('Token details:', { email: tokenData.email, expiresAt: new Date(tokenData.expiresAt).toISOString() });
      }

      if (!tokenData) {
        console.log('Token not found in Redis - may have been used or expired');
        return NextResponse.json(
          { error: 'Invalid or expired token. Please request a new magic link.' },
          { status: 401 }
        );
      }

      // Check if token expired
      const now = Date.now();
      if (now > tokenData.expiresAt) {
        console.log('Token expired. Current time:', new Date(now).toISOString(), 'Expires at:', new Date(tokenData.expiresAt).toISOString());
        await redis.del(redisKey);
        return NextResponse.json(
          { error: 'Token expired. Please request a new magic link.' },
          { status: 401 }
        );
      }

      // Create session
      const sessionId = crypto.randomBytes(32).toString('hex');
      const sessionExpiresAt = Date.now() + 86400000; // 24 hours

      // Store session in Redis with TTL (24 hours = 86400 seconds)
      const sessionKey = `admin:session:${sessionId}`;
      console.log('Creating session:', sessionKey);
      await redis.setex(sessionKey, 86400, {
        email: tokenData.email,
        createdAt: Date.now(),
      });
      console.log('Session created successfully');

      // Delete used token (one-time use)
      await redis.del(redisKey);
      console.log('Token deleted after successful verification');

      // Set session cookie
      const response = NextResponse.json({ success: true, sessionId });
      response.cookies.set('admin_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400, // 24 hours
        path: '/',
      });

      console.log('Token verification successful');
      return response;
    } catch (redisError: any) {
      console.error('Redis error during token verification:', redisError);
      console.error('Redis error details:', redisError?.message, redisError?.stack);
      return NextResponse.json(
        { error: 'Failed to verify token. Please try again.', details: redisError?.message || String(redisError) },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error verifying token:', error);
    console.error('Error details:', error?.message, error?.stack);
    return NextResponse.json(
      { error: 'Failed to verify token', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

