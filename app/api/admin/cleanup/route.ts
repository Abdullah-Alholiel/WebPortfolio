import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { listKeys, deleteKVData } from '@/lib/kv';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function POST(request: NextRequest) {
  try {
    // Bypass SSL for corporate networks
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    // Only allow cleanup from server-side or admin
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CLEANUP_SECRET || 'admin-cleanup'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let cleaned = 0;
    
    // Clean up expired tokens
    const tokenKeys = await listKeys('admin:token:*');
    for (const key of tokenKeys) {
      try {
        const tokenData = await redis.get<{ email: string; expiresAt: number }>(key);
        if (tokenData && Date.now() > tokenData.expiresAt) {
          await deleteKVData(key);
          cleaned++;
        }
      } catch (err) {
        // If token not found or error, delete it anyway
        await deleteKVData(key);
        cleaned++;
      }
    }

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
      message: `Cleaned up ${cleaned} expired tokens/sessions` 
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

