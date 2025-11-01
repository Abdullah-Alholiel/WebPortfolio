import {
  projectsData,
  experiencesData,
  skillsData,
  achievementsData,
  mentorshipData,
} from './data';

/**
 * Personal info fallback (default values)
 */
const defaultPersonalInfo = {
  cvLink: 'https://drive.google.com/file/d/1eD9Z4_MewaOIhF9E1CceTKgTWHmKKe9x/view?usp=sharing',
  introText: "Hey, I'm Abdullah Alholaiel.\nan innovative Data & Digital Strategist,\nConsultant and System Developer\nwith a proven track record in leading digital transformation projects, enhancing operational efficiency, and driving revenue growth across diverse sectors.",
  aboutText: "I'm Abdullah Alholaiel, an innovative Digital Strategist, Consultant and System Developer with a proven track record in leading digital transformation projects, enhancing operational efficiency, and driving revenue growth across diverse sectors. My background spans Aerospace Engineering and a Master's in Applied Computing, providing me with a unique blend of technical expertise and problem-solving abilities. Leveraging skills in software development, cloud computing, and data analytics, I build and implement solutions that optimize business operations and drive growth. I value collaboration and am eager to tackle complex challenges, learn new skills, and advance technology.",
  contactEmail: 'a.alholaiel@gmail.com',
  linkedInUrl: 'https://www.linkedin.com/in/abdullah-alholaiel-74208a210/',
  githubUrl: 'https://www.github.com/Abdullah-Alholiel',
};

/**
 * Formats static data from data.ts to match API response structure
 */
export function getFallbackData() {
  // Convert icon components to string format for experiences
  const formattedExperiences = experiencesData.map(exp => ({
    ...exp,
    icon: typeof exp.icon === 'function' ? exp.icon.toString() : exp.icon,
  }));

  // Format achievements to match API structure
  const formattedAchievements = achievementsData.map(ach => ({
    ...ach,
    Icon: typeof ach.Icon === 'function' ? ach.Icon.toString() : ach.Icon,
  }));

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

