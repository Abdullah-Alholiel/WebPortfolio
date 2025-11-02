import { Redis } from '@upstash/redis';

// Track if SSL bypass has been logged to avoid console spam
let sslBypassLogged = false;

// Handle SSL certificate issues in development mode
// In development, we may encounter SSL certificate verification issues
// This allows us to bypass SSL verification ONLY in development mode
// NEVER do this in production - it's a significant security risk!
if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
  // In local development, automatically bypass SSL verification to avoid certificate issues
  // User can set ALLOW_INSECURE_TLS=false to force SSL verification (if they have proper certs)
  if (process.env.ALLOW_INSECURE_TLS !== 'false') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    // Only log once at startup
    if (!sslBypassLogged) {
      console.warn('⚠️  SSL verification disabled for local development. Set ALLOW_INSECURE_TLS=false to enable verification.');
      sslBypassLogged = true;
    }
  }
}

// Validate Upstash configuration
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || '';
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

if (!upstashUrl || !upstashToken) {
  console.warn('⚠️  Upstash Redis credentials not found. Make sure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set in your environment variables.');
}

// Initialize Upstash Redis client
const redis = new Redis({
  url: upstashUrl,
  token: upstashToken,
});

/**
 * Get the Redis client instance
 * Use this instead of creating new Redis instances to ensure SSL bypass is configured
 */
export function getRedis() {
  return redis;
}

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
 * Test Upstash Redis connection
 * Returns true if connection is successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_TOKEN || !process.env.UPSTASH_REDIS_REST_URL) {
      return false;
    }
    // Try a simple PING command
    await redis.ping();
    return true;
  } catch (error: any) {
    // Suppress verbose error logging for connection tests
    if (error?.message?.includes('certificate')) {
      console.error('SSL certificate error connecting to Upstash. If running locally, SSL verification is automatically disabled in development mode.');
    }
    return false;
  }
}

/**
 * Get data from Redis with fallback to null
 */
export async function getKVData<T>(key: string): Promise<T | null> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      return null;
    }
    const data = await redis.get<T>(key);
    return data;
  } catch (error: any) {
    // Only log non-certificate errors or log certificate errors once
    const isCertError = error?.cause?.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || 
                        error?.message?.includes('certificate') ||
                        error?.message?.includes('UNABLE_TO_GET_ISSUER_CERT');
    
    if (!isCertError) {
      console.error('Error fetching from Redis:', error);
    } else if (process.env.NODE_ENV === 'development') {
      // In dev mode, SSL errors are expected and handled, don't spam console
      // Only log once or if explicitly debugging
      if (process.env.DEBUG_UPSTASH === 'true') {
        console.warn('Upstash SSL certificate error (expected in dev with SSL bypass):', error.message);
      }
    }
    return null;
  }
}

/**
 * Set data in Redis with optional TTL (Time To Live in seconds)
 */
export async function setKVData<T>(key: string, value: T, ttl?: number): Promise<boolean> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      return false;
    }
    if (ttl) {
      await redis.setex(key, ttl, value);
    } else {
      await redis.set(key, value);
    }
    return true;
  } catch (error: any) {
    const isCertError = error?.cause?.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || 
                        error?.message?.includes('certificate');
    if (!isCertError) {
      console.error('Error setting Redis data:', error);
    }
    return false;
  }
}

/**
 * Delete data from Redis
 */
export async function deleteKVData(key: string): Promise<boolean> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      return false;
    }
    await redis.del(key);
    return true;
  } catch (error: any) {
    const isCertError = error?.cause?.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || 
                        error?.message?.includes('certificate');
    if (!isCertError) {
      console.error('Error deleting from Redis:', error);
    }
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
  } catch (error: any) {
    const isCertError = error?.cause?.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' || 
                        error?.message?.includes('certificate');
    if (!isCertError) {
      console.error('Error listing keys:', error);
    }
    return [];
  }
}

