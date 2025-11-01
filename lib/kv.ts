import { Redis } from '@upstash/redis';

// Only bypass SSL in development if explicitly needed (e.g., corporate proxy)
// Set ALLOW_INSECURE_TLS=true in .env.local if you encounter SSL certificate errors
// NEVER set this in production - it's a security risk!
if (process.env.NODE_ENV === 'development' && process.env.ALLOW_INSECURE_TLS === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Data structure keys
export const KV_KEYS = {
  PROJECTS: 'portfolio:projects',
  EXPERIENCES: 'portfolio:experiences',
  SKILLS: 'portfolio:skills',
  ACHIEVEMENTS: 'portfolio:achievements',
  MENTORSHIP: 'portfolio:mentorship',
  PERSONAL_INFO: 'portfolio:personal_info',
  ADMIN_SESSION: 'admin:session', // for sessions
  ADMIN_TOKEN: 'admin:token', // for magic link tokens
} as const;

/**
 * Get data from Redis with fallback to null
 */
export async function getKVData<T>(key: string): Promise<T | null> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn('Upstash Redis not configured, returning null');
      return null;
    }
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.error('Error fetching from Redis:', error);
    return null;
  }
}

/**
 * Set data in Redis with optional TTL (Time To Live in seconds)
 */
export async function setKVData<T>(key: string, value: T, ttl?: number): Promise<boolean> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn('Upstash Redis not configured, skipping set');
      return false;
    }
    if (ttl) {
      await redis.setex(key, ttl, value);
    } else {
      await redis.set(key, value);
    }
    return true;
  } catch (error) {
    console.error('Error setting Redis data:', error);
    return false;
  }
}

/**
 * Delete data from Redis
 */
export async function deleteKVData(key: string): Promise<boolean> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn('Upstash Redis not configured, skipping delete');
      return false;
    }
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Error deleting from Redis:', error);
    return false;
  }
}

/**
 * List all keys matching a pattern
 */
export async function listKeys(pattern: string): Promise<string[]> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      return [];
    }
    const keys: string[] = [];
    let cursor = 0;
    do {
      const result = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = Number(result[0]);
      keys.push(...result[1]);
    } while (cursor !== 0);
    return keys;
  } catch (error) {
    console.error('Error listing keys:', error);
    return [];
  }
}

