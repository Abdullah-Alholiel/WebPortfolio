import { NextRequest, NextResponse } from 'next/server';
import {
  readNotes,
  writeNotes,
  readResolved,
  writeResolved,
  type ResolvedEntry,
} from '@/lib/staging-store';

/**
 * Staging "resolved notes" API — messages shown to Abdullah in the notes panel.
 *
 * GET    /api/staging-notes/resolved?key=KEY                      → { resolved: [...] }
 * POST   /api/staging-notes/resolved { key, id, message }         → { ok, count }
 * DELETE /api/staging-notes/resolved?key=KEY&id=ID                → { ok, count }
 * DELETE /api/staging-notes/resolved?key=KEY                      → { ok, count }  (clears all)
 *
 * key = STAGING_NOTES_KEY (shared staging secret).
 */

function expectedKey(): string {
  return process.env.STAGING_NOTES_KEY || 'staging-notes';
}

function isAuthorized(key: string | null | undefined): boolean {
  return Boolean(key) && key === expectedKey();
}

function unauthorized() {
  return NextResponse.json({ error: 'invalid or missing key' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const key = new URL(request.url).searchParams.get('key');
  if (!isAuthorized(key)) return unauthorized();
  const resolved = await readResolved();
  return NextResponse.json(
    { resolved },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  if (!isAuthorized(body?.key)) return unauthorized();

  const id = typeof body?.id === 'string' ? body.id.slice(0, 120) : null;
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 500) : null;
  if (!id || !message) {
    return NextResponse.json({ error: 'id and message required' }, { status: 400 });
  }

  // Verify the note exists (prevents orphaned resolved entries)
  const store = await readNotes();
  if (!store.notes.some((n) => n.id === id)) {
    return NextResponse.json({ error: 'note id not found' }, { status: 404 });
  }

  const resolved = await readResolved();
  const filtered = resolved.filter((r: ResolvedEntry) => r.id !== id);
  filtered.push({ id, message, at: new Date().toISOString() });
  await writeResolved(filtered);

  return NextResponse.json({ ok: true, count: filtered.length });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (!isAuthorized(searchParams.get('key'))) return unauthorized();

  const id = searchParams.get('id');
  const resolved = await readResolved();
  const next = id ? resolved.filter((r: ResolvedEntry) => r.id !== id) : [];
  await writeResolved(next);
  return NextResponse.json({ ok: true, count: next.length });
}
