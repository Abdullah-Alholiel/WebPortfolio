import 'dotenv/config';

/**
 * Upload all images from the local public/ directory to Vercel Blob Storage
 * while keeping local files as fallbacks.
 *
 * Usage:
 *   npx tsx scripts/upload-images-to-blob.ts
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { uploadToBlob, sanitizePrefix } from '../lib/blob';
import { stripLeadingSlashes } from '../lib/image-utils';
import { list, del } from '@vercel/blob';
import { Redis } from '@upstash/redis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const publicDir = path.join(workspaceRoot, 'public');

const ACCEPTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
const DEFAULT_PREFIX = sanitizePrefix(process.env.BLOB_MEDIA_PREFIX || 'web-pics');
const BLOB_BASE_URL =
  process.env.NEXT_PUBLIC_BLOB_BASE_URL ||
  process.env.BLOB_BASE_URL ||
  'https://amdwovffasfq8f6z.public.blob.vercel-storage.com';

function canonicalUrlFromPath(path: string): string {
  return `${BLOB_BASE_URL.replace(/\/$/, '')}/${stripLeadingSlashes(path)}`;
}

function ensureBlobToken(): string {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }
  const dynamicKey = Object.keys(process.env).find(
    (key) => key.toLowerCase().includes('blob') && key.endsWith('_READ_WRITE_TOKEN'),
  );
  if (dynamicKey && process.env[dynamicKey]) {
    const token = process.env[dynamicKey] as string;
    process.env.BLOB_READ_WRITE_TOKEN = token;
    return token;
  }
  throw new Error('Blob read/write token not found. Set BLOB_READ_WRITE_TOKEN or the Vercel-provided token.');
}

function looksHashed(filename: string): boolean {
  return /-[A-Za-z0-9]{6,}\.[A-Za-z0-9]+$/i.test(filename);
}

function baseKeyFromPath(pathname: string): string {
  const filename = pathname.split('/').pop() || pathname;
  const match = filename.match(/^(.*?)(?:-[A-Za-z0-9]{6,})?\.(png|jpe?g|gif|webp)$/i);
  if (!match) {
    return filename.toLowerCase();
  }
  return `${match[1].toLowerCase()}.${match[2].toLowerCase()}`;
}

async function loadExistingBlobs(prefix: string) {
  const byPath = new Map<string, { url: string; pathname: string }>();
  const byBase = new Map<string, { url: string; pathname: string }>();
  const duplicates: { url: string; pathname: string }[] = [];

  let cursor: string | undefined;
  do {
    const response = await list({ prefix: `${prefix}/`, cursor, limit: 1000 });
    for (const blob of response.blobs) {
      const entry = { url: canonicalUrlFromPath(blob.pathname), pathname: blob.pathname };
      byPath.set(blob.pathname, entry);

      const baseKey = baseKeyFromPath(blob.pathname);
      if (!byBase.has(baseKey)) {
        byBase.set(baseKey, entry);
      } else {
        const existing = byBase.get(baseKey)!;
        const existingHashed = looksHashed(existing.pathname);
        const candidateHashed = looksHashed(blob.pathname);
        if (candidateHashed && !existingHashed) {
          duplicates.push(existing);
          byBase.set(baseKey, entry);
        } else {
          duplicates.push(entry);
        }
      }
    }
    cursor = response.hasMore ? response.cursor : undefined;
  } while (cursor);

  if (duplicates.length > 0) {
    try {
      await del(duplicates.map((d) => d.url));
      console.log(`   • Removed ${duplicates.length} duplicate blob(s)`);
    } catch (error) {
      console.warn('⚠️  Failed to delete duplicate blobs automatically:', error);
    }
    duplicates.forEach(({ pathname }) => byPath.delete(pathname));
  }

  return { byPath, byBase };
}

interface UploadRecord {
  relativePath: string;
  blobUrl: string;
  pathname: string;
  uploaded: boolean;
}

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

async function getLocalImages(dir: string, baseDir: string = dir): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getLocalImages(entryPath, baseDir)));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ACCEPTED_EXTENSIONS.has(ext)) {
        const relative = path.relative(baseDir, entryPath).replace(/\\/g, '/');
        files.push(relative);
      }
    }
  }

  return files;
}

function getContentType(filePath: string): string | undefined {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    default:
      return undefined;
  }
}

async function uploadImages(): Promise<UploadRecord[]> {
  console.log(`🔍 Scanning ${publicDir} for image assets...`);
  const images = await getLocalImages(publicDir);
  console.log(`   • Found ${images.length} image(s)`);

  ensureBlobToken();
  const existing = await loadExistingBlobs(DEFAULT_PREFIX);

  const results: UploadRecord[] = [];

  for (const relativePath of images) {
    const sanitizedRelative = relativePath.replace(/^\/+/, '');
    const blobPath = `${DEFAULT_PREFIX}/${sanitizedRelative}`.replace(/\/{2,}/g, '/');
    const key = baseKeyFromPath(blobPath);

    const existingEntry = existing.byPath.get(blobPath) || existing.byBase.get(key);
    if (existingEntry) {
      console.log(`   ↺ Skipping ${relativePath} (already uploaded as ${existingEntry.pathname})`);
      results.push({
        relativePath,
        blobUrl: existingEntry.url,
        pathname: existingEntry.pathname,
        uploaded: false,
      });
      continue;
    }

    const absolutePath = path.join(publicDir, relativePath);
    const fileBuffer = await fs.readFile(absolutePath);
    const contentType = getContentType(relativePath);
    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength,
    ) as ArrayBuffer;

    console.log(`   ⬆️  Uploading ${relativePath} → ${blobPath}`);
    try {
      const uploaded = await uploadToBlob(arrayBuffer, {
        filename: sanitizedRelative,
        prefix: DEFAULT_PREFIX,
        pathname: blobPath,
        access: 'public',
        contentType,
      });

      const canonicalUrl = canonicalUrlFromPath(uploaded.pathname);
      const entry = { url: canonicalUrl, pathname: uploaded.pathname };
      existing.byPath.set(uploaded.pathname, entry);
      existing.byBase.set(baseKeyFromPath(uploaded.pathname), entry);

      results.push({
        relativePath,
        blobUrl: canonicalUrl,
        pathname: uploaded.pathname,
        uploaded: true,
      });
      console.log(`   ✓ Uploaded ${relativePath}`);
    } catch (error: any) {
      const message = error?.message ?? '';
      if (typeof message === 'string' && message.includes('Blob already exists')) {
        const fallbackEntry = existing.byPath.get(blobPath) || existing.byBase.get(key);
        const blobUrl = fallbackEntry ? fallbackEntry.url : canonicalUrlFromPath(blobPath);
        const pathname = fallbackEntry ? fallbackEntry.pathname : blobPath;
        console.log(`   ↺ Skipping ${relativePath} (already exists)`);
        results.push({
          relativePath,
          blobUrl,
          pathname,
          uploaded: false,
        });
        continue;
      }
      console.error(`   ❌ Failed to upload ${relativePath}:`, error);
      throw error;
    }
  }

  return results;
}

function mapByFilename(records: UploadRecord[]): Record<string, UploadRecord> {
  return records.reduce((acc, record) => {
    const relativeKey = record.relativePath.replace(/^\/+/, '');
    acc[relativeKey] = record;

    const pathname = record.pathname;
    if (pathname) {
      const normalizedPath = stripLeadingSlashes(pathname);
      acc[normalizedPath] = record;
      const filename = normalizedPath.split('/').pop();
      if (filename) {
        acc[filename] = record;
      }
      acc[canonicalUrlFromPath(normalizedPath)] = record;
    }

    if (record.blobUrl) {
      acc[record.blobUrl] = record;
    }

    return acc;
  }, {} as Record<string, UploadRecord>);
}

async function updateDataset<T extends Record<string, any>>(
  key: string,
  recordsByPath: Record<string, UploadRecord>,
  updater: (item: any, record: Record<string, UploadRecord>) => any,
): Promise<number> {
  if (!redis) {
    console.warn('⚠️  Skipping KV update – Upstash credentials are not configured.');
    return 0;
  }

  const existing = (await redis.get<T>(key)) as unknown as any[] | null;
  if (!existing) {
    console.warn(`⚠️  Skipping KV update for ${key} – key not found or empty.`);
    return 0;
  }

  const updatedItems = existing.map((item) => updater(item, recordsByPath));
  await redis.set(key, updatedItems);
  return updatedItems.length;
}

function enhanceProject(project: any, records: Record<string, UploadRecord>) {
  const fallback = typeof project.imageUrl === 'string' ? project.imageUrl.replace(/^\//, '') : '';
  const record = records[fallback];
  if (record) {
    return {
      ...project,
      imageUrl: getBlobUrl(record),
      fallbackImageUrl: `/${fallback}`,
    };
  }
  return project;
}

function enhanceAchievement(achievement: any, records: Record<string, UploadRecord>) {
  const fallback = typeof achievement.certificateUrl === 'string' ? achievement.certificateUrl.replace(/^\//, '') : '';
  const record = records[fallback];
  if (record) {
    return {
      ...achievement,
      certificateUrl: getBlobUrl(record),
      fallbackCertificateUrl: `/${fallback}`,
    };
  }
  return achievement;
}

function enhanceMentorship(item: any, records: Record<string, UploadRecord>) {
  let updated = { ...item };
  if (typeof item.imageUrl === 'string') {
    const fallbackImage = item.imageUrl.replace(/^\//, '');
    const record = records[fallbackImage];
    if (record) {
      updated = {
        ...updated,
        imageUrl: getBlobUrl(record),
        fallbackImageUrl: `/${fallbackImage}`,
      };
    }
  }
  if (typeof item.certificateUrl === 'string') {
    const fallbackCert = item.certificateUrl.replace(/^\//, '');
    const record = records[fallbackCert];
    if (record) {
      updated = {
        ...updated,
        certificateUrl: getBlobUrl(record),
        fallbackCertificateUrl: `/${fallbackCert}`,
      };
    }
  }
  return updated;
}

function getBlobUrl(record: UploadRecord): string {
  if (record.pathname) {
    return canonicalUrlFromPath(record.pathname);
  }
  if (record.blobUrl) {
    try {
      const parsed = new URL(record.blobUrl);
      return canonicalUrlFromPath(parsed.pathname);
    } catch {
      return record.blobUrl;
    }
  }
  if (record.relativePath) {
    return canonicalUrlFromPath(`${DEFAULT_PREFIX}/${stripLeadingSlashes(record.relativePath)}`);
  }
  return canonicalUrlFromPath('web-pics/');
}

async function main() {
  try {
    ensureBlobToken();
    const uploadRecords = await uploadImages();
    const recordsByPath = mapByFilename(uploadRecords);

    const reportPath = path.join(__dirname, 'blob-upload-report.json');
    await fs.writeFile(reportPath, JSON.stringify(uploadRecords, null, 2));
    console.log(`📝 Upload report saved to ${reportPath}`);

    console.log('🔄 Updating Upstash datasets with blob URLs (if available)...');
    const updatedProjects = await updateDataset('portfolio:projects', recordsByPath, enhanceProject);
    const updatedAchievements = await updateDataset('portfolio:achievements', recordsByPath, enhanceAchievement);
    const updatedMentorship = await updateDataset('portfolio:mentorship', recordsByPath, enhanceMentorship);

    console.log(`   • Projects updated: ${updatedProjects}`);
    console.log(`   • Achievements updated: ${updatedAchievements}`);
    console.log(`   • Mentorship updated: ${updatedMentorship}`);

    console.log('\n✅ Upload completed successfully.');
    console.log('   Existing public assets remain available as fallbacks.');
  } catch (error) {
    console.error('\n❌ Upload failed:', error);
    process.exit(1);
  }
}

main();


