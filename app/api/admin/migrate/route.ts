import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import {
  projectsData,
  experiencesData,
  skillsData,
  achievementsData,
  mentorshipData,
} from '@/lib/data';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function GET() {
  try {
    // Temporarily bypass SSL for corporate networks
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    console.log('Starting migration...');
    
    const personalInfo = {
      cvLink: 'https://drive.google.com/file/d/1eD9Z4_MewaOIhF9E1CceTKgTWHmKKe9x/view?usp=sharing',
      introText: "Hey, I'm Abdullah Alholaiel. an innovative Digital Strategist, Consultant and System Developer with a proven track record in leading digital transformation projects, enhancing operational efficiency, and driving revenue growth across diverse sectors.",
      aboutText: "I'm Abdullah Alholaiel, an innovative Digital Strategist, Consultant and System Developer with a proven track record in leading digital transformation projects, enhancing operational efficiency, and driving revenue growth across diverse sectors. My background spans Aerospace Engineering and a Master's in Applied Computing, providing me with a unique blend of technical expertise and problem-solving abilities. Leveraging skills in software development, cloud computing, and data analytics, I build and implement solutions that optimize business operations and drive growth. I value collaboration and am eager to tackle complex challenges, learn new skills, and advance technology.",
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

    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully!' 
    });
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}