'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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
  const [formData, setFormData] = useState<Experience>({
    title: '',
    location: '',
    description: '',
    date: '',
    icon: 'FaAward',
  });

  const iconOptions = [
    { value: 'FaAward', label: 'Award (Default)' },
    { value: 'FaBrain', label: 'Brain' },
    { value: 'CgWorkAlt', label: 'Work' },
    { value: 'FaCloud', label: 'Cloud' },
    { value: 'FaTruck', label: 'Truck' },
    { value: 'FaSitemap', label: 'Sitemap' },
  ];

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
        toast.success('Experience saved!');
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
      icon: exp.icon || 'FaAward',
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
        toast.success('Experience updated!');
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
      icon: 'FaAward',
    });
    setEditing(null);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Experience</h2>
        <button
          onClick={() => setEditing('new')}
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
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Title"
              required
            />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Location"
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
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Date (e.g., 01/2024 - Present)"
              required
            />
            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <select
                value={formData.icon || 'FaAward'}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{exp.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{exp.location}</p>
                <p className="text-sm text-gray-500 mt-2">{exp.date}</p>
                <p className="mt-2">{exp.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(exp, index)} className="text-indigo-600 px-4 py-2 rounded-lg">
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

