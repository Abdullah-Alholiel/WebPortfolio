'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface SkillsData {
  [category: string]: string[];
}

export default function SkillsTab() {
  const [skills, setSkills] = useState<SkillsData>({});
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingSkills, setEditingSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const response = await fetch('/api/admin/skills');
      const data = await response.json();
      if (response.ok && data.data) {
        // Ensure all values in the data are arrays
        const normalizedSkills: SkillsData = {};
        for (const [category, items] of Object.entries(data.data)) {
          normalizedSkills[category] = Array.isArray(items) ? items : [];
        }
        setSkills(normalizedSkills);
      } else {
        setSkills({});
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      setSkills({});
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (category: string, categorySkills: string[]) => {
    try {
      // Merge with existing skills, updating only the edited category
      const newSkills = { ...skills, [category]: categorySkills };
      const response = await fetch('/api/admin/skills', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSkills),
      });

      if (response.ok) {
        toast.success('Skills updated!');
        setEditingCategory(null);
        setEditingSkills([]);
        loadSkills();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setEditingSkills([...editingSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setEditingSkills(editingSkills.filter((_, i) => i !== index));
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Skills</h2>
      <div className="space-y-6">
        {Object.entries(skills).map(([category, items]) => {
          // Ensure items is always an array
          const categoryItems = Array.isArray(items) ? items : [];
          
          return (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{category}</h3>
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setEditingSkills(categoryItems);
                  }}
                  className="text-indigo-600 px-4 py-2 rounded-lg"
                >
                  Edit
                </button>
              </div>
              {editingCategory === category ? (
                <div>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700"
                      placeholder="Add skill"
                    />
                    <button onClick={addSkill} className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {editingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button onClick={() => removeSkill(index)} className="hover:text-indigo-600">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleSave(category, editingSkills)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setEditingSkills([]);
                      }}
                      className="bg-gray-200 dark:bg-gray-700 px-6 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categoryItems.map((skill, index) => (
                    <span key={index} className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                      {typeof skill === 'string' ? skill : String(skill)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

