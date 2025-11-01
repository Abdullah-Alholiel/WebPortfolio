import { getKVData, KV_KEYS } from './kv';
import { projectsData, experiencesData, skillsData, achievementsData, mentorshipData } from './data';

/**
 * Get data from KV with fallback to static data
 * This ensures the site works even if KV is unavailable
 */
export async function getProjects() {
  const data = await getKVData<any[]>(KV_KEYS.PROJECTS);
  return data || projectsData;
}

export async function getExperiences() {
  const data = await getKVData<any[]>(KV_KEYS.EXPERIENCES);
  return data || experiencesData;
}

export async function getSkills() {
  const data = await getKVData<any>(KV_KEYS.SKILLS);
  return data || skillsData;
}

export async function getAchievements() {
  const data = await getKVData<any[]>(KV_KEYS.ACHIEVEMENTS);
  return data || achievementsData;
}

export async function getMentorship() {
  const data = await getKVData<any[]>(KV_KEYS.MENTORSHIP);
  return data || mentorshipData;
}

export async function getPersonalInfo() {
  const data = await getKVData<any>(KV_KEYS.PERSONAL_INFO);
  return data || null;
}

