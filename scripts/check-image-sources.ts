import 'dotenv/config';
import { Redis } from '@upstash/redis';
import { projectsData, achievementsData, mentorshipData } from '../lib/data';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

function isRemote(url?: string | null): boolean {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}

type DatasetName = 'projects' | 'achievements' | 'mentorship';

type DatasetRecord = Record<string, unknown>;

interface DatasetConfig {
  key: string;
  fallback: ReadonlyArray<DatasetRecord>;
  primaryField: string;
  fallbackField?: string;
}

const DATASETS: Record<DatasetName, DatasetConfig> = {
  projects: {
    key: 'portfolio:projects',
    fallback: projectsData as ReadonlyArray<DatasetRecord>,
    primaryField: 'imageUrl',
    fallbackField: 'fallbackImageUrl',
  },
  achievements: {
    key: 'portfolio:achievements',
    fallback: achievementsData as ReadonlyArray<DatasetRecord>,
    primaryField: 'certificateUrl',
    fallbackField: 'fallbackCertificateUrl',
  },
  mentorship: {
    key: 'portfolio:mentorship',
    fallback: mentorshipData as ReadonlyArray<DatasetRecord>,
    primaryField: 'imageUrl',
    fallbackField: 'fallbackImageUrl',
  },
};

async function loadDataset(config: DatasetConfig, redis: Redis | null): Promise<DatasetRecord[]> {
  if (redis) {
    try {
      const data = await redis.get<any[]>(config.key);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.warn(`⚠️  Failed to load ${config.key} from Upstash:`, error);
    }
  }
  return [...config.fallback];
}

function summarize(datasetName: DatasetName, records: ReadonlyArray<DatasetRecord>, config: DatasetConfig) {
  const summary = {
    total: records.length,
    remotePrimary: 0,
    localPrimary: 0,
    missingPrimary: 0,
    hasFallback: 0,
  };

  records.forEach((item) => {
    const primaryValue = item?.[config.primaryField];
    const fallbackValue = config.fallbackField ? item?.[config.fallbackField] : undefined;
    const primary = typeof primaryValue === 'string' ? primaryValue : undefined;
    const fallback = typeof fallbackValue === 'string' ? fallbackValue : undefined;

    if (primary && isRemote(primary)) {
      summary.remotePrimary += 1;
    } else if (primary && primary.length > 0) {
      summary.localPrimary += 1;
    } else {
      summary.missingPrimary += 1;
    }

    if (fallback && fallback.length > 0) {
      summary.hasFallback += 1;
    }
  });

  console.log(`\n${datasetName.toUpperCase()}`);
  console.log('='.repeat(datasetName.length));
  console.log(`Total entries      : ${summary.total}`);
  console.log(`Remote primary URL : ${summary.remotePrimary}`);
  console.log(`Local primary URL  : ${summary.localPrimary}`);
  console.log(`Missing primary    : ${summary.missingPrimary}`);
  if (config.fallbackField) {
    console.log(`With fallback      : ${summary.hasFallback}`);
  }
}

async function main() {
  if (!redisUrl || !redisToken) {
    console.warn('⚠️  Upstash credentials not found. Using static fallback data.');
  }

  const redis = redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : null;

  for (const name of Object.keys(DATASETS) as DatasetName[]) {
    const config = DATASETS[name];
    const records = await loadDataset(config, redis);
    summarize(name, records, config);
  }

  console.log('\nℹ️  Remote URLs count entries that already point to Vercel Blob.');
  console.log('    Local URLs refer to /public assets that still act as fallbacks.');
}

main().catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
});


