import {
  projectsData,
  experiencesData,
  skillsData,
  achievementsData,
  mentorshipData,
} from './data';
import { getCachedData } from './data-sync';

/**
 * Personal info fallback (default values)
 * Note: This is ONLY used as a last resort fallback when Upstash and cache are both unavailable
 */
const defaultPersonalInfo = {
  cvLink: 'https://drive.google.com/file/d/1eD9Z4_MewaOIhF9E1CceTKgTWHmKKe9x/view?usp=sharing',
  introText: "Hey, I'm Abdullah Alholaiel.\nan innovative Data & Digital Strategist,\nConsultant and System Developer\nwith a proven track record in leading digital transformation projects, enhancing operational efficiency, and driving revenue growth across diverse sectors.",
  aboutText: "My background spans Aerospace Engineering and a Master's in Applied Computing, providing me with a unique blend of technical expertise and problem-solving abilities. Leveraging skills in software development, cloud computing, and data analytics, I build and implement solutions that optimize business operations and drive growth. I value collaboration and am eager to tackle complex challenges, learn new skills, and advance technology.",
  contactEmail: 'a.alholaiel@gmail.com',
  linkedInUrl: 'https://www.linkedin.com/in/abdullah-alholaiel-74208a210/',
  githubUrl: 'https://www.github.com/Abdullah-Alholiel',
};

/**
 * Get fallback data with priority:
 * 1. Cached data from last successful Upstash sync (if available)
 * 2. Hardcoded data from data.ts (if cache unavailable)
 */
export async function getFallbackData(): Promise<{
  personal: any;
  projects: any[];
  experiences: any[];
  skills: any;
  achievements: any[];
  mentorship: any[];
}> {
  // Try to get cached data first (synced from Upstash)
  const cachedData = await getCachedData();
  if (cachedData) {
    // Return cached data without syncedAt timestamp
    const { syncedAt, ...data } = cachedData;
    if (process.env.NODE_ENV === 'development') {
      const syncDate = new Date(syncedAt).toLocaleString();
      console.log(`📦 Using cached fallback data (synced at: ${syncDate})`);
    }
    return data;
  }

  // Fall back to hardcoded data if cache is unavailable
  return getHardcodedFallbackData();
}

/**
 * Formats static data from data.ts to match API response structure
 * This is the ultimate fallback when cache is not available
 */
function getHardcodedFallbackData() {
  // Convert icon components to string format for experiences
  // exp.icon is a React element (object) from React.createElement, not a function
  // We need to extract the component name or convert to a serializable format
  const formattedExperiences = experiencesData.map(exp => {
    let iconValue: string = 'FaAward'; // default fallback
    
    if (typeof exp.icon === 'string') {
      // Already a string, use it
      iconValue = exp.icon;
    } else if (exp.icon && typeof exp.icon === 'object' && 'type' in exp.icon) {
      // React element - extract component name from type
      const elementType = (exp.icon as any).type;
      if (typeof elementType === 'function') {
        // Component function - get its name
        iconValue = elementType.name || 'FaAward';
      } else if (elementType && typeof elementType === 'object' && elementType.displayName) {
        // Component with displayName
        iconValue = elementType.displayName;
      } else {
        // Fallback to string conversion
        iconValue = String(elementType || 'FaAward');
      }
    } else if (exp.icon) {
      // Some other type, try to convert
      iconValue = String(exp.icon);
    }
    
    return {
      ...exp,
      icon: iconValue,
    };
  });

  // Format achievements to match API structure
  // ach.Icon is a React component (function), convert to component name string
  const formattedAchievements = achievementsData.map(ach => {
    let iconValue: string = 'FaAward'; // default fallback
    
    if (typeof ach.Icon === 'function') {
      // React component function - get its name
      iconValue = ach.Icon.name || 'FaAward';
    } else if (typeof ach.Icon === 'string') {
      // Already a string, use it
      iconValue = ach.Icon;
    } else if (ach.Icon) {
      // Some other type, try to convert
      iconValue = String(ach.Icon);
    }
    
    return {
      ...ach,
      Icon: iconValue,
    };
  });

  return {
    personal: defaultPersonalInfo,
    projects: [...projectsData],
    experiences: formattedExperiences,
    skills: { ...skillsData },
    achievements: formattedAchievements,
    mentorship: [...mentorshipData],
  };
}

/**
 * Checks if Upstash data is completely unavailable
 * Returns true if all data from Upstash is null/empty
 */
export function isUpstashUnavailable(
  projects: any,
  experiences: any,
  skills: any,
  achievements: any,
  mentorship: any,
  personalInfo: any
): boolean {
  // Check if all critical data sources are null/empty
  const hasNoProjects = !projects || (Array.isArray(projects) && projects.length === 0);
  const hasNoExperiences = !experiences || (Array.isArray(experiences) && experiences.length === 0);
  const hasNoSkills = !skills || (typeof skills === 'object' && Object.keys(skills).length === 0);
  const hasNoAchievements = !achievements || (Array.isArray(achievements) && achievements.length === 0);
  const hasNoMentorship = !mentorship || (Array.isArray(mentorship) && mentorship.length === 0);
  const hasNoPersonal = !personalInfo;

  // If ALL data sources are empty/null, Upstash is likely unavailable
  return hasNoProjects && hasNoExperiences && hasNoSkills && hasNoAchievements && hasNoMentorship && hasNoPersonal;
}

