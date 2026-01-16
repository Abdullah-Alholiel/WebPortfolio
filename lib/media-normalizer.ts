import { buildBlobPath, stripLeadingSlashes, isRemoteUrl, resolveImageUrl } from './image-utils';
import { getProjectFallbackImage } from './project-fallbacks';

type RecordWithMedia = Record<string, any>;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function normalizePrimary(value: any): any {
  if (typeof value !== 'string' || value.length === 0) return value;
  if (isRemoteUrl(value)) {
    return resolveImageUrl({ url: value }) ?? value;
  }

  const trimmed = stripLeadingSlashes(value);
  if (trimmed.startsWith('web-pics/')) {
    return buildBlobPath(trimmed);
  }

  return value;
}

function normalizeFallback(value: any): any {
  if (!isNonEmptyString(value)) return value;
  const normalizedValue: string = value;
  if (isRemoteUrl(normalizedValue)) return normalizedValue;
  if (/^\//.test(normalizedValue)) return normalizedValue;
  return `/${stripLeadingSlashes(normalizedValue)}`;
}

export function normalizeProjectMedia(project: RecordWithMedia) {
  const normalized = { ...project };
  if ('imageUrl' in normalized) {
    normalized.imageUrl = normalizePrimary(normalized.imageUrl);
  }
  if ('fallbackImageUrl' in normalized) {
    normalized.fallbackImageUrl = normalizeFallback(normalized.fallbackImageUrl);
  }
  if ('experienceKey' in normalized && normalized.experienceKey) {
    normalized.experienceKey = String(normalized.experienceKey);
  }
  if (!normalized.fallbackImageUrl) {
    const inferredFallback = getProjectFallbackImage({
      title: normalized.title ?? normalized.name,
      remoteUrl: normalized.imageUrl,
      fallbackCandidate: normalized.fallbackImageUrl,
    });
    if (inferredFallback) {
      normalized.fallbackImageUrl = inferredFallback;
    }
  }
  return normalized;
}

export function normalizeAchievementMedia(achievement: RecordWithMedia) {
  const normalized = { ...achievement };
  if ('imageUrl' in normalized) {
    normalized.imageUrl = normalizePrimary(normalized.imageUrl);
  }
  if ('certificateUrl' in normalized) {
    normalized.certificateUrl = normalizePrimary(normalized.certificateUrl);
  }
  if ('fallbackCertificateUrl' in normalized) {
    normalized.fallbackCertificateUrl = normalizeFallback(normalized.fallbackCertificateUrl);
  }
  return normalized;
}

export function normalizeMentorshipMedia(mentorship: RecordWithMedia) {
  const normalized = { ...mentorship };
  if ('imageUrl' in normalized) {
    normalized.imageUrl = normalizePrimary(normalized.imageUrl);
  }
  if ('certificateUrl' in normalized) {
    normalized.certificateUrl = normalizePrimary(normalized.certificateUrl);
  }
  if ('fallbackImageUrl' in normalized) {
    normalized.fallbackImageUrl = normalizeFallback(normalized.fallbackImageUrl);
  }
  if ('fallbackCertificateUrl' in normalized) {
    normalized.fallbackCertificateUrl = normalizeFallback(normalized.fallbackCertificateUrl);
  }
  return normalized;
}

export function normalizePersonalMedia(personal: RecordWithMedia) {
  const normalized = { ...personal };
  if ('profileImageUrl' in normalized) {
    normalized.profileImageUrl = normalizePrimary(normalized.profileImageUrl);
  }
  return normalized;
}

