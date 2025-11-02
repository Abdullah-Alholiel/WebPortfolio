'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ProjectsTab from './ProjectsTab';
import ExperienceTab from '../admin/ExperienceTab';
import SkillsTab from '../admin/SkillsTab';
import AchievementsTab from '../admin/AchievementsTab';
import MentorshipTab from '../admin/MentorshipTab';
import PersonalTab from '../admin/PersonalTab';

const tabs = [
  { id: 'projects', name: 'Projects', icon: '📁' },
  { id: 'experience', name: 'Experience', icon: '💼' },
  { id: 'skills', name: 'Skills', icon: '🛠️' },
  { id: 'achievements', name: 'Achievements', icon: '🏆' },
  { id: 'mentorship', name: 'Mentorship', icon: '👨‍🏫' },
  { id: 'personal', name: 'Personal Info', icon: '👤' },
];

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState('projects');
  const router = useRouter();
  
  // Get portfolio URL - use current window location (same server) or production URL
  const getPortfolioUrl = () => {
    if (typeof window !== 'undefined') {
      // Client-side: use current window location (same server, any port)
      // This works for both localhost with any port and production
      return window.location.origin + '/';
    }
    // Server-side: use NEXT_PUBLIC_BASE_URL or fallback to root
    return process.env.NEXT_PUBLIC_BASE_URL || '/';
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/admin/login');
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      toast.error('Failed to logout');
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Portfolio Admin
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={getPortfolioUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View Portfolio
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition
                  ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'experience' && <ExperienceTab />}
        {activeTab === 'skills' && <SkillsTab />}
        {activeTab === 'achievements' && <AchievementsTab />}
        {activeTab === 'mentorship' && <MentorshipTab />}
        {activeTab === 'personal' && <PersonalTab />}
      </main>
    </div>
  );
}

