'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Project {
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
}

export default function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | number | null>(null); // Changed to number | null to track index
  const [formData, setFormData] = useState<Project>({
    title: '',
    description: '',
    tags: [],
    imageUrl: '',
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects');
      const data = await response.json();

      if (response.ok) {
        setProjects(data.data || []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // If editing is a number (index), use PUT to update; otherwise use POST to create
      const isEditing = typeof editing === 'number';
      const response = await fetch('/api/admin/projects', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEditing 
            ? { index: editing, project: formData }
            : formData
        ),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isEditing ? 'Project updated successfully!' : 'Project saved successfully!');
        setEditing(null);
        resetForm();
        loadProjects();
      } else {
        toast.error(data.error || `Failed to ${isEditing ? 'update' : 'save'} project`);
      }
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch('/api/admin/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Project deleted successfully!');
        loadProjects();
      } else {
        toast.error(data.error || 'Failed to delete project');
      }
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleEdit = (project: Project, index: number) => {
    setFormData(project);
    setEditing(index); // Store the index for PUT request
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tags: [],
      imageUrl: '',
    });
    setTagInput('');
    setEditing(null);
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Projects
        </h2>
        <button
          onClick={() => setEditing('new')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Add Project
        </button>
      </div>

      {/* Form */}
      {editing !== null && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editing === 'new' ? 'Add New Project' : typeof editing === 'number' ? 'Edit Project' : 'Add New Project'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Image URL
              </label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="Add tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="hover:text-indigo-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-6 py-2 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(project, index)}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg"
                >
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

