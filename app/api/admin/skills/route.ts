import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '../auth/logout/route';
import { getKVData, setKVData, KV_KEYS } from '@/lib/kv';

export async function GET(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await getKVData<any>(KV_KEYS.SKILLS);
    return NextResponse.json({ data: data || {} });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const skills = await request.json();
    
    // Validate and normalize the skills structure
    const validatedSkills: Record<string, string[]> = {};
    for (const [category, items] of Object.entries(skills)) {
      if (typeof category === 'string' && items) {
        // Ensure items is an array of strings
        if (Array.isArray(items)) {
          validatedSkills[category] = items.filter(item => typeof item === 'string' && item.trim() !== '');
        } else {
          // If items is not an array, initialize as empty array
          validatedSkills[category] = [];
        }
      }
    }
    
    await setKVData(KV_KEYS.SKILLS, validatedSkills);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating skills:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

