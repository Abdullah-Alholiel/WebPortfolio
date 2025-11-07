export function isRemoteUrl(url?: string | null): url is string {
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
    let blobHost: string | null = null;

    if (blobBase) {
      try {
        blobHost = new URL(blobBase).host;
      } catch {
        blobHost = null;
      }
    }

    const isBlobHost = blobHost
      ? parsed.host === blobHost
      : parsed.hostname.endsWith('.blob.vercel-storage.com');

    if (!isBlobHost) {
      return candidate;
    }

    const decodedPathname = decodeURIComponent(stripLeadingSlashes(parsed.pathname));
    const segments = decodedPathname.split('/');
    if (segments.length === 0) {
      return candidate;
    }

    const filename = segments[segments.length - 1];
    const hashedMatch = filename.match(/^(.*?)-([A-Za-z0-9]{6,})(\.[A-Za-z0-9]+)$/);
    if (!hashedMatch) {
      return candidate;
    }

    const sanitizedFilename = `${hashedMatch[1]}${hashedMatch[3]}`;
    if (sanitizedFilename.length === 0) {
      return candidate;
    }

    // Prefer serving from local fallback when hashed blob entries are referenced.
    // This avoids 404 responses when temporary blob URLs expire or are deleted.
    return `/${sanitizedFilename}`;
  } catch {
    return candidate;
  }
}


