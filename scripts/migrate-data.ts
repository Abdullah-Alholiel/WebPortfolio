/**
 * Migration script to populate Upstash Redis with existing data from lib/data.ts
 * 
 * Run this script after setting up Upstash Redis:
 * npx tsx scripts/migrate-data.ts
 */

import { Redis } from '@upstash/redis';

// Handle SSL certificate issues in development mode (same as lib/kv.ts)
if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
  if (process.env.ALLOW_INSECURE_TLS === 'true' || process.env.SKIP_SSL_VERIFY === 'true') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  } else if (process.env.ALLOW_INSECURE_TLS !== 'false') {
    // Auto-disable SSL verification for local development
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});
import {
  projectsData,
  experiencesData,
  skillsData,
  achievementsData,
  mentorshipData,
} from '../lib/data';

async function migrateData() {
  console.log('Starting data migration to Upstash Redis...\n');

  try {
    // Check if Upstash Redis is configured
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.error('❌ UPSTASH_REDIS_REST_TOKEN not found. Please set up Upstash Redis first.');
      process.exit(1);
    }

    // Personal Info (default values)
    const personalInfo = {
      cvLink: 'https://drive.google.com/file/d/1eD9Z4_MewaOIhF9E1CceTKgTWHmKKe9x/view?usp=sharing',
      introText: "Hey, I'm Abdullah Alholaiel. An innovative Digital Strategist, Consultant, and System Developer with a proven track record in leading digital transformation projects, enhancing operational efficiency, and driving revenue growth across diverse sectors.",
      aboutText: "I'm Abdullah Alholaiel, an innovative Digital Strategist, Consultant and System Developer with a proven track record in leading digital transformation projects, enhancing operational efficiency, and driving revenue growth across diverse sectors. My background spans Aerospace Engineering and a Master's in Applied Computing, providing me with a unique blend of technical expertise and problem-solving abilities. Leveraging skills in software development, cloud computing, and data analytics, I build and implement solutions that optimize business operations and drive growth. I value collaboration and am eager to tackle complex challenges, learn new skills, and advance technology.",
      contactEmail: 'a.alholaiel@gmail.com',
      linkedInUrl: 'https://www.linkedin.com/in/abdullah-alholaiel-74208a210/',
      githubUrl: 'https://www.github.com/Abdullah-Alholiel'
    };

    // Migrate each data type
    console.log('📦 Migrating projects...');
    await redis.set('portfolio:projects', projectsData);
    console.log(`  ✓ Migrated ${projectsData.length} projects`);

    console.log('💼 Migrating experiences...');
    await redis.set('portfolio:experiences', experiencesData);
    console.log(`  ✓ Migrated ${experiencesData.length} experiences`);

    console.log('🛠️ Migrating skills...');
    await redis.set('portfolio:skills', skillsData);
    console.log(`  ✓ Migrated ${Object.keys(skillsData).length} skill categories`);

    console.log('🏆 Migrating achievements...');
    await redis.set('portfolio:achievements', achievementsData);
    console.log(`  ✓ Migrated ${achievementsData.length} achievements`);

    console.log('👨‍🏫 Migrating mentorship...');
    await redis.set('portfolio:mentorship', mentorshipData);
    console.log(`  ✓ Migrated ${mentorshipData.length} mentorship items`);

    console.log('👤 Migrating personal info...');
    await redis.set('portfolio:personal_info', personalInfo);
    console.log('  ✓ Migrated personal info');

    console.log('\n✅ Data migration completed successfully!');
    console.log('\nYou can now:');
    console.log('  1. Access your admin panel at /admin');
    console.log('  2. Login with your admin email');
    console.log('  3. Start editing your portfolio content');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();

