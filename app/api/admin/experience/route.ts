import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../auth/logout/route';
import { getKVData, setKVData, KV_KEYS } from '@/lib/kv';
import { syncCacheFromUpstash } from '@/lib/data-sync';
import { sortExperiencesByDate } from '@/lib/date-utils';
import { generateExperienceKey } from '@/lib/key-utils';

export async function GET(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await getKVData<any[]>(KV_KEYS.EXPERIENCES);
    const withKeys = (data || []).map((exp: any) => ({
      ...exp,
      key: exp.key || generateExperienceKey(exp.title, exp.date),
    }));
    return NextResponse.json({ data: withKeys });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const experience = await request.json();
    const existing = await getKVData<any[]>(KV_KEYS.EXPERIENCES) || [];
    const withKey = {
      ...experience,
      key: generateExperienceKey(experience.title, experience.date),
    };
    const withNew = [withKey, ...existing];
    const sorted = sortExperiencesByDate(withNew);
    await setKVData(KV_KEYS.EXPERIENCES, sorted);

    syncCacheFromUpstash().catch(() => {
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { index, experience } = await request.json();
    const existing = await getKVData<any[]>(KV_KEYS.EXPERIENCES) || [];
    existing[index] = {
      ...experience,
      key: generateExperienceKey(experience.title, experience.date),
    };
    const sorted = sortExperiencesByDate(existing);
    await setKVData(KV_KEYS.EXPERIENCES, sorted);

    syncCacheFromUpstash().catch(() => {
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { index } = await request.json();
    const existing = await getKVData<any[]>(KV_KEYS.EXPERIENCES) || [];
    const updated = existing.filter((_, i) => i !== index);
    const sorted = sortExperiencesByDate(updated);
    await setKVData(KV_KEYS.EXPERIENCES, sorted);

    syncCacheFromUpstash().catch(() => {
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
