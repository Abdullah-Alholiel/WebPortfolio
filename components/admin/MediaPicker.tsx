'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import {
  resolveImageUrl,
  getMediaSourceDescription,
  getMediaSourceType,
  type MediaSourceType,
} from '@/lib/image-utils';

interface BlobItem {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

interface MediaPickerProps {
  label: string;
  value?: string;
  fallbackValue?: string;
  onChange: (url: string) => void;
  onFallbackChange?: (fallback: string) => void;
  helperText?: string;
  accept?: string;
  prefix?: string;
}

export default function MediaPicker({
  label,
  value,
  fallbackValue,
  onChange,
  onFallbackChange,
  helperText,
  accept = 'image/*',
  prefix,
}: MediaPickerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mediaItems, setMediaItems] = useState<BlobItem[]>([]);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const normalizedValue = typeof value === 'string' ? value : '';
  const normalizedFallback = typeof fallbackValue === 'string' ? fallbackValue : undefined;
  const trimmedPrimaryValue = normalizedValue.trim();
  const trimmedFallbackValue = normalizedFallback ? normalizedFallback.trim() : '';

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

  const primarySource = useMemo<MediaSourceType>(
    () => getMediaSourceType(trimmedPrimaryValue || undefined),
    [trimmedPrimaryValue],
  );

  const fallbackSource = useMemo<MediaSourceType>(
    () => getMediaSourceType(trimmedFallbackValue || undefined),
    [trimmedFallbackValue],
  );

  const selectedPathname = useMemo(() => {
    if (!normalizedValue) return '';
    const match = mediaItems.find((item) => item.url === normalizedValue || item.pathname === normalizedValue);
    if (match) return match.pathname;
    if (normalizedValue.startsWith('web-pics/')) return normalizedValue;
    if (normalizedValue.startsWith('/')) return '';
    try {
      const parsed = new URL(normalizedValue);
      return parsed.pathname.replace(/^\/+/, '');
    } catch {
      return '';
    }
  }, [normalizedValue, mediaItems]);

  useEffect(() => {
    refreshMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const resolved = resolveImageUrl({ url: normalizedValue, fallback: normalizedFallback });
    setPreviewSrc(resolved);
  }, [normalizedValue, normalizedFallback]);

  const refreshMedia = async () => {
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (prefix) params.set('prefix', prefix);
      const response = await fetch(`/api/admin/media${params.toString() ? `?${params.toString()}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to load media library');
      }
      const data = await response.json();
      setMediaItems(data.blobs || []);
    } catch (error) {
      console.error('Media library refresh failed:', error);
      toast.error('Failed to load media library');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      toast.error('Files larger than 4.5MB need client-side uploads.');
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      if (prefix) {
        formData.append('prefix', prefix);
      }

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Upload failed');
      }

      const blob = await response.json();
      toast.success('File uploaded successfully');
      const nextValue = blob.pathname || blob.url;
      onChange(nextValue);
      await refreshMedia();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      event.target.value = '';
      setIsUploading(false);
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = mediaItems.find((item) => item.pathname === event.target.value);
    if (selected) {
      onChange(selected.pathname);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFileSelect}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
          <button
            type="button"
            onClick={refreshMedia}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg text-sm"
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <select
            value={selectedPathname || ''}
            onChange={handleSelectChange}
            className="flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
          >
            <option value="">Select from library...</option>
            {mediaItems.map((item) => (
              <option key={item.pathname} value={item.pathname}>
                {item.pathname.replace(/^.*\//, '')}
              </option>
            ))}
          </select>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleUpload}
        />

        <input
          type="text"
          value={normalizedValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://... or /public/path.png"
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
        />

        {onFallbackChange && (
          <input
            type="text"
            value={normalizedFallback ?? ''}
            onChange={(event) => onFallbackChange(event.target.value)}
            placeholder="/public fallback path (e.g., /images/photo.png)"
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        )}

        <div className="flex items-start gap-3">
          <div className="relative w-24 h-24 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900">
            {previewSrc ? (
              <Image
                src={previewSrc}
                alt="Selected preview"
                fill
                sizes="96px"
                className="object-cover"
                onError={() => {
                  if (fallbackValue && previewSrc !== fallbackValue) {
                    setPreviewSrc(fallbackValue);
                  } else {
                    setPreviewSrc(null);
                  }
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                No Preview
              </div>
            )}
          </div>
          <div className="flex-1 text-xs text-gray-500 dark:text-gray-400 break-all space-y-1">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-600 dark:text-gray-300">Primary:</span>
              <span className="font-mono text-gray-600 dark:text-gray-400">{trimmedPrimaryValue || '—'}</span>
              {renderSourceBadge(primarySource)}
            </p>
            {onFallbackChange && (
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-600 dark:text-gray-300">Fallback:</span>
                <span className="font-mono text-gray-600 dark:text-gray-400">{trimmedFallbackValue || '—'}</span>
                {renderSourceBadge(fallbackSource)}
              </p>
            )}
          </div>
        </div>

        {helperText && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    </div>
  );
}


