import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../auth/logout/route';
import { getKVData, setKVData, KV_KEYS } from '@/lib/kv';
import { syncCacheFromUpstash } from '@/lib/data-sync';
import { normalizeProjectMedia } from '@/lib/media-normalizer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  // Verify auth
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getKVData<any[]>(KV_KEYS.PROJECTS);
    const normalized = Array.isArray(data) ? data.map(normalizeProjectMedia) : [];
    return NextResponse.json(
      { data: normalized },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    );
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
    const project = normalizeProjectMedia(await request.json());
    console.log('=== Saving project to Upstash ===');
    console.log('Project payload:', JSON.stringify(project, null, 2));
    console.log('Project keys:', Object.keys(project));
    console.log('Experience key:', project.experienceKey);
    console.log('Title:', project.title);

    // Validate experienceKey format
    if (project.experienceKey && project.experienceKey.includes('/')) {
      console.warn('⚠️ WARNING: experienceKey contains slash which may cause issues:', project.experienceKey);
    }

    const existing = await getKVData<any[]>(KV_KEYS.PROJECTS) || [];
    const existingNormalized = Array.isArray(existing)
      ? existing.map(normalizeProjectMedia)
      : [];
    // Prepend new project to the beginning (newest first)
    const updated = [project, ...existingNormalized];
    const success = await setKVData(KV_KEYS.PROJECTS, updated);

    if (!success) {
      console.error('=== FAILED to persist project to Upstash ===');
      return NextResponse.json(
        { error: 'Failed to persist project to Upstash. Verify Upstash credentials.' },
        { status: 500 },
      );
    }
    console.log('=== Save result: SUCCESS ===');

    // Sync cache in background (non-blocking)
    syncCacheFromUpstash().catch(() => {
      // Silently fail - cache sync is optional
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('=== ERROR saving project ===');
    console.error('Error:', error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
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
    console.log('=== Updating project ===');
    console.log('Index:', index);
    console.log('Project payload:', JSON.stringify(project, null, 2));
    console.log('Experience key:', project.experienceKey);

    const existing = await getKVData<any[]>(KV_KEYS.PROJECTS) || [];
    const normalizedExisting = Array.isArray(existing)
      ? existing.map(normalizeProjectMedia)
      : [];
    normalizedExisting[index] = normalizeProjectMedia(project);
    const success = await setKVData(KV_KEYS.PROJECTS, normalizedExisting);

    if (!success) {
      console.error('=== FAILED to update project in Upstash ===');
      return NextResponse.json(
        { error: 'Failed to persist project update. Verify Upstash credentials.' },
        { status: 500 },
      );
    }
    console.log('=== Update result: SUCCESS ===');

    // Sync cache in background (non-blocking)
    syncCacheFromUpstash().catch(() => {
      // Silently fail - cache sync is optional
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('=== ERROR updating project ===');
    console.error('Error:', error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
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
    const success = await setKVData(KV_KEYS.PROJECTS, updated);
    if (!success) {
      console.error('Failed to delete project from Upstash');
      return NextResponse.json(
        { error: 'Failed to delete project from Upstash. Verify Upstash credentials.' },
        { status: 500 },
      );
    }

    // Sync cache in background (non-blocking)
    syncCacheFromUpstash().catch(() => {
      // Silently fail - cache sync is optional
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { projects } = await request.json();
    if (!Array.isArray(projects)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const normalized = projects.map(normalizeProjectMedia);
    const success = await setKVData(KV_KEYS.PROJECTS, normalized);
    if (!success) {
      console.error('Failed to reorder projects in Upstash');
      return NextResponse.json(
        { error: 'Failed to persist project order. Verify Upstash credentials.' },
        { status: 500 },
      );
    }

    syncCacheFromUpstash().catch(() => {
      // Silently fail - cache sync is optional
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}

