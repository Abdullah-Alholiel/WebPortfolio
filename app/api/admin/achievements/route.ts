import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../auth/logout/route';
import { getKVData, setKVData, KV_KEYS } from '@/lib/kv';
import { normalizeAchievementMedia } from '@/lib/media-normalizer';

export async function GET(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await getKVData<any[]>(KV_KEYS.ACHIEVEMENTS);
    const normalized = Array.isArray(data) ? data.map(normalizeAchievementMedia) : [];
    return NextResponse.json({ data: normalized });
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
    const achievement = normalizeAchievementMedia(await request.json());
    const existing = await getKVData<any[]>(KV_KEYS.ACHIEVEMENTS) || [];
    const existingNormalized = Array.isArray(existing)
      ? existing.map(normalizeAchievementMedia)
      : [];
    // Prepend new achievement to the beginning (newest first)
    await setKVData(KV_KEYS.ACHIEVEMENTS, [achievement, ...existingNormalized]);
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
    const { index, achievement } = await request.json();
    const existing = await getKVData<any[]>(KV_KEYS.ACHIEVEMENTS) || [];
    const normalizedExisting = Array.isArray(existing)
      ? existing.map(normalizeAchievementMedia)
      : [];
    normalizedExisting[index] = normalizeAchievementMedia(achievement);
    await setKVData(KV_KEYS.ACHIEVEMENTS, normalizedExisting);
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
    const existing = await getKVData<any[]>(KV_KEYS.ACHIEVEMENTS) || [];
    const updated = existing.filter((_, i) => i !== index);
    await setKVData(KV_KEYS.ACHIEVEMENTS, updated);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

