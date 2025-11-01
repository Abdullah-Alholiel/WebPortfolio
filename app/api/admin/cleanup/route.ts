import { NextRequest, NextResponse } from 'next/server';
import { getRedis, listKeys, deleteKVData } from '@/lib/kv';
import { cleanupOldTokens } from '@/lib/admin-utils';

const redis = getRedis();

// Helper function to check authorization
function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CLEANUP_SECRET || 'admin-cleanup'}`;
}

export async function GET(request: NextRequest) {
  try {
    // Only allow cleanup from server-side or admin
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let cleaned = 0;
    
    // Clean up all tokens older than 1 day using the dedicated function
    const tokenCleanup = await cleanupOldTokens();
    cleaned += tokenCleanup.deleted;

    // Clean up expired sessions (sessions with TTL will auto-expire, but we check anyway)
    const sessionKeys = await listKeys('admin:session:*');
    for (const key of sessionKeys) {
      try {
        const ttl = await redis.ttl(key);
        // If TTL is -1 (no expiry) or -2 (doesn't exist), try to delete
        if (ttl === -1) {
          await deleteKVData(key);
          cleaned++;
        }
      } catch (err) {
        // If error, delete it
        await deleteKVData(key);
        cleaned++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      cleaned,
      tokensDeleted: tokenCleanup.deleted,
      errors: tokenCleanup.errors,
      message: `Cleaned up ${cleaned} expired tokens/sessions (${tokenCleanup.deleted} tokens deleted)` 
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only allow cleanup from server-side or admin
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let cleaned = 0;
    
    // Clean up all tokens older than 1 day using the dedicated function
    const tokenCleanup = await cleanupOldTokens();
    cleaned += tokenCleanup.deleted;

    // Clean up expired sessions (sessions with TTL will auto-expire, but we check anyway)
    const sessionKeys = await listKeys('admin:session:*');
    for (const key of sessionKeys) {
      try {
        const ttl = await redis.ttl(key);
        // If TTL is -1 (no expiry) or -2 (doesn't exist), try to delete
        if (ttl === -1) {
          await deleteKVData(key);
          cleaned++;
        }
      } catch (err) {
        // If error, delete it
        await deleteKVData(key);
        cleaned++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      cleaned,
      tokensDeleted: tokenCleanup.deleted,
      errors: tokenCleanup.errors,
      message: `Cleaned up ${cleaned} expired tokens/sessions (${tokenCleanup.deleted} tokens deleted)` 
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

