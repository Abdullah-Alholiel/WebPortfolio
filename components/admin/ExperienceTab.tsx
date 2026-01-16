'use client';

import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getIconOptionsForSelect } from '@/lib/icon-utils';
import StandardIcon from '@/components/standard-icon';
import Loader from '@/components/ui/loader';

interface Experience {
  title: string;
  location: string;
  description: string;
  date: string;
  icon?: string;
}

export default function ExperienceTab() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | string | null>(null);
  const [iconSearch, setIconSearch] = useState('');
  const [formData, setFormData] = useState<Experience>({
    title: '',
    location: '',
    description: '',
    date: '',
    icon: 'FaBriefcase',
  });

  const iconOptions = useMemo(() => {
    const allOptions = getIconOptionsForSelect('experience');
    if (!iconSearch) return allOptions;

    const searchLower = iconSearch.toLowerCase();
    return allOptions.filter(opt =>
      opt.value.toLowerCase().includes(searchLower) ||
      opt.label.toLowerCase().includes(searchLower)
    );
  }, [iconSearch]);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const response = await fetch('/api/admin/experience');
      const data = await response.json();
      if (response.ok) {
        setExperiences(data.data || []);
      } else {
        setExperiences([]);
      }
    } catch (error) {
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Experience saved! (Auto-sorted by date)');
        setEditing(null);
        resetForm();
        loadExperiences();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save experience');
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Delete this experience?')) return;
    try {
      const response = await fetch('/api/admin/experience', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index }),
      });

      if (response.ok) {
        toast.success('Deleted!');
        loadExperiences();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (exp: Experience, index: number) => {
    setFormData({
      ...exp,
      icon: exp.icon || 'FaBriefcase',
    });
    setEditing(index);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof editing !== 'number') return;

    try {
      const response = await fetch('/api/admin/experience', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: editing,
          experience: formData,
        }),
      });

      if (response.ok) {
        toast.success('Experience updated! (Auto-sorted by date)');
        setEditing(null);
        resetForm();
        loadExperiences();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update experience');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      location: '',
      description: '',
      date: '',
      icon: 'FaBriefcase',
    });
    setIconSearch('');
    setEditing(null);
  };

  if (loading) return <Loader className="w-full py-12" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Experience</h2>
          <p className="text-sm text-gray-500 mt-1">Experiences are automatically sorted by date (newest first)</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditing('new');
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Experience
        </button>
      </div>

      {editing !== null && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editing === 'new' ? 'Add Experience' : typeof editing === 'number' ? 'Edit Experience' : 'Add Experience'}
          </h3>
          <form onSubmit={typeof editing === 'number' ? handleUpdate : handleSubmit} className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              placeholder="Title"
              required
            />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              placeholder="Location"
              required
            />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              placeholder="Description"
              rows={3}
              required
            />
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              placeholder="Date (e.g., 06/2025 - Present)"
              required
            />
            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <input
                type="text"
                placeholder="Search icons..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white mb-2"
              />
              <select
                value={formData.icon || 'FaBriefcase'}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                size={Math.min(iconOptions.length, 15)}
              >
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formData.icon && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Preview:</span>
                  <StandardIcon icon={formData.icon} size="2xl" />
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
              >
                Save
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 dark:bg-gray-700 px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 font-semibold mb-2">
                  {index + 1}
                </span>
                <h3 className="text-xl font-semibold">{exp.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{exp.location}</p>
                <p className="text-sm text-gray-500 mt-2">{exp.date}</p>
                <p className="mt-2">{exp.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(exp, index)} className="text-indigo-600 hover:text-indigo-700 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-900">
                  Edit
                </button>
                <button onClick={() => handleDelete(index)} className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900">
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
