import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Determine cache file path
// In production (Vercel), filesystem is read-only except /tmp
// In development, use project root
function getCacheFilePath(): string {
  // Check if we're in a read-only environment (like Vercel)
  // Try to write to /tmp if available, otherwise use project root
  if (process.env.VERCEL || process.env.NOW_REGION) {
    // Production: use /tmp directory (writable in serverless environments)
    return path.join(os.tmpdir(), 'portfolio-data-cache.json');
  }
  // Development: use project root
  return path.join(process.cwd(), 'data-cache.json');
}

const CACHE_FILE_PATH = getCacheFilePath();

/**
 * Portfolio data structure for cache
 */
interface CachedPortfolioData {
  personal: any;
  projects: any[];
  experiences: any[];
  skills: any;
  achievements: any[];
  mentorship: any[];
  syncedAt: number; // timestamp of last sync
}

/**
 * Save Upstash data to local cache file
 * This keeps the fallback data in sync with remote database
 */
export async function syncCache(data: {
  personal: any;
  projects: any[];
  experiences: any[];
  skills: any;
  achievements: any[];
  mentorship: any[];
}): Promise<boolean> {
  try {
    const cacheData: CachedPortfolioData = {
      ...data,
      syncedAt: Date.now(),
    };

    // Write to cache file (creates or overwrites)
    await fs.writeFile(
      CACHE_FILE_PATH,
      JSON.stringify(cacheData, null, 2),
      'utf-8'
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Fallback cache synced with Upstash data');
    }

    return true;
  } catch (error) {
    // Don't throw - caching is optional, shouldn't break the app
    console.warn('⚠️  Failed to sync fallback cache:', error);
    return false;
  }
}

/**
 * Get cached data from local file
 * Returns null if cache doesn't exist or is invalid
 */
export async function getCachedData(): Promise<CachedPortfolioData | null> {
  try {
    const fileContent = await fs.readFile(CACHE_FILE_PATH, 'utf-8');
    const cacheData: CachedPortfolioData = JSON.parse(fileContent);

    // Validate cache structure
    if (
      !cacheData.personal ||
      !Array.isArray(cacheData.projects) ||
      !Array.isArray(cacheData.experiences) ||
      !cacheData.skills ||
      !Array.isArray(cacheData.achievements) ||
      !Array.isArray(cacheData.mentorship)
    ) {
      console.warn('⚠️  Cache file structure is invalid, ignoring cache');
      return null;
    }

    return cacheData;
  } catch (error: any) {
    // File doesn't exist or can't be read - that's okay, use hardcoded fallback
    if (error.code !== 'ENOENT') {
      // Only log if it's not a "file not found" error
      console.warn('⚠️  Failed to read cache file:', error.message);
    }
    return null;
  }
}

/**
 * Get sync timestamp from cache
 * Returns null if cache doesn't exist
 */
export async function getLastSyncTime(): Promise<number | null> {
  try {
    const cacheData = await getCachedData();
    return cacheData?.syncedAt || null;
  } catch {
    return null;
  }
}

/**
 * Sync cache with all current Upstash data
 * This is useful after admin updates to ensure cache stays in sync
 */
export async function syncCacheFromUpstash(): Promise<boolean> {
  try {
    const { getKVData, KV_KEYS } = await import('./kv');
    
    // Fetch all data from Upstash
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

    // Check if we have valid data to sync
    if (
      !projects || !experiences || !skills || 
      !achievements || !mentorship || !personalInfo
    ) {
      console.warn('⚠️  Not all Upstash data available for cache sync');
      return false;
    }

    // Sync the cache (ensure arrays are actually arrays)
    return await syncCache({
      personal: personalInfo,
      projects: Array.isArray(projects) ? projects : [],
      experiences: Array.isArray(experiences) ? experiences : [],
      skills: skills || {},
      achievements: Array.isArray(achievements) ? achievements : [],
      mentorship: Array.isArray(mentorship) ? mentorship : [],
    });
  } catch (error) {
    console.warn('⚠️  Failed to sync cache from Upstash:', error);
    return false;
  }
}

