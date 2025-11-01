import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../auth/logout/route';
import { getKVData, setKVData, KV_KEYS } from '@/lib/kv';

export async function GET(request: NextRequest) {
  // Verify auth
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getKVData<any[]>(KV_KEYS.PROJECTS);
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
    const project = await request.json();
    console.log('Saving project to Upstash:', project);
    const existing = await getKVData<any[]>(KV_KEYS.PROJECTS) || [];
    // Prepend new project to the beginning (newest first)
    const updated = [project, ...existing];
    const success = await setKVData(KV_KEYS.PROJECTS, updated);
    console.log('Save result:', success);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving project:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { index, project } = await request.json();
    const existing = await getKVData<any[]>(KV_KEYS.PROJECTS) || [];
    existing[index] = project;
    await setKVData(KV_KEYS.PROJECTS, existing);
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
    const existing = await getKVData<any[]>(KV_KEYS.PROJECTS) || [];
    const updated = existing.filter((_, i) => i !== index);
    await setKVData(KV_KEYS.PROJECTS, updated);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

