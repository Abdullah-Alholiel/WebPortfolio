'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';
import { useTheme } from '@/context/theme-context';
import MediaPicker from './MediaPicker';

const MEDIA_PREFIX = process.env.NEXT_PUBLIC_BLOB_MEDIA_PREFIX ?? 'web-pics';

// The image the site shows when the record has no profileImageUrl.
// Used to seed the form so the field is never silently absent.
const DEFAULT_PROFILE_IMAGE = 'web-pics/abdullah-ivRTQ4jAdQIopvuw6XH8tlTCUvrxR1.jpg';

interface PersonalInfo {
  cvLink: string;
  introText: string;
  aboutText: string;
  contactEmail: string;
  linkedInUrl: string;
  githubUrl: string;
  profileImageUrl?: string;
}

export default function PersonalTab() {
  const { theme } = useTheme();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    cvLink: '',
    introText: '',
    aboutText: '',
    contactEmail: '',
    linkedInUrl: '',
    githubUrl: '',
    profileImageUrl: '',
  });
  const [loading, setLoading] = useState(true);
  // Latest upload value awaiting a full save (instant-save dedup window)
  const pendingUploadRef = useRef<{ value: string; busy: boolean } | null>(null);
  
  // Theme-aware input styles - force white in light mode
  const inputStyle = theme === 'dark' 
    ? { backgroundColor: '#374151', color: '#ffffff' }
    : { backgroundColor: '#ffffff', color: '#111827', backgroundImage: 'none' };

  useEffect(() => {
    loadPersonalInfo();
  }, []);

  const loadPersonalInfo = async () => {
    try {
      const response = await fetch('/api/admin/personal');
      const data = await response.json();
      if (response.ok && data.data) {
        setPersonalInfo(data.data);
      } else {
        // Seed the image field with the effective default so a later full
        // save always carries an explicit profileImageUrl.
        setPersonalInfo((prev) => ({
          ...prev,
          profileImageUrl: prev.profileImageUrl || DEFAULT_PROFILE_IMAGE,
        }));
      }
    } catch (error) {
      console.error('Error loading personal info:', error);
    } finally {
      setLoading(false);
    }
  };

  // Partial save used after uploads: only the changed field is sent, the
  // API merges server-side, so a stale form can never wipe other fields.
  const saveProfileImage = async (url: string) => {
    const pending = pendingUploadRef.current;
    if (pending?.busy) {
      pending.value = url; // coalesce rapid uploads into one save
      return;
    }
    pendingUploadRef.current = { value: url, busy: true };
    try {
      const response = await fetch('/api/admin/personal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImageUrl: url }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || 'Failed to save profile image');
      }
    } catch (error) {
      toast.error('Failed to save profile image');
    } finally {
      const p = pendingUploadRef.current;
      if (p && p.value === url) {
        pendingUploadRef.current = null;
      } else if (p) {
        const next = p.value;
        pendingUploadRef.current = null;
        void saveProfileImage(next); // save the newer upload that arrived mid-flight
      }
    }
  };

  const handleProfileImageChange = (url: string) => {
    setPersonalInfo((prev) => ({ ...prev, profileImageUrl: url }));
    if (url && url.trim().length > 0) {
      void saveProfileImage(url.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/personal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalInfo),
      });

      if (response.ok) {
        toast.success('Personal info updated!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  if (loading) return <Loader className="w-full py-12" />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        <div>
          <MediaPicker
            label="Profile Image (saves instantly)"
            value={personalInfo.profileImageUrl}
            onChange={handleProfileImageChange}
            helperText="Upload or pick an image and it saves right away — no need to press Save Changes. Save Changes still stores all fields together."
            prefix={MEDIA_PREFIX}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CV Link</label>
          <input
            type="url"
            value={personalInfo.cvLink}
            onChange={(e) => setPersonalInfo({ ...personalInfo, cvLink: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Introduction Text</label>
          <textarea
            value={personalInfo.introText}
            onChange={(e) => setPersonalInfo({ ...personalInfo, introText: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            style={inputStyle}
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">About Text</label>
          <textarea
            value={personalInfo.aboutText}
            onChange={(e) => setPersonalInfo({ ...personalInfo, aboutText: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            style={inputStyle}
            rows={6}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Contact Email</label>
          <input
            type="email"
            value={personalInfo.contactEmail}
            onChange={(e) => setPersonalInfo({ ...personalInfo, contactEmail: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
          <input
            type="url"
            value={personalInfo.linkedInUrl}
            onChange={(e) => setPersonalInfo({ ...personalInfo, linkedInUrl: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">GitHub URL</label>
          <input
            type="url"
            value={personalInfo.githubUrl}
            onChange={(e) => setPersonalInfo({ ...personalInfo, githubUrl: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            style={inputStyle}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

