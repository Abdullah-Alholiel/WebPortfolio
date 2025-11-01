'use client';

import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getIconOptionsForSelect } from '@/lib/icon-utils';
import StandardIcon from '@/components/standard-icon';

interface Achievement {
  title: string;
  description: string;
  Icon?: string;
  certificateUrl: string;
}

export default function AchievementsTab() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | string | null>(null);
  const [iconSearch, setIconSearch] = useState('');
  const [formData, setFormData] = useState<Achievement>({
    title: '',
    description: '',
    Icon: 'FaAward',
    certificateUrl: '',
  });

  // Get all icon options and filter by search
  const iconOptions = useMemo(() => {
    const allOptions = getIconOptionsForSelect();
    if (!iconSearch) return allOptions.slice(0, 100); // Show first 100 by default
    
    const searchLower = iconSearch.toLowerCase();
    return allOptions.filter(opt => 
      opt.value.toLowerCase().includes(searchLower) || 
      opt.label.toLowerCase().includes(searchLower)
    ).slice(0, 100);
  }, [iconSearch]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await fetch('/api/admin/achievements');
      const data = await response.json();
      if (response.ok) {
        setAchievements(data.data || []);
      } else {
        setAchievements([]);
      }
    } catch (error) {
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Achievement saved!');
        setEditing(null);
        resetForm();
        loadAchievements();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof editing !== 'number') return;
    
    try {
      const response = await fetch('/api/admin/achievements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: editing,
          achievement: formData,
        }),
      });

      if (response.ok) {
        toast.success('Achievement updated!');
        setEditing(null);
        resetForm();
        loadAchievements();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update achievement');
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Delete this achievement?')) return;
    try {
      const response = await fetch('/api/admin/achievements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index }),
      });

      if (response.ok) {
        toast.success('Deleted!');
        loadAchievements();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (ach: Achievement, index: number) => {
    setFormData(ach);
    setEditing(index);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', Icon: 'FaAward', certificateUrl: '' });
    setIconSearch('');
    setEditing(null);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <button
          onClick={() => setEditing('new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Achievement
        </button>
      </div>

      {editing !== null && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editing === 'new' ? 'Add Achievement' : typeof editing === 'number' ? 'Edit Achievement' : 'Add Achievement'}
          </h3>
          <form onSubmit={typeof editing === 'number' ? handleUpdate : handleSubmit} className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Title"
              required
            />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Description"
              rows={3}
              required
            />
            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <input
                type="text"
                placeholder="Search icons..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mb-2"
              />
              <select
                value={formData.Icon || 'FaAward'}
                onChange={(e) => setFormData({ ...formData, Icon: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                size={Math.min(iconOptions.length, 10)}
              >
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formData.Icon && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Preview:</span>
                  <StandardIcon icon={formData.Icon} variant="card" />
                </div>
              )}
            </div>
            <input
              type="text"
              value={formData.certificateUrl}
              onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Certificate URL"
              required
            />
            <div className="flex gap-4">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg">
                Save
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-200 dark:bg-gray-700 px-6 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {achievements.map((ach, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{ach.title}</h3>
                <p className="mt-2">{ach.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(ach, index)} className="text-indigo-600 px-4 py-2 rounded-lg">
                  Edit
                </button>
                <button onClick={() => handleDelete(index)} className="text-red-600 px-4 py-2 rounded-lg">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

