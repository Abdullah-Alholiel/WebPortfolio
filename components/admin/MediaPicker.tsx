'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { resolveImageUrl } from '@/lib/image-utils';

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

  const selectedPathname = useMemo(() => {
    if (!value) return '';
    const match = mediaItems.find((item) => item.url === value || item.pathname === value);
    if (match) return match.pathname;
    if (value.startsWith('web-pics/')) return value;
    if (value.startsWith('/')) return '';
    try {
      const parsed = new URL(value);
      return parsed.pathname.replace(/^\/+/, '');
    } catch {
      return '';
    }
  }, [value, mediaItems]);

  useEffect(() => {
    refreshMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const resolved = resolveImageUrl({ url: value, fallback: fallbackValue });
    setPreviewSrc(resolved);
  }, [value, fallbackValue]);

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
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://... or /public/path.png"
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
        />

        {onFallbackChange && (
          <input
            type="text"
            value={fallbackValue || ''}
            onChange={(event) => onFallbackChange(event.target.value)}
            placeholder="/public fallback path (e.g., /images/photo.png)"
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        )}

        {previewSrc && (
          <div className="flex items-center gap-3">
            <div className="relative w-24 h-24 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
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
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
              <p><strong>Primary:</strong> {value || '—'}</p>
              {onFallbackChange && (
                <p><strong>Fallback:</strong> {fallbackValue || '—'}</p>
              )}
            </div>
          </div>
        )}

        {helperText && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    </div>
  );
}


