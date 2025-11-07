'use client';

import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Loader from '@/components/ui/loader';

interface BlobItem {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

const MEDIA_PREFIX = process.env.NEXT_PUBLIC_BLOB_MEDIA_PREFIX ?? 'web-pics';

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

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
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
  };

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
    </div>
  );
}


