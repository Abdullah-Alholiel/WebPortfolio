import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../auth/logout/route';
import { getKVData, setKVData, KV_KEYS } from '@/lib/kv';
import { SITE_COPY_DEFAULTS, type SiteCopy } from '@/lib/site-copy';

export const dynamic = 'force-dynamic';

const COPY_KEY = 'portfolio:site_copy';

export async function GET(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const stored = (await getKVData<SiteCopy>(COPY_KEY)) || {};
    // Merge over defaults so a newly added key is never blank in admin.
    const merged: SiteCopy = { ...SITE_COPY_DEFAULTS, ...stored };
    return NextResponse.json({ data: merged });
  } catch (error) {
    console.error('Error reading site copy:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { copy } = (await request.json()) ?? {};
    if (!copy || typeof copy !== 'object' || Array.isArray(copy)) {
      return NextResponse.json({ error: 'copy object required' }, { status: 400 });
    }

    const clean: SiteCopy = {};
    for (const [key, value] of Object.entries(copy)) {
      if (typeof value !== 'string') continue;
      const trimmed = value.trim().slice(0, 300);
      // An emptied field falls back to the default wording rather than
      // rendering a blank heading.
      clean[key.slice(0, 120)] = trimmed === '' ? (SITE_COPY_DEFAULTS as any)[key] ?? '' : trimmed;
    }

    const ok = await setKVData(COPY_KEY, clean);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: clean });
  } catch (error) {
    console.error('Error saving site copy:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}