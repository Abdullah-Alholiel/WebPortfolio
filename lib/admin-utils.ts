import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * Check if user is authenticated
 */
export async function verifyAdminSession(sessionId: string): Promise<{ authenticated: boolean; email?: string }> {
  try {
    if (!sessionId) {
      return { authenticated: false };
    }

    const session = await redis.get<{ email: string; createdAt: number }>(`admin:session:${sessionId}`);

    if (!session) {
      return { authenticated: false };
    }

    return { authenticated: true, email: session.email };
  } catch (error) {
    console.error('Error verifying session:', error);
    return { authenticated: false };
  }
}

