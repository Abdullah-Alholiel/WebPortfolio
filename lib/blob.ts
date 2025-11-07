import { list, put, del, type PutBlobResult, type ListBlobResult } from '@vercel/blob';

const DEFAULT_PREFIX = 'web-pics';

function resolveBlobToken(): string {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }

  const dynamicKey = Object.keys(process.env).find((key) =>
    /_READ_WRITE_TOKEN$/i.test(key) && key.toLowerCase().includes('blob'),
  );

  if (dynamicKey && process.env[dynamicKey]) {
    return process.env[dynamicKey] as string;
  }

  throw new Error('Blob read/write token not found in environment variables.');
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

  const token = resolveBlobToken();

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
  return list({ prefix, limit, cursor: cursor ?? undefined });
}

export async function deleteBlob(pathOrUrl: string): Promise<void> {
  await del(pathOrUrl);
}

export function sanitizePrefix(prefix?: string | null): string {
  if (!prefix) return DEFAULT_PREFIX;
  const cleaned = prefix.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  return cleaned.length > 0 ? cleaned : DEFAULT_PREFIX;
}


