import 'dotenv/config';

import { KV_KEYS, getKVData, setKVData } from '../lib/kv';
import { repairPortfolioMedia } from '../lib/media-repair';
import { syncCache } from '../lib/data-sync';

type AnyRecord = Record<string, any>;

type PortfolioSnapshot = {
  personal: AnyRecord | null;
  projects: AnyRecord[];
  experiences: AnyRecord[];
  skills: AnyRecord;
  achievements: AnyRecord[];
  mentorship: AnyRecord[];
};

function ensureArray<T = AnyRecord>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null));
}

function diffRecords(
  before: AnyRecord[],
  after: AnyRecord[],
  fields: string[],
  identifier: string,
): string[] {
  const diffs: string[] = [];
  for (let index = 0; index < after.length; index += 1) {
    const previous = before[index];
    const current = after[index];
    if (!previous || !current) continue;
    const label = current[identifier] ?? previous[identifier] ?? `#${index}`;
    for (const field of fields) {
      if (previous[field] !== current[field]) {
        diffs.push(`• ${label}: ${field} → ${current[field] ?? 'null'}`);
      }
    }
  }
  return diffs;
}

async function loadPortfolio(): Promise<PortfolioSnapshot> {
  const [projects, experiences, skills, achievements, mentorship, personal] = await Promise.all([
    getKVData<AnyRecord[]>(KV_KEYS.PROJECTS),
    getKVData<AnyRecord[]>(KV_KEYS.EXPERIENCES),
    getKVData<AnyRecord>(KV_KEYS.SKILLS),
    getKVData<AnyRecord[]>(KV_KEYS.ACHIEVEMENTS),
    getKVData<AnyRecord[]>(KV_KEYS.MENTORSHIP),
    getKVData<AnyRecord>(KV_KEYS.PERSONAL_INFO),
  ]);

  return {
    personal: (personal as AnyRecord) ?? null,
    projects: ensureArray(projects),
    experiences: ensureArray(experiences),
    skills: skills ?? {},
    achievements: ensureArray(achievements),
    mentorship: ensureArray(mentorship),
  };
}

async function persistRepairResults(snapshot: PortfolioSnapshot, repaired: PortfolioSnapshot, changed: {
  personal: boolean;
  projects: boolean;
  achievements: boolean;
  mentorship: boolean;
}): Promise<void> {
  const operations: Promise<unknown>[] = [];

  if (changed.personal && snapshot.personal) {
    operations.push(setKVData(KV_KEYS.PERSONAL_INFO, repaired.personal));
  }
  if (changed.projects) {
    operations.push(setKVData(KV_KEYS.PROJECTS, repaired.projects));
  }
  if (changed.achievements) {
    operations.push(setKVData(KV_KEYS.ACHIEVEMENTS, repaired.achievements));
  }
  if (changed.mentorship) {
    operations.push(setKVData(KV_KEYS.MENTORSHIP, repaired.mentorship));
  }

  if (operations.length > 0) {
    await Promise.all(operations);
  }

  await syncCache(repaired);
}

async function main() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('❌ Upstash credentials missing. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
    process.exit(1);
  }

  console.log('🔧 Repairing portfolio media references...');
  const snapshot = await loadPortfolio();
  const original = {
    personal: clone(snapshot.personal),
    projects: clone(snapshot.projects),
    achievements: clone(snapshot.achievements),
    mentorship: clone(snapshot.mentorship),
  };

  const repairResult = await repairPortfolioMedia(snapshot);

  const repaired: PortfolioSnapshot = {
    personal: repairResult.personal.data,
    projects: repairResult.projects.data,
    experiences: snapshot.experiences,
    skills: snapshot.skills,
    achievements: repairResult.achievements.data,
    mentorship: repairResult.mentorship.data,
  };

  const projectsDiff = diffRecords(original.projects, repaired.projects, ['imageUrl', 'certificateUrl', 'fallbackImageUrl'], 'title');
  const achievementsDiff = diffRecords(original.achievements, repaired.achievements, ['certificateUrl', 'fallbackCertificateUrl'], 'title');
  const mentorshipDiff = diffRecords(original.mentorship, repaired.mentorship, ['imageUrl', 'certificateUrl', 'fallbackImageUrl', 'fallbackCertificateUrl'], 'title');

  const personalChanged = repairResult.personal.changed;
  const projectsChanged = repairResult.projects.changed;
  const achievementsChanged = repairResult.achievements.changed;
  const mentorshipChanged = repairResult.mentorship.changed;

  if (!personalChanged && !projectsChanged && !achievementsChanged && !mentorshipChanged) {
    console.log('✅ No repairs needed. Media references already aligned with blob inventory.');
    return;
  }

  await persistRepairResults(snapshot, repaired, {
    personal: personalChanged,
    projects: projectsChanged,
    achievements: achievementsChanged,
    mentorship: mentorshipChanged,
  });

  console.log('✅ Repair completed.');
  if (personalChanged) {
    console.log('• Updated personal profile media references.');
  }
  if (projectsChanged) {
    console.log(`• Updated ${projectsDiff.length} project field(s).`);
    projectsDiff.forEach((line) => console.log(`   ${line}`));
  }
  if (achievementsChanged) {
    console.log(`• Updated ${achievementsDiff.length} achievement field(s).`);
    achievementsDiff.forEach((line) => console.log(`   ${line}`));
  }
  if (mentorshipChanged) {
    console.log(`• Updated ${mentorshipDiff.length} mentorship field(s).`);
    mentorshipDiff.forEach((line) => console.log(`   ${line}`));
  }
}

main().catch((error) => {
  console.error('❌ Repair failed:', error);
  process.exit(1);
});

