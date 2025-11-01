import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../auth/logout/route';
import { getKVData, setKVData, KV_KEYS } from '@/lib/kv';

export async function GET(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await getKVData<any[]>(KV_KEYS.EXPERIENCES);
    return NextResponse.json({ data: data || [] });
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
    // Prepend new experience to the beginning (newest first)
    await setKVData(KV_KEYS.EXPERIENCES, [experience, ...existing]);
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
    existing[index] = experience;
    await setKVData(KV_KEYS.EXPERIENCES, existing);
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
    await setKVData(KV_KEYS.EXPERIENCES, updated);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

