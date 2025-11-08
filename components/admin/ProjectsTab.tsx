'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';
import MediaPicker from './MediaPicker';

const MEDIA_PREFIX = process.env.NEXT_PUBLIC_BLOB_MEDIA_PREFIX ?? 'web-pics';

interface Project {
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  fallbackImageUrl?: string;
}

export default function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | number | null>(null); // Changed to number | null to track index
  const [reordering, setReordering] = useState(false);
  const [formData, setFormData] = useState<Project>({
    title: '',
    description: '',
    tags: [],
    imageUrl: '',
    fallbackImageUrl: '',
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/projects', {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
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
      const sanitizedPayload = {
        ...formData,
        imageUrl: (formData.imageUrl || '').trim(),
        fallbackImageUrl: (formData.fallbackImageUrl || '').trim(),
      };
      const response = await fetch('/api/admin/projects', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEditing 
            ? { index: editing, project: sanitizedPayload }
            : sanitizedPayload
        ),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isEditing ? 'Project updated successfully!' : 'Project saved successfully!');
        setEditing(null);
        resetForm();
        await loadProjects();
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
    setFormData({
      ...project,
      fallbackImageUrl:
        project.fallbackImageUrl || (project.imageUrl?.startsWith('/') ? project.imageUrl : project.fallbackImageUrl) || '',
    });
    setEditing(index); // Store the index for PUT request
  };

  const persistOrder = async (updatedProjects: Project[]) => {
    try {
      setReordering(true);
      const response = await fetch('/api/admin/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: updatedProjects }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reorder projects');
      }

      toast.success('Project order updated!');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to reorder projects';
      toast.error(message);
      throw error instanceof Error ? error : new Error(message);
    } finally {
      setReordering(false);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (reordering) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= projects.length) {
      return;
    }

    const previousProjects = [...projects];
    const updatedProjects = [...projects];
    const [movedProject] = updatedProjects.splice(index, 1);
    updatedProjects.splice(newIndex, 0, movedProject);
    setProjects(updatedProjects);

    let editingChanged = false;
    let nextEditing = editing;

    if (typeof editing === 'number') {
      if (editing === index) {
        nextEditing = newIndex;
      } else if (newIndex < index && editing >= newIndex && editing < index) {
        nextEditing = editing + 1;
      } else if (newIndex > index && editing > index && editing <= newIndex) {
        nextEditing = editing - 1;
      }

      if (nextEditing !== editing) {
        editingChanged = true;
        setEditing(nextEditing);
      }
    }

    persistOrder(updatedProjects).catch(() => {
      setProjects(previousProjects);
      if (editingChanged) {
        setEditing(editing);
      }
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tags: [],
      imageUrl: '',
      fallbackImageUrl: '',
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
    return <Loader className="w-full py-12" />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Projects
        </h2>
        <button
          onClick={() => {
            setFormData({
              title: '',
              description: '',
              tags: [],
              imageUrl: '',
              fallbackImageUrl: '',
            });
            setTagInput('');
            setEditing('new');
          }}
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
            <MediaPicker
              label="Project Image"
              value={formData.imageUrl}
              fallbackValue={formData.fallbackImageUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              onFallbackChange={(fallback) =>
                setFormData((prev) => ({ ...prev, fallbackImageUrl: fallback }))
              }
              helperText="Use the media library to upload images. Provide a /public fallback for reliability."
              prefix={MEDIA_PREFIX}
            />
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
            <div className="flex justify-between items-start mb-4 gap-4">
              <div className="flex-1">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 font-semibold mb-2">
                  {index + 1}
                </span>
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
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0 || reordering}
                    className="text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed dark:text-indigo-400 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-900"
                  >
                    Move Up
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === projects.length - 1 || reordering}
                    className="text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed dark:text-indigo-400 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-900"
                  >
                    Move Down
                  </button>
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
          </div>
        ))}
      </div>
    </div>
  );
}

