'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Mentorship {
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  certificateUrl: string;
}

export default function MentorshipTab() {
  const [mentorship, setMentorship] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | string | null>(null);
  const [formData, setFormData] = useState<Mentorship>({
    title: '',
    description: '',
    icon: '',
    imageUrl: '',
    certificateUrl: '',
  });

  useEffect(() => {
    loadMentorship();
  }, []);

  const loadMentorship = async () => {
    try {
      const response = await fetch('/api/admin/mentorship');
      const data = await response.json();
      if (response.ok) {
        setMentorship(data.data || []);
      } else {
        setMentorship([]);
      }
    } catch (error) {
      setMentorship([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/mentorship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Mentorship saved!');
        setEditing(null);
        resetForm();
        loadMentorship();
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
      const response = await fetch('/api/admin/mentorship', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: editing,
          mentorship: formData,
        }),
      });

      if (response.ok) {
        toast.success('Mentorship updated!');
        setEditing(null);
        resetForm();
        loadMentorship();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update mentorship');
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Delete this mentorship?')) return;
    try {
      const response = await fetch('/api/admin/mentorship', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index }),
      });

      if (response.ok) {
        toast.success('Deleted!');
        loadMentorship();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = (m: Mentorship, index: number) => {
    setFormData(m);
    setEditing(index);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: '',
      imageUrl: '',
      certificateUrl: '',
    });
    setEditing(null);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mentorship</h2>
        <button
          onClick={() => setEditing('new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Mentorship
        </button>
      </div>

      {editing !== null && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editing === 'new' ? 'Add Mentorship' : typeof editing === 'number' ? 'Edit Mentorship' : 'Add Mentorship'}
          </h3>
          <form onSubmit={typeof editing === 'number' ? handleUpdate : handleSubmit} className="space-y-4">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Title"
              required
            />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Description"
              rows={3}
              required
            />
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Icon emoji (e.g., 🧠)"
            />
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Image URL"
            />
            <input
              type="text"
              value={formData.certificateUrl}
              onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Certificate URL"
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
        {mentorship.map((m, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{m.icon} {m.title}</h3>
                <p className="mt-2">{m.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(m, index)} className="text-indigo-600 px-4 py-2 rounded-lg">
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

