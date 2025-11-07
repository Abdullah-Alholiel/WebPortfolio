'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';
import { useTheme } from '@/context/theme-context';
import MediaPicker from './MediaPicker';

const MEDIA_PREFIX = process.env.NEXT_PUBLIC_BLOB_MEDIA_PREFIX ?? 'web-pics';

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
      }
    } catch (error) {
      console.error('Error loading personal info:', error);
    } finally {
      setLoading(false);
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
            label="Profile Image"
            value={personalInfo.profileImageUrl}
            onChange={(url) => setPersonalInfo({ ...personalInfo, profileImageUrl: url })}
            helperText="This image appears on the home section."
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

