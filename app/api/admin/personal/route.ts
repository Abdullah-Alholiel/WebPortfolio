import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../auth/logout/route';
import { getKVData, setKVData, KV_KEYS } from '@/lib/kv';
import { syncCacheFromUpstash } from '@/lib/data-sync';
import { normalizePersonalMedia } from '@/lib/media-normalizer';

export async function GET(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await getKVData<any>(KV_KEYS.PERSONAL_INFO);
    const normalized = data ? normalizePersonalMedia(data) : {};
    return NextResponse.json({ data: normalized });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const personalInfo = normalizePersonalMedia(await request.json());
    console.log('Saving personal info to Upstash:', personalInfo);
    const success = await setKVData(KV_KEYS.PERSONAL_INFO, personalInfo);
    console.log('Save result:', success);
    
    // Sync cache in background (non-blocking)
    syncCacheFromUpstash().catch(() => {
      // Silently fail - cache sync is optional
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving personal info:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

