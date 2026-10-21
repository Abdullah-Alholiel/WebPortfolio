import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../auth/logout/route';
import { getKVData, setKVData } from '@/lib/kv';
import { venturesData } from '@/lib/data';

/**
 * Admin API for the Founder (ventures) section.
 *
 * Store: portfolio:ventures in Upstash. Seeded once from lib/data defaults
 * so the admin always starts with the real content (Abdullah: "data always
 * needs to show in admin streamlined accurately").
 */
const VENTURES_KEY = 'portfolio:ventures';

type Venture = Record<string, any>;

export async function GET(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    let ventures = await getKVData<Venture[]>(VENTURES_KEY);
    if (!Array.isArray(ventures) || ventures.length === 0) {
      ventures = venturesData.map((v) => ({ ...v }));
      await setKVData(VENTURES_KEY, ventures);
    }
    return NextResponse.json({ data: ventures });
  } catch (error) {
    console.error('Error reading ventures:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { ventures } = (await request.json()) ?? {};
    if (!Array.isArray(ventures)) {
      return NextResponse.json({ error: 'ventures array required' }, { status: 400 });
    }
    const clean = ventures.map((v: Venture) => ({
      name: String(v.name ?? '').trim(),
      stage: v.stage === 'revenue' || v.stage === 'hobby' ? v.stage : 'vc-targeted',
      stageLabel: String(v.stageLabel ?? '').trim(),
      chips: Array.isArray(v.chips) ? v.chips.slice(0, 4) : [],
      description: String(v.description ?? '').trim(),
      status:
        v.status === 'in-development' || v.status === 'coming-soon' || v.status === 'archived'
          ? v.status
          : 'archived',
      projectLink:
        v.projectLink && typeof v.projectLink === 'object' && v.projectLink.match
          ? { label: String(v.projectLink.label ?? 'See the project').trim(), match: String(v.projectLink.match).trim() }
          : null,
    }));
    const success = await setKVData(VENTURES_KEY, clean);
    if (!success) {
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: clean });
  } catch (error) {
    console.error('Error saving ventures:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
