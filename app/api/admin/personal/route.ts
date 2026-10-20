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
    const incoming = normalizePersonalMedia(await request.json());
    // Merge over the existing record instead of replacing it: a partial or
    // stale form payload must never silently drop stored fields (this is how
    // profileImageUrl was being lost). Explicit empty strings still clear.
    const existing = await getKVData<Record<string, any>>(KV_KEYS.PERSONAL_INFO);
    const personalInfo = normalizePersonalMedia({ ...(existing ?? {}), ...incoming });
    console.log('Saving personal info to Upstash (merged):', {
      existingKeys: existing ? Object.keys(existing) : [],
      incomingKeys: Object.keys(incoming),
      mergedKeys: Object.keys(personalInfo),
    });
    const success = await setKVData(KV_KEYS.PERSONAL_INFO, personalInfo);
    console.log('Save result:', success);

    // Sync cache in background (non-blocking)
    syncCacheFromUpstash().catch(() => {
      // Silently fail - cache sync is optional
    });

    return NextResponse.json({ success: true, data: personalInfo });
  } catch (error) {
    console.error('Error saving personal info:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

