import { getRedis, listKeys, deleteKVData } from './kv';

// Use centralized Redis instance to ensure SSL configuration is consistent
const redis = getRedis();

/**
 * Check if user is authenticated and refresh session if valid
 * Sessions are refreshed on each access to extend expiration (sliding expiration)
 */
export async function verifyAdminSession(
  sessionId: string,
  refreshSession: boolean = true
): Promise<{ authenticated: boolean; email?: string }> {
  try {
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
    console.error('Error verifying session:', error);
    return { authenticated: false };
  }
}

/**
 * Clean up all tokens older than 1 day
 * This function deletes all admin tokens that are older than 24 hours
 */
export async function cleanupOldTokens(): Promise<{ deleted: number; errors: number }> {
  let deleted = 0;
  let errors = 0;
  const oneDayAgo = Date.now() - 86400000; // 24 hours ago

  try {
    // Get all token keys
    const tokenKeys = await listKeys('admin:token:*');
    console.log(`Found ${tokenKeys.length} tokens to check`);

    for (const key of tokenKeys) {
      try {
        const tokenData = await redis.get<{ email: string; expiresAt: number }>(key);
        
        if (!tokenData) {
          // Token doesn't exist or already expired, delete it
          await deleteKVData(key);
          deleted++;
          continue;
        }

        // Check if token is older than 1 day based on expiresAt timestamp
        // If expiresAt is older than 1 day ago, delete it
        if (tokenData.expiresAt < oneDayAgo) {
          await deleteKVData(key);
          deleted++;
          console.log(`Deleted old token: ${key}`);
        } else {
          // Also check TTL - if TTL is -1 (no expiry) or expired, delete it
          const ttl = await redis.ttl(key);
          if (ttl === -1 || ttl === -2) {
            await deleteKVData(key);
            deleted++;
            console.log(`Deleted token with invalid TTL: ${key}`);
          }
        }
      } catch (err) {
        errors++;
        console.error(`Error processing token ${key}:`, err);
        // Try to delete anyway if there's an error
        try {
          await deleteKVData(key);
          deleted++;
        } catch (deleteErr) {
          console.error(`Failed to delete ${key}:`, deleteErr);
        }
      }
    }

    console.log(`Cleanup completed: ${deleted} tokens deleted, ${errors} errors`);
    return { deleted, errors };
  } catch (error) {
    console.error('Error during token cleanup:', error);
    return { deleted, errors: errors + 1 };
  }
}

