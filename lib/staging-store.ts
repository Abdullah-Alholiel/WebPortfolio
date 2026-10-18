import { promises as fs } from 'fs';
import path from 'path';

/**
 * Shared server-side store for the staging notes system.
 * SERVER ONLY — uses fs; never import from client components.
 *
 * Files (inside STAGING_NOTES_DIR, volume-mounted in staging):
 *   notes.json    → { seq, notes: [...] }     (visitor-submitted notes)
 *   resolved.json → { resolved: [...] }       ("✓ Addressed" messages Hermes
 *                                              writes when a note is implemented)
 */

export const STORE_DIR =
  process.env.STAGING_NOTES_DIR || path.join(process.cwd(), '.staging');
export const NOTES_FILE = path.join(STORE_DIR, 'notes.json');
export const RESOLVED_FILE = path.join(STORE_DIR, 'resolved.json');

export type StagingNote = {
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

export type ResolvedEntry = {
  id: string;
  message: string;
  at: string;
};

export async function readNotes(): Promise<{ seq: number; notes: StagingNote[] }> {
  try {
    const raw = await fs.readFile(NOTES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      seq: Number(parsed.seq) || 0,
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    };
  } catch {
    return { seq: 0, notes: [] };
  }
}

export async function writeNotes(store: { seq: number; notes: StagingNote[] }) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  const tmp = NOTES_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), 'utf-8');
  await fs.rename(tmp, NOTES_FILE);
}

export async function readResolved(): Promise<ResolvedEntry[]> {
  try {
    const raw = await fs.readFile(RESOLVED_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.resolved) ? parsed.resolved : [];
  } catch {
    return [];
  }
}

export async function writeResolved(resolved: ResolvedEntry[]) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  const tmp = RESOLVED_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify({ resolved }, null, 2), 'utf-8');
  await fs.rename(tmp, RESOLVED_FILE);
}
