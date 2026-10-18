import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Staging notes API — stores Abdullah's component feedback notes as JSON.
 *
 * Auth: shared access key. Set STAGING_NOTES_KEY env var in real use;
 * falls back to 'staging-notes' for local staging only.
 *
 * Storage: <project>/.staging/notes.json (gitignored — data lives on the
 * staging host, not in the repo).
 *
 * Endpoints:
 *   GET    /api/staging-notes?key=KEY              → { notes: [...] }
 *   POST   /api/staging-notes { key, note }        → { ok, count }
 *   DELETE /api/staging-notes?key=KEY&id=NOTE_ID   → { ok, count }
 */

// Store outside .next so the store survives rebuilds. Use an explicit
// override first (useful if the process CWD ever differs), else project root.
const STORE_DIR =
  process.env.STAGING_NOTES_DIR ||
  path.join(process.cwd(), '.staging');
const STORE_FILE = path.join(STORE_DIR, 'notes.json');

const FALLBACK_KEY = 'staging-notes';

function expectedKey(): string {
  return process.env.STAGING_NOTES_KEY || FALLBACK_KEY;
}

function isAuthorized(key: string | null): boolean {
  return Boolean(key) && key === expectedKey();
}

type StagingNote = {
  id: string;
  kind?: 'text' | 'element';
  section?: string;
  component?: string;
  quote?: string;
  element?: string;
  note: string;
  path?: string;
  seq?: number;
  createdAt: string;
};

async function readStore(): Promise<{ seq: number; notes: StagingNote[] }> {
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      seq: Number(parsed.seq) || 0,
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    };
  } catch {
    return { seq: 0, notes: [] };
  }
}

async function writeStore(store: { seq: number; notes: StagingNote[] }) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  const tmp = STORE_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), 'utf-8');
  await fs.rename(tmp, STORE_FILE);
}

function unauthorized() {
  return NextResponse.json(
    { error: 'invalid or missing key' },
    { status: 401 }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (!isAuthorized(searchParams.get('key'))) return unauthorized();

  const store = await readStore();
  const notes = [...store.notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json(
    { notes, count: notes.length },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  if (!isAuthorized(body?.key)) return unauthorized();

  const note = body?.note;
  if (
    !note ||
    typeof note.note !== 'string' ||
    !note.note.trim() ||
    typeof note.id !== 'string' ||
    typeof note.createdAt !== 'string'
  ) {
    return NextResponse.json(
      { error: 'note must include id, note, createdAt (strings)' },
      { status: 400 }
    );
  }

  const store = await readStore();

  // Dedup on client-generated id (retries / double submits).
  const existingIdx = store.notes.findIndex((n) => n.id === note.id);
  const seq = store.seq + 1;
  const clean: StagingNote = {
    id: note.id,
    kind: note.kind === 'element' ? 'element' : 'text',
    section: String(note.section || 'page').slice(0, 80),
    component: String(note.component || 'page').slice(0, 80),
    quote: String(note.quote || '').slice(0, 500),
    element: String(note.element || '').slice(0, 200),
    note: note.note.trim().slice(0, 4000),
    path: String(note.path || '/').slice(0, 200),
    seq,
    createdAt: note.createdAt,
  };

  if (existingIdx >= 0) {
    store.notes[existingIdx] = clean;
  } else {
    store.notes.push(clean);
  }
  store.seq = seq;

  await writeStore(store);
  return NextResponse.json({ ok: true, count: store.notes.length, note: clean });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  if (!isAuthorized(searchParams.get('key'))) return unauthorized();

  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const store = await readStore();
  const before = store.notes.length;
  store.notes = store.notes.filter((n) => n.id !== id);
  await writeStore(store);
  return NextResponse.json({
    ok: true,
    removed: before - store.notes.length,
    count: store.notes.length,
  });
}
