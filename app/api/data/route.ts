import { NextResponse } from 'next/server';
import { getKVData, setKVData, KV_KEYS } from '@/lib/kv';
import { getFallbackData, isUpstashUnavailable } from '@/lib/data-fallback';
import { syncCache } from '@/lib/data-sync';
import { repairPortfolioMedia, type PortfolioDataPayload } from '@/lib/media-repair';

// CRITICAL: Force dynamic rendering - always fetch fresh data from Upstash
// This ensures admin changes appear immediately in production
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable ISR caching - always fetch fresh data

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
      console.warn('Upstash appears unavailable, falling back to cached or static data');
      const fallbackData = await getFallbackData();
      
      // Return fallback data with minimal caching
      return NextResponse.json(fallbackData, {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=0',
          'X-Data-Timestamp': Date.now().toString(),
        },
      });
    }

    // Sanitize data to ensure icons are strings (not React components/objects)
    // This prevents React error #130 when rendering
    const sanitizedExperiences = sanitizeExperiences(experiences);
    const sanitizedAchievements = sanitizeAchievements(achievements);

    // Prepare the Upstash data for response
    const normalizePersonal = (): PortfolioDataPayload['personal'] => {
      if (!personalInfo || typeof personalInfo !== 'object') {
        return null;
      }
      return personalInfo as Record<string, any>;
    };

    const upstashData: PortfolioDataPayload = {
      personal: normalizePersonal(),
      projects: Array.isArray(projects) ? projects : [],
      experiences: sanitizedExperiences,
      skills: skills || {},
      achievements: sanitizedAchievements,
      mentorship: Array.isArray(mentorship) ? mentorship : [],
    };

    const repairResult = await repairPortfolioMedia(upstashData);

    const repairedData = {
      personal: repairResult.personal.data,
      projects: repairResult.projects.data,
      experiences: sanitizedExperiences,
      skills: skills || {},
      achievements: repairResult.achievements.data,
      mentorship: repairResult.mentorship.data,
    };

    const persistOperations: Promise<unknown>[] = [];

    if (repairResult.projects.changed && Array.isArray(projects)) {
      persistOperations.push(setKVData(KV_KEYS.PROJECTS, repairResult.projects.data));
    }
    if (repairResult.achievements.changed && Array.isArray(achievements)) {
      persistOperations.push(setKVData(KV_KEYS.ACHIEVEMENTS, repairResult.achievements.data));
    }
    if (repairResult.mentorship.changed && Array.isArray(mentorship)) {
      persistOperations.push(setKVData(KV_KEYS.MENTORSHIP, repairResult.mentorship.data));
    }
    if (repairResult.personal.changed && personalInfo) {
      persistOperations.push(setKVData(KV_KEYS.PERSONAL_INFO, repairResult.personal.data));
    }

    if (persistOperations.length > 0) {
      Promise.allSettled(persistOperations).catch((error) => {
        console.warn('Failed to persist repaired media references:', error);
      });
    }

    // Sync cache in the background (don't await - non-blocking)
    // This ensures fallback data is always up-to-date with remote database
    syncCache(repairedData).catch((error) => {
      // Silently handle sync errors - caching is optional
      if (process.env.DEBUG_UPSTASH === 'true') {
        console.warn('Cache sync failed (non-critical):', error);
      }
    });

    // Return Upstash data with minimal caching to ensure fresh data
    // Reduced cache time so admin changes appear quickly
    const response = NextResponse.json(repairedData, {
      headers: {
        // Short cache: 10 seconds max, no stale-while-revalidate to ensure freshness
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=0',
        // Add timestamp to help with cache busting
        'X-Data-Timestamp': Date.now().toString(),
      },
    });

    return response;
  } catch (error) {
    console.error('Error fetching data from Upstash:', error);
    
    // Fallback to cached or static data on error
    console.warn('Falling back to cached or static data due to error');
    const fallbackData = await getFallbackData();
    
    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=0',
        'X-Data-Timestamp': Date.now().toString(),
      },
    });
  }
}
