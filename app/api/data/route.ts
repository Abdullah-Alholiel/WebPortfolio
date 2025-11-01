import { NextResponse } from 'next/server';
import { getKVData, KV_KEYS } from '@/lib/kv';
import { getFallbackData, isUpstashUnavailable } from '@/lib/data-fallback';

// Revalidate every 60 seconds for ISR (Incremental Static Regeneration)
export const revalidate = 60;

export async function GET() {
  try {
    // Fetch data from Redis - Upstash is the primary source
    const [
      projects,
      experiences,
      skills,
      achievements,
      mentorship,
      personalInfo
    ] = await Promise.all([
      getKVData(KV_KEYS.PROJECTS),
      getKVData(KV_KEYS.EXPERIENCES),
      getKVData(KV_KEYS.SKILLS),
      getKVData(KV_KEYS.ACHIEVEMENTS),
      getKVData(KV_KEYS.MENTORSHIP),
      getKVData(KV_KEYS.PERSONAL_INFO),
    ]);

    // Check if Upstash is completely unavailable
    if (isUpstashUnavailable(projects, experiences, skills, achievements, mentorship, personalInfo)) {
      console.warn('Upstash appears unavailable, falling back to static data.ts');
      const fallbackData = getFallbackData();
      
      // Return fallback data with appropriate cache headers
      return NextResponse.json(fallbackData, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    // Return Upstash data with cache headers
    const response = NextResponse.json({
      personal: personalInfo,
      projects: projects || [],
      experiences: experiences || [],
      skills: skills || {},
      achievements: achievements || [],
      mentorship: mentorship || [],
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });

    return response;
  } catch (error) {
    console.error('Error fetching data from Upstash:', error);
    
    // Fallback to static data on error
    console.warn('Falling back to static data.ts due to error');
    const fallbackData = getFallbackData();
    
    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  }
}
