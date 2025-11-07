import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../auth/logout/route';
import { deleteBlob, listBlobs, sanitizePrefix, uploadToBlob } from '@/lib/blob';

export const runtime = 'nodejs';

async function ensureAuth(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authResponse = await ensureAuth(request);
  if (authResponse) return authResponse;

  const { searchParams } = new URL(request.url);
  const prefix = sanitizePrefix(searchParams.get('prefix'));
  const cursor = searchParams.get('cursor');
  const limit = Number.parseInt(searchParams.get('limit') || '100', 10);

  try {
    const result = await listBlobs({ prefix, cursor, limit: Number.isFinite(limit) ? limit : 100 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to list blobs:', error);
    return NextResponse.json({ error: 'Failed to list media assets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResponse = await ensureAuth(request);
  if (authResponse) return authResponse;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const filename = (formData.get('filename') as string) || (file instanceof File ? file.name : undefined);
    const prefix = sanitizePrefix(formData.get('prefix') as string | null | undefined);

    if (!(file instanceof Blob) || !filename) {
      return NextResponse.json({ error: 'File upload form data is invalid' }, { status: 400 });
    }

    const maxBytes = 4.5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'Files larger than 4.5MB must use client-side uploads' }, { status: 413 });
    }

    const blob = await uploadToBlob(file, { filename, prefix });
    return NextResponse.json(blob, { status: 201 });
  } catch (error) {
    console.error('Failed to upload blob:', error);
    return NextResponse.json({ error: 'Failed to upload media asset' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authResponse = await ensureAuth(request);
  if (authResponse) return authResponse;

  try {
    const body = await request.json();
    const { url, pathname } = body ?? {};

    const target = typeof pathname === 'string' && pathname.length > 0 ? pathname : url;
    if (!target || typeof target !== 'string') {
      return NextResponse.json({ error: 'A blob URL or pathname is required' }, { status: 400 });
    }

    await deleteBlob(target);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete blob:', error);
    return NextResponse.json({ error: 'Failed to delete media asset' }, { status: 500 });
  }
}


