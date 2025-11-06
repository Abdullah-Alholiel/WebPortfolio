import { NextRequest, NextResponse } from 'next/server';
import { getRedis, getKVData, KV_KEYS } from '@/lib/kv';
import { checkAuth } from '../auth/logout/route';
import {
  projectsData,
  experiencesData,
  skillsData,
  achievementsData,
  mentorshipData,
} from '@/lib/data';

const redis = getRedis();

/**
 * CRITICAL: This route overwrites ALL production data with hardcoded fallback data.
 * It should ONLY be used for initial setup or emergency recovery.
 * 
 * SAFETY FEATURES:
 * 1. BLOCKED IN PRODUCTION - Only works in development
 * 2. Requires authentication
 * 3. Requires explicit confirmation parameter
 * 4. Checks if data already exists and warns
 * 5. Only accepts POST requests (not GET)
 */
export async function POST(request: NextRequest) {
  // CRITICAL: BLOCK IN PRODUCTION - This route should NEVER overwrite production data
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    console.error('🚨 BLOCKED: Migration route is disabled in production to protect data');
    return NextResponse.json({ 
      error: 'Migration route is disabled in production',
      message: 'This route cannot be used in production to prevent accidental data loss. Use the admin panel to edit data instead.',
      note: 'If you need to reset data, use the migrate script locally: npx tsx scripts/migrate-data.ts'
    }, { status: 403 });
  }

  // CRITICAL: Require authentication
  const auth = await checkAuth(request);
  if (!auth.authenticated) {
    console.error('🚨 UNAUTHORIZED migration attempt blocked');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { confirm, force } = body;

    // CRITICAL: Require explicit confirmation
    if (confirm !== 'OVERWRITE_ALL_DATA') {
      return NextResponse.json({ 
        error: 'Migration requires explicit confirmation. Send { confirm: "OVERWRITE_ALL_DATA" } to proceed.',
        warning: 'This operation will overwrite ALL existing data in the database with hardcoded fallback data.'
      }, { status: 400 });
    }

    // Check if data already exists
    const existingProjects = await getKVData<any[]>(KV_KEYS.PROJECTS);
    const existingExperiences = await getKVData<any[]>(KV_KEYS.EXPERIENCES);
    const hasExistingData = (existingProjects && existingProjects.length > 0) || 
                           (existingExperiences && existingExperiences.length > 0);

    if (hasExistingData && force !== 'FORCE_OVERWRITE') {
      console.warn('⚠️  Migration blocked: Existing data detected in database');
      return NextResponse.json({ 
        error: 'Existing data found in database. Migration blocked to prevent data loss.',
        warning: 'If you really want to overwrite existing data, send { confirm: "OVERWRITE_ALL_DATA", force: "FORCE_OVERWRITE" }',
        existingData: {
          hasProjects: !!(existingProjects && existingProjects.length > 0),
          hasExperiences: !!(existingExperiences && existingExperiences.length > 0),
        }
      }, { status: 409 });
    }

    // Log the migration attempt with admin email
    console.warn(`⚠️  MIGRATION STARTED by ${auth.email || 'unknown'} at ${new Date().toISOString()}`);
    console.warn('⚠️  This will OVERWRITE all existing data in the database!');
    
    const personalInfo = {
      cvLink: 'https://drive.google.com/file/d/1eD9Z4_MewaOIhF9E1CceTKgTWHmKKe9x/view?usp=sharing',
      introText: "Hey, I'm Abdullah Alholaiel.\nan innovative Data & Digital Strategist,\nConsultant and System Developer\nwith a proven track record in leading digital transformation projects, enhancing operational efficiency, and driving revenue growth across diverse sectors.",
      aboutText: "My background spans Aerospace Engineering and a Master's in Applied Computing, providing me with a unique blend of technical expertise and problem-solving abilities. Leveraging skills in software development, cloud computing, and data analytics, I build and implement solutions that optimize business operations and drive growth. I value collaboration and am eager to tackle complex challenges, learn new skills, and advance technology.",
      contactEmail: 'a.alholaiel@gmail.com',
      linkedInUrl: 'https://www.linkedin.com/in/abdullah-alholaiel-74208a210/',
      githubUrl: 'https://www.github.com/Abdullah-Alholiel',
    };

    await redis.set('portfolio:projects', projectsData);
    console.log(`✓ Migrated ${projectsData.length} projects`);
    
    await redis.set('portfolio:experiences', experiencesData);
    console.log(`✓ Migrated ${experiencesData.length} experiences`);
    
    await redis.set('portfolio:skills', skillsData);
    console.log(`✓ Migrated ${Object.keys(skillsData).length} skill categories`);
    
    await redis.set('portfolio:achievements', achievementsData);
    console.log(`✓ Migrated ${achievementsData.length} achievements`);
    
    await redis.set('portfolio:mentorship', mentorshipData);
    console.log(`✓ Migrated ${mentorshipData.length} mentorship items`);
    
    await redis.set('portfolio:personal_info', personalInfo);
    console.log('✓ Migrated personal info');

    console.warn(`⚠️  MIGRATION COMPLETED by ${auth.email || 'unknown'} at ${new Date().toISOString()}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully!',
      warning: 'All existing data has been overwritten with hardcoded fallback data.'
    });
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Block GET requests - migration should only be done via POST with explicit confirmation
export async function GET() {
  // Also block GET in production
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      error: 'Migration route is disabled in production',
      message: 'This route cannot be used in production to prevent accidental data loss.'
    }, { status: 403 });
  }
  
  return NextResponse.json({ 
    error: 'Method not allowed',
    message: 'Migration endpoint only accepts POST requests with authentication and explicit confirmation.'
  }, { status: 405 });
}