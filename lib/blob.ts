import { list, put, del, type PutBlobResult, type ListBlobResult } from '@vercel/blob';

const ENV_READ_WRITE_TOKEN = 'BLOB_READ_WRITE_TOKEN';
const ENV_READ_ONLY_TOKEN = 'BLOB_READ_ONLY_TOKEN';
const TOKEN_LOOKUP_REGEX = /_READ_(WRITE|ONLY)_TOKEN$/i;

export const DEFAULT_PREFIX = 'web-pics';

type TokenMode = 'readwrite' | 'readonly';

function resolveEnvToken(mode: TokenMode): string | undefined {
  const preferredKey = mode === 'readwrite' ? ENV_READ_WRITE_TOKEN : ENV_READ_ONLY_TOKEN;
  const direct = process.env[preferredKey];
  if (direct && direct.length > 0) return direct;

  const dynamicKey = Object.keys(process.env).find((key) => {
    if (!TOKEN_LOOKUP_REGEX.test(key)) return false;
    const normalized = key.toLowerCase();
    if (!normalized.includes('blob')) return false;
    if (mode === 'readonly') {
      return normalized.endsWith('_read_only_token');
    }
    return normalized.endsWith('_read_write_token');
  });

  return dynamicKey ? (process.env[dynamicKey] as string) : undefined;
}

function ensureToken(mode: TokenMode): string {
  const token = resolveEnvToken(mode);
  if (!token && mode === 'readonly') {
    return ensureToken('readwrite');
  }
  if (!token) {
    throw new Error(
      'Vercel Blob token not found. Set BLOB_READ_WRITE_TOKEN (and optionally BLOB_READ_ONLY_TOKEN) in your environment.',
    );
  }
  if (mode === 'readonly' && !process.env[ENV_READ_ONLY_TOKEN]) {
    process.env[ENV_READ_ONLY_TOKEN] = token;
  }
  if (mode === 'readwrite' && !process.env[ENV_READ_WRITE_TOKEN]) {
    process.env[ENV_READ_WRITE_TOKEN] = token;
  }
  return token;
}

interface UploadOptions {
  filename: string;
  prefix?: string;
  pathname?: string;
  access?: 'public';
  contentType?: string;
}

function resolveSize(file: Parameters<typeof put>[1]): number | undefined {
  if (typeof file === 'string') {
    return file.length;
  }

  if (file instanceof ArrayBuffer) {
    return file.byteLength;
  }

  if (ArrayBuffer.isView(file)) {
    return file.byteLength;
  }

  if (typeof Blob !== 'undefined' && file instanceof Blob) {
    return file.size;
  }

  if (typeof Buffer !== 'undefined' && file instanceof Buffer) {
    return file.byteLength;
  }

  return undefined;
}

export async function uploadToBlob(
  file: Parameters<typeof put>[1],
  options: UploadOptions,
): Promise<PutBlobResult> {
  const { filename, prefix = DEFAULT_PREFIX, pathname, access = 'public', contentType } = options;
  const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const basePath = prefix.replace(/\/$/, '');
  const targetPath = pathname
    ? pathname.replace(/^\/+/, '')
    : `${basePath}/${Date.now()}-${sanitizedName}`;

  const token = ensureToken('readwrite');

  console.log('🟡 [blob] put()', {
    targetPath,
    access,
    contentType,
    size: resolveSize(file),
  });

  const result = await put(targetPath, file, {
    access,
    contentType,
    token,
  });

  console.log('🟢 [blob] uploaded', { url: result.url, pathname: result.pathname });

  return result;
}

interface ListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string | null;
}

export async function listBlobs(options: ListOptions = {}): Promise<ListBlobResult> {
  const { prefix = DEFAULT_PREFIX, limit = 100, cursor = null } = options;
  const token = ensureToken('readonly');
  return list({ prefix, limit, cursor: cursor ?? undefined, token });
}

export async function deleteBlob(pathOrUrl: string): Promise<void> {
  const token = ensureToken('readwrite');
  await del(pathOrUrl, { token });
}

export async function listAllBlobs(options: Omit<ListOptions, 'limit' | 'cursor'> = {}): Promise<ListBlobResult['blobs']> {
  const { prefix = DEFAULT_PREFIX } = options;
  const token = ensureToken('readonly');
  const blobs: ListBlobResult['blobs'] = [];
  let cursor: string | undefined;

  let attempts = 0;
  do {
    attempts += 1;
    const result = await list({
      prefix,
      limit: 1000,
      cursor,
      token,
    });
    blobs.push(...result.blobs);
    cursor = result.cursor ?? undefined;
    if (cursor && attempts % 10 === 0) {
      console.log(`[blob] Listed ${blobs.length} assets so far (cursor active)`);
    }
  } while (cursor);

  return blobs;
}

export function sanitizePrefix(prefix?: string | null): string {
  if (!prefix) return DEFAULT_PREFIX;
  const cleaned = prefix.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  return cleaned.length > 0 ? cleaned : DEFAULT_PREFIX;
}


