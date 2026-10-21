import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../auth/logout/route';
import { getKVData, setKVData, KV_KEYS } from '@/lib/kv';
import { syncCacheFromUpstash } from '@/lib/data-sync';
import { sortExperiencesByDate } from '@/lib/date-utils';
import { generateExperienceKey } from '@/lib/key-utils';
import { FOUNDER_SEEDS, FOUNDER_SEED_KEY } from '@/lib/founder-seed';

export const dynamic = 'force-dynamic';

/**
 * Admin API for the Experience / Journey section.
 *
 * Identity is the `key` field, NOT the array index. The previous version
 * mutated by index and then re-sorted by date, so deleting or editing an
 * entry shifted every later index — one delete could remove the wrong item.
 * Key-based updates are stable no matter how the list is sorted.
 */

/** Entries written by the founder seed carry `source: 'founder-seed'`. */
type StoredExperience = {
  key: string;
  title: string;
  location: string;
  description: string;
  date: string;
  icon?: string;
  source?: 'founder-seed' | 'admin';
};

/**
 * Makes sure every stored entry has a stable key, and that the founder
 * entries exist in the database (they used to be hardcoded in the
 * Experience component, which is why admin could not see or edit them).
 * Idempotent: existing keys are preserved, founder entries are added once.
 */
async function ensureSeeded(existing: StoredExperience[]): Promise<{
  items: StoredExperience[];
  changed: boolean;
}> {
  let items = existing.map((exp) => ({
    ...exp,
    key: exp.key || generateExperienceKey(exp.title, exp.date),
  }));
  let changed = false;

  // Marker check keeps repeat calls cheap and makes the seed a no-op.
  const marker = await getKVData<string>(FOUNDER_SEED_KEY);
  const presentKeys = new Set(items.map((i) => i.key));
  const presentTitles = new Set(items.map((i) => i.title.toLowerCase().trim()));

  const missing = FOUNDER_SEEDS.filter(
    (seed) => !presentKeys.has(seed.key) && !presentTitles.has(seed.title.toLowerCase().trim())
  );

  if (marker !== 'done' && missing.length > 0) {
    items = [...items, ...missing.map((seed) => ({ ...seed, source: 'founder-seed' as const }))];
    changed = true;
  }

  if (marker !== 'done') {
    await setKVData(FOUNDER_SEED_KEY, 'done');
    changed = true;
  }

  return { items: sortExperiencesByDate(items), changed };
}

export async function GET(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const existing = (await getKVData<StoredExperience[]>(KV_KEYS.EXPERIENCES)) || [];
    const { items, changed } = await ensureSeeded(existing);
    if (changed) {
      await setKVData(KV_KEYS.EXPERIENCES, items);
      syncCacheFromUpstash().catch(() => {});
    }
    return NextResponse.json({ data: items });
  } catch (error) {
    console.error('Error fetching experiences:', error);
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
    if (!experience?.title || !experience?.date) {
      return NextResponse.json({ error: 'title and date are required' }, { status: 400 });
    }
    const existing = (await getKVData<StoredExperience[]>(KV_KEYS.EXPERIENCES)) || [];
    const { items } = await ensureSeeded(existing);

    const withKey: StoredExperience = {
      key: generateExperienceKey(experience.title, experience.date),
      title: String(experience.title).trim(),
      location: String(experience.location ?? '').trim(),
      description: String(experience.description ?? '').trim(),
      date: String(experience.date).trim(),
      icon: experience.icon ? String(experience.icon) : 'FaBriefcase',
      source: 'admin',
    };

    const next = sortExperiencesByDate([...items, withKey]);
    await setKVData(KV_KEYS.EXPERIENCES, next);
    syncCacheFromUpstash().catch(() => {});
    return NextResponse.json({ success: true, data: next });
  } catch (error) {
    console.error('Error saving experience:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Accepts { key, experience }. Falls back to { index, experience } for
    // backwards compatibility with any older client, resolved against the
    // CURRENT sorted list rather than assuming a stored order.
    const { key, index, experience } = await request.json();
    if (!experience) {
      return NextResponse.json({ error: 'experience required' }, { status: 400 });
    }

    const stored = (await getKVData<StoredExperience[]>(KV_KEYS.EXPERIENCES)) || [];
    const { items } = await ensureSeeded(stored);

    let targetKey = key;
    if (!targetKey && typeof index === 'number') {
      targetKey = sortExperiencesByDate(items)[index]?.key;
    }
    if (!targetKey) {
      return NextResponse.json({ error: 'key (or valid index) required' }, { status: 400 });
    }

    const idx = items.findIndex((i) => i.key === targetKey);
    if (idx === -1) {
      return NextResponse.json({ error: 'experience not found' }, { status: 404 });
    }

    // Keep the ORIGINAL key: it is the stable identity used by the public
    // timeline deep links (#founder-koralink etc). Changing a title must not
    // break an inbound link. A new key is only minted if one is missing.
    const next = [...items];
    next[idx] = {
      ...items[idx],
      ...experience,
      key: items[idx].key || targetKey,
    } as StoredExperience;

    const sorted = sortExperiencesByDate(next);
    await setKVData(KV_KEYS.EXPERIENCES, sorted);
    syncCacheFromUpstash().catch(() => {});
    return NextResponse.json({ success: true, data: sorted });
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { key, index } = await request.json();

    const stored = (await getKVData<StoredExperience[]>(KV_KEYS.EXPERIENCES)) || [];
    const { items } = await ensureSeeded(stored);

    let targetKey = key;
    if (!targetKey && typeof index === 'number') {
      targetKey = sortExperiencesByDate(items)[index]?.key;
    }
    if (!targetKey) {
      return NextResponse.json({ error: 'key (or valid index) required' }, { status: 400 });
    }

    const updated = items.filter((i) => i.key !== targetKey);
    if (updated.length === items.length) {
      return NextResponse.json({ error: 'experience not found' }, { status: 404 });
    }

    const sorted = sortExperiencesByDate(updated);
    await setKVData(KV_KEYS.EXPERIENCES, sorted);
    syncCacheFromUpstash().catch(() => {});
    return NextResponse.json({ success: true, removed: items.length - sorted.length, data: sorted });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}