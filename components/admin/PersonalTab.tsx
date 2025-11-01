'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface PersonalInfo {
  cvLink: string;
  introText: string;
  aboutText: string;
  contactEmail: string;
  linkedInUrl: string;
  githubUrl: string;
}

export default function PersonalTab() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    cvLink: '',
    introText: '',
    aboutText: '',
    contactEmail: '',
    linkedInUrl: '',
    githubUrl: '',
  });
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">CV Link</label>
          <input
            type="url"
            value={personalInfo.cvLink}
            onChange={(e) => setPersonalInfo({ ...personalInfo, cvLink: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Introduction Text</label>
          <textarea
            value={personalInfo.introText}
            onChange={(e) => setPersonalInfo({ ...personalInfo, introText: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">About Text</label>
          <textarea
            value={personalInfo.aboutText}
            onChange={(e) => setPersonalInfo({ ...personalInfo, aboutText: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
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
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
          <input
            type="url"
            value={personalInfo.linkedInUrl}
            onChange={(e) => setPersonalInfo({ ...personalInfo, linkedInUrl: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">GitHub URL</label>
          <input
            type="url"
            value={personalInfo.githubUrl}
            onChange={(e) => setPersonalInfo({ ...personalInfo, githubUrl: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
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

