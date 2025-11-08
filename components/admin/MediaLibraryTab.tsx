'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Loader from '@/components/ui/loader';
import { getMediaSourceDescription, getMediaSourceType, type MediaSourceType } from '@/lib/image-utils';

interface BlobItem {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

const MEDIA_PREFIX = process.env.NEXT_PUBLIC_BLOB_MEDIA_PREFIX ?? 'web-pics';

type PortfolioMediaEntry = {
  id: string;
  section: string;
  name: string;
  collection: 'personal' | 'projects' | 'achievements' | 'mentorship';
  index?: number;
  primaryField: string;
  fallbackField?: string;
  primaryInput: string;
  fallbackInput?: string;
  originalRecord: any;
  dirty: boolean;
};

function decodePathComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeCandidate(value?: string | null): string {
  if (!value) return '';
  let candidate = value.trim();
  if (candidate.length === 0) return '';
  if (/^https?:\/\//i.test(candidate)) {
    try {
      const parsed = new URL(candidate);
      candidate = parsed.pathname;
    } catch {
      // ignore
    }
  }
  candidate = decodePathComponent(candidate.replace(/^\/+/, ''));
  if (candidate.startsWith(`${MEDIA_PREFIX}/`)) {
    candidate = candidate.slice(MEDIA_PREFIX.length + 1);
  } else if (candidate.startsWith('web-pics/')) {
    candidate = candidate.slice('web-pics/'.length);
  }
  return candidate;
}

function toBlobKey(value?: string | null): string {
  const normalized = normalizeCandidate(value);
  if (!normalized) return '';
  const lower = normalized.toLowerCase();
  const dotIndex = lower.lastIndexOf('.');
  if (dotIndex <= 0 || dotIndex === lower.length - 1) {
    return lower;
  }
  const namePart = lower.slice(0, dotIndex);
  const extension = lower.slice(dotIndex);
  const suffixMatch = namePart.match(/-([a-z0-9]{6,})$/i);
  if (suffixMatch) {
    return `${namePart.slice(0, -suffixMatch[0].length)}${extension}`;
  }
  return `${namePart}${extension}`;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export default function MediaLibraryTab() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<BlobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [portfolioUsage, setPortfolioUsage] = useState<PortfolioMediaEntry[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [savingUsageId, setSavingUsageId] = useState<string | null>(null);

  const blobIndex = useMemo(() => {
    const map = new Map<string, BlobItem>();
    items.forEach((item) => {
      const key = toBlobKey(item.pathname);
      if (key) {
        map.set(key, item);
      }
    });
    return map;
  }, [items]);

  const mediaSourceClassNames = useMemo<Record<MediaSourceType, string>>(
    () => ({
      blob: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200',
      fallback: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200',
      external: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200',
      unknown: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    }),
    [],
  );

  const renderSourceBadge = useCallback(
    (source: MediaSourceType) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${mediaSourceClassNames[source]}`}
      >
        {getMediaSourceDescription(source)}
      </span>
    ),
    [mediaSourceClassNames],
  );

  const classifyMedia = useCallback((value?: string | null) => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    return {
      value: trimmed,
      source: getMediaSourceType(trimmed || undefined),
    };
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/admin/media?prefix=${MEDIA_PREFIX}`);
      if (!response.ok) {
        throw new Error('Failed to load media library');
      }
      const data = await response.json();
      setItems(data.blobs || []);
    } catch (error) {
      console.error('Failed to refresh media library:', error);
      toast.error('Unable to load media items');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const loadPortfolioUsage = useCallback(async () => {
    setLoadingUsage(true);
    try {
      const response = await fetch('/api/data', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to load portfolio data');
      }
      const data = await response.json();

      const entries: PortfolioMediaEntry[] = [];

      if (data?.personal && typeof data.personal === 'object') {
        const personal = data.personal as Record<string, any>;
        const personalClone = JSON.parse(JSON.stringify(personal));

        entries.push({
          id: 'personal-profile-image',
          section: 'Personal',
          name: 'Profile Image',
          collection: 'personal',
          primaryField: 'profileImageUrl',
          primaryInput: typeof personal.profileImageUrl === 'string' ? personal.profileImageUrl : '',
          originalRecord: personalClone,
          dirty: false,
        });

        entries.push({
          id: 'personal-cv-link',
          section: 'Personal',
          name: 'CV / Resume',
          collection: 'personal',
          primaryField: 'cvLink',
          primaryInput: typeof personal.cvLink === 'string' ? personal.cvLink : '',
          originalRecord: personalClone,
          dirty: false,
        });
      }

      if (Array.isArray(data?.projects)) {
        data.projects.forEach((project: any, index: number) => {
          const title = project?.title || `Project #${index + 1}`;
          const projectClone = JSON.parse(JSON.stringify(project));

          entries.push({
            id: `project-${index}-image`,
            section: 'Projects',
            name: `${title} (Image)`,
            collection: 'projects',
            index,
            primaryField: 'imageUrl',
            fallbackField: 'fallbackImageUrl',
            primaryInput: typeof project?.imageUrl === 'string' ? project.imageUrl : '',
            fallbackInput: typeof project?.fallbackImageUrl === 'string' ? project.fallbackImageUrl : '',
            originalRecord: projectClone,
            dirty: false,
          });
        });
      }

      if (Array.isArray(data?.achievements)) {
        data.achievements.forEach((achievement: any, index: number) => {
          const title = achievement?.title || `Achievement #${index + 1}`;
          const achievementClone = JSON.parse(JSON.stringify(achievement));

          entries.push({
            id: `achievement-${index}-certificate`,
            section: 'Achievements',
            name: `${title} (Certificate)`,
            collection: 'achievements',
            index,
            primaryField: 'certificateUrl',
            fallbackField: 'fallbackCertificateUrl',
            primaryInput: typeof achievement?.certificateUrl === 'string' ? achievement.certificateUrl : '',
            fallbackInput:
              typeof achievement?.fallbackCertificateUrl === 'string' ? achievement.fallbackCertificateUrl : '',
            originalRecord: achievementClone,
            dirty: false,
          });
        });
      }

      if (Array.isArray(data?.mentorship)) {
        data.mentorship.forEach((item: any, index: number) => {
          const title = item?.title || `Mentorship #${index + 1}`;
          const mentorshipClone = JSON.parse(JSON.stringify(item));

          entries.push({
            id: `mentorship-${index}-image`,
            section: 'Mentorship',
            name: `${title} (Image)`,
            collection: 'mentorship',
            index,
            primaryField: 'imageUrl',
            fallbackField: 'fallbackImageUrl',
            primaryInput: typeof item?.imageUrl === 'string' ? item.imageUrl : '',
            fallbackInput: typeof item?.fallbackImageUrl === 'string' ? item.fallbackImageUrl : '',
            originalRecord: mentorshipClone,
            dirty: false,
          });

          entries.push({
            id: `mentorship-${index}-certificate`,
            section: 'Mentorship',
            name: `${title} (Certificate)`,
            collection: 'mentorship',
            index,
            primaryField: 'certificateUrl',
            fallbackField: 'fallbackCertificateUrl',
            primaryInput: typeof item?.certificateUrl === 'string' ? item.certificateUrl : '',
            fallbackInput:
              typeof item?.fallbackCertificateUrl === 'string' ? item.fallbackCertificateUrl : '',
            originalRecord: mentorshipClone,
            dirty: false,
          });
        });
      }

      setPortfolioUsage(entries);
    } catch (error) {
      console.error('Failed to load portfolio media usage:', error);
      toast.error('Failed to load portfolio media usage');
    } finally {
      setLoadingUsage(false);
    }
  }, [classifyMedia]);

  const handleUsageInputChange = useCallback((id: string, type: 'primary' | 'fallback', value: string) => {
    setPortfolioUsage((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        return {
          ...entry,
          primaryInput: type === 'primary' ? value : entry.primaryInput,
          fallbackInput: type === 'fallback' ? value : entry.fallbackInput,
          dirty: true,
        };
      }),
    );
  }, []);

  const handleSaveUsageEntry = useCallback(
    async (entry: PortfolioMediaEntry) => {
      if (!entry.primaryField) return;

      const trimmedPrimary = entry.primaryInput.trim();
      const trimmedFallback = entry.fallbackField ? (entry.fallbackInput ?? '').trim() : undefined;

      const payload = { ...entry.originalRecord };
      const primaryKey = toBlobKey(trimmedPrimary);
      const primaryMatch = primaryKey ? blobIndex.get(primaryKey) : undefined;
      payload[entry.primaryField] = primaryMatch ? primaryMatch.pathname : trimmedPrimary;
      if (entry.fallbackField) {
        const fallbackKey = toBlobKey(trimmedFallback);
        const fallbackMatch = fallbackKey ? blobIndex.get(fallbackKey) : undefined;
        payload[entry.fallbackField] = fallbackMatch ? fallbackMatch.pathname : trimmedFallback ?? '';
      }

      setSavingUsageId(entry.id);

      try {
        let endpoint = '';
        let method = 'PUT';
        let body: any = payload;

        switch (entry.collection) {
          case 'projects':
            endpoint = '/api/admin/projects';
            body = { index: entry.index, project: payload };
            break;
          case 'achievements':
            endpoint = '/api/admin/achievements';
            body = { index: entry.index, achievement: payload };
            break;
          case 'mentorship':
            endpoint = '/api/admin/mentorship';
            body = { index: entry.index, mentorship: payload };
            break;
          case 'personal':
            endpoint = '/api/admin/personal';
            method = 'PUT';
            body = payload;
            break;
          default:
            throw new Error('Unsupported collection type');
        }

        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to update media entry');
        }

        const successMessage = primaryMatch ? 'Media source linked to blob' : 'Media source updated';
        toast.success(successMessage);
        await loadPortfolioUsage();
      } catch (error) {
        console.error('Failed to save media entry:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to update media source');
      } finally {
        setSavingUsageId(null);
      }
    },
    [blobIndex, loadPortfolioUsage],
  );

  useEffect(() => {
    refresh();
    loadPortfolioUsage();
  }, [refresh, loadPortfolioUsage]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      toast.error('Files larger than 4.5MB require client-side uploads.');
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      formData.append('prefix', MEDIA_PREFIX);

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Upload failed');
      }

      toast.success('File uploaded');
      await refresh();
      await loadPortfolioUsage();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      event.target.value = '';
      setIsUploading(false);
    }
  };

  const handleDelete = async (item: BlobItem) => {
    if (!confirm(`Delete ${item.pathname}?`)) return;
    try {
      const response = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname: item.pathname }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Delete failed');
      }

      toast.success('Deleted');
      setItems((prev) => prev.filter((blob) => blob.pathname !== item.pathname));
      await loadPortfolioUsage();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  if (loading) {
    return <Loader className="w-full py-12" label="Loading media library" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Media Library</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage images stored in Vercel Blob. These assets power your portfolio visuals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-sm"
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleUploadClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload New'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center text-gray-500 dark:text-gray-400">
          No media assets yet. Upload an image to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.pathname}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 overflow-hidden">
                <Image
                  src={item.url}
                  alt={item.pathname}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  onError={() => toast.error(`Preview failed for ${item.pathname}`)}
                />
                <div className="absolute top-2 left-2">
                  {renderSourceBadge(getMediaSourceType(item.url || item.pathname))}
                </div>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="font-medium text-gray-900 dark:text-gray-100 break-all">
                  {item.pathname.replace(`${MEDIA_PREFIX}/`, '')}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Size: {formatBytes(item.size)}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Uploaded: {new Date(item.uploadedAt).toLocaleString()}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-xs font-medium"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-red-600 hover:text-red-700 text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Portfolio Media Usage</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Track which assets rely on remote blobs versus local fallbacks.
            </p>
          </div>
          <button
            onClick={loadPortfolioUsage}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-sm"
            disabled={loadingUsage}
          >
            {loadingUsage ? 'Refreshing...' : 'Refresh Usage'}
          </button>
        </div>
        <div className="overflow-x-auto">
          {loadingUsage ? (
            <Loader className="w-full py-8" label="Loading portfolio media usage" />
          ) : portfolioUsage.length === 0 ? (
            <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
              No portfolio media references found. Add assets to see their status here.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
                    Section
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
                    Asset
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
                    Primary Source
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
                    Fallback Source
                  </th>
                  <th scope="col" className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {portfolioUsage.map((entry) => {
                  const primaryInfo = classifyMedia(entry.primaryInput);
                  const fallbackInfo = classifyMedia(entry.fallbackInput);
                  return (
                    <tr key={entry.id} className="bg-white dark:bg-gray-800">
                    <td className="px-4 py-3 align-top text-gray-900 dark:text-gray-100">{entry.section}</td>
                    <td className="px-4 py-3 align-top text-gray-700 dark:text-gray-300">{entry.name}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-1">
                        <input
                          value={entry.primaryInput}
                          onChange={(event) => handleUsageInputChange(entry.id, 'primary', event.target.value)}
                          placeholder="https://... or /public/path"
                          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        />
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400 break-all">
                            {primaryInfo.value || '—'}
                          </span>
                          {renderSourceBadge(primaryInfo.source)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {entry.fallbackField ? (
                        <div className="space-y-1">
                          <input
                            value={entry.fallbackInput ?? ''}
                            onChange={(event) => handleUsageInputChange(entry.id, 'fallback', event.target.value)}
                            placeholder="/public/path.png"
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                          />
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400 break-all">
                              {fallbackInfo.value || '—'}
                            </span>
                            {renderSourceBadge(fallbackInfo.source)}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          —
                          {renderSourceBadge('unknown')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setPortfolioUsage((prev) =>
                              prev.map((item) =>
                                item.id === entry.id
                                  ? {
                                      ...item,
                                      primaryInput: typeof item.originalRecord[item.primaryField] === 'string'
                                        ? item.originalRecord[item.primaryField]
                                        : '',
                                      fallbackInput: item.fallbackField
                                        ? typeof item.originalRecord[item.fallbackField] === 'string'
                                          ? item.originalRecord[item.fallbackField]
                                          : ''
                                        : item.fallbackInput,
                                      dirty: false,
                                    }
                                  : item,
                              ),
                            )
                          }
                          className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                          disabled={!entry.dirty || savingUsageId === entry.id}
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => handleSaveUsageEntry(entry)}
                          className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!entry.dirty || savingUsageId === entry.id}
                        >
                          {savingUsageId === entry.id ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


