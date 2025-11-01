import { NextResponse } from 'next/server';
import { getKVData, KV_KEYS } from '@/lib/kv';
import { getFallbackData, isUpstashUnavailable } from '@/lib/data-fallback';

// Revalidate every 60 seconds for ISR (Incremental Static Regeneration)
export const revalidate = 60;

/**
 * Sanitizes icon data to ensure it's always a string
 * Prevents React error #130 (Objects are not valid as a React child)
 */
function sanitizeIcon(icon: any): string {
  if (!icon) return 'FaAward'; // default fallback
  
  if (typeof icon === 'string') {
    return icon;
  }
  
  // If it's a React component function, get its name
  if (typeof icon === 'function') {
    return icon.name || 'FaAward';
  }
  
  // If it's a React element object, try to extract component name
  if (typeof icon === 'object' && icon !== null) {
    // Check if it's a React element with type property
    if ('type' in icon && icon.type) {
      const elementType = icon.type;
      if (typeof elementType === 'function') {
        return elementType.name || 'FaAward';
      }
      if (typeof elementType === 'string') {
        return elementType;
      }
    }
    
    // Fallback: try to stringify and extract useful info
    const str = String(icon);
    if (str !== '[object Object]') {
      return str;
    }
  }
  
  return 'FaAward'; // ultimate fallback
}

/**
 * Sanitizes experiences array to ensure all icons are strings
 */
function sanitizeExperiences(experiences: any): any[] {
  if (!experiences || !Array.isArray(experiences)) return [];
  
  return experiences.map(exp => ({
    ...exp,
    icon: sanitizeIcon(exp.icon),
  }));
}

/**
 * Sanitizes achievements array to ensure all Icons are strings
 */
function sanitizeAchievements(achievements: any): any[] {
  if (!achievements || !Array.isArray(achievements)) return [];
  
  return achievements.map(ach => ({
    ...ach,
    Icon: sanitizeIcon(ach.Icon),
  }));
}

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

    // Sanitize data to ensure icons are strings (not React components/objects)
    // This prevents React error #130 when rendering
    const sanitizedExperiences = sanitizeExperiences(experiences);
    const sanitizedAchievements = sanitizeAchievements(achievements);

    // Return Upstash data with cache headers
    const response = NextResponse.json({
      personal: personalInfo,
      projects: projects || [],
      experiences: sanitizedExperiences,
      skills: skills || {},
      achievements: sanitizedAchievements,
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
