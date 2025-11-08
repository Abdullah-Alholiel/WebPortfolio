export function isRemoteUrl(url?: string | null): boolean {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}

const BLOBS_BASE_CANDIDATES = [
  process.env.NEXT_PUBLIC_BLOB_BASE_URL,
  process.env.BLOB_BASE_URL,
  'https://amdwovffasfq8f6z.public.blob.vercel-storage.com',
].filter(Boolean) as string[];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function getBlobBaseUrl(): string | null {
  const base = BLOBS_BASE_CANDIDATES[0];
  if (!base) {
    return null;
  }
  return base.replace(/\/$/, '');
}

export function stripLeadingSlashes(input: string): string {
  let index = 0;
  while (index < input.length && input[index] === '/') {
    index += 1;
  }
  return input.slice(index);
}

function resolveCandidate(value?: string | null): string | null {
  if (!isNonEmptyString(value)) {
    return null;
  }
  const candidate = value;
  if (isRemoteUrl(candidate)) {
    return normalizeBlobUrl(candidate);
  }
  if (candidate[0] === '/') {
    return candidate;
  }
  const base = getBlobBaseUrl();
  if (!base) {
    return `/${stripLeadingSlashes(candidate)}`;
  }
  return `${base}/${stripLeadingSlashes(candidate)}`;
}

export function resolveImageUrl(options: { url?: string | null; fallback?: string | null }): string | null {
  const { url, fallback } = options;
  return resolveCandidate(url) ?? resolveCandidate(fallback);
}

export function getImageAlt(alt?: string | null, fallback?: string): string {
  if (alt && alt.trim().length > 0) return alt;
  if (fallback) return fallback;
  return 'Portfolio image';
}

export function buildBlobPath(path: string): string {
  const base = getBlobBaseUrl();
  const normalizedPath = stripLeadingSlashes(path);
  if (!base) {
    return `/${normalizedPath}`;
  }
  return `${base}/${normalizedPath}`;
}

export function canonicalBlobPath(value?: string | null): string | undefined {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  if (isRemoteUrl(value)) {
    try {
      const parsed = new URL(value);
      const pathname = stripLeadingSlashes(parsed.pathname);
      if (pathname.startsWith('web-pics/')) {
        return pathname;
      }
      return value;
    } catch {
      return value;
    }
  }

  const trimmed = stripLeadingSlashes(value);
  if (trimmed.startsWith('web-pics/')) {
    return trimmed;
  }

  return value;
}

function normalizeBlobUrl(candidate: string): string {
  try {
    const parsed = new URL(candidate);
    const blobBase = getBlobBaseUrl();
    const normalizedPath = decodeURIComponent(stripLeadingSlashes(parsed.pathname));
    if (!blobBase) {
      return candidate;
    }
    return `${blobBase.replace(/\/$/, '')}/${normalizedPath}`;
  } catch {
    return candidate;
  }
}

export type MediaSourceType = 'blob' | 'fallback' | 'external' | 'unknown';

function normalizeInput(value?: string | null): string {
  if (!isNonEmptyString(value)) {
    return '';
  }
  return value.trim();
}

export function getMediaSourceType(value?: string | null): MediaSourceType {
  const input = normalizeInput(value);
  if (input.length === 0) {
    return 'unknown';
  }

  if (input.startsWith('data:')) {
    return 'external';
  }

  if (isRemoteUrl(input)) {
    try {
      const parsed = new URL(input);
      const host = parsed.host.toLowerCase();
      if (host.endsWith('.blob.vercel-storage.com')) {
        return 'blob';
      }
      const base = getBlobBaseUrl();
      if (base) {
        try {
          const normalizedBase = new URL(base);
          if (host === normalizedBase.host.toLowerCase()) {
            return 'blob';
          }
          const normalizedHref = normalizedBase.href.replace(/\/$/, '');
          if (input.startsWith(`${normalizedHref}/`)) {
            return 'blob';
          }
        } catch {
          if (input.startsWith(`${base.replace(/\/$/, '')}/`)) {
            return 'blob';
          }
        }
      }
    } catch {
      // If URL parsing fails, treat as external
    }
    return 'external';
  }

  if (input.startsWith('/')) {
    return 'fallback';
  }

  const stripped = stripLeadingSlashes(input);
  if (stripped.startsWith('web-pics/')) {
    return 'blob';
  }

  if (!input.includes('://')) {
    return 'fallback';
  }

  return 'external';
}

export function getMediaSourceDescription(source: MediaSourceType): string {
  switch (source) {
    case 'blob':
      return 'Remote Blob';
    case 'fallback':
      return 'Local Fallback';
    case 'external':
      return 'External URL';
    default:
      return 'Not Set';
  }
}


