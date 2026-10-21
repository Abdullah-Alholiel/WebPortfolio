'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';

const STAGES = [
  { value: 'revenue', label: 'Revenue generated', stageLabel: 'Revenue generated' },
  { value: 'vc-targeted', label: 'VC targeted / potential', stageLabel: 'VC targeted' },
  { value: 'hobby', label: 'Hobby project', stageLabel: 'Hobby project' },
];

const STATUSES = [
  { value: 'in-development', label: 'In development' },
  { value: 'coming-soon', label: 'Coming soon' },
  { value: 'archived', label: 'Archived · still running' },
];

interface Venture {
  name: string;
  stage: string;
  stageLabel: string;
  chips: { label: string; tone: string }[];
  description: string;
  status: string;
  projectLink?: { label: string; match: string } | null;
}

const inputCls =
  'w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white';

export default function VenturesTab() {
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const editRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadVentures();
  }, []);

  const loadVentures = async () => {
    try {
      const response = await fetch('/api/admin/ventures');
      const data = await response.json();
      if (response.ok) {
        setVentures(data.data || []);
      } else {
        toast.error(data.error || 'Failed to load founder products');
      }
    } catch (error) {
      toast.error('Failed to load founder products');
    } finally {
      setLoading(false);
    }
  };

  const save = async (next: Venture[], scrollTo?: number) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/ventures', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ventures: next }),
      });
      if (response.ok) {
        setVentures(next);
        toast.success('Founder products saved — live on the site');
        if (typeof scrollTo === 'number') {
          setEditingIdx(scrollTo);
        }
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || 'Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const update = (idx: number, patch: Partial<Venture>) => {
    const next = ventures.map((v, i) => (i === idx ? { ...v, ...patch } : v));
    setVentures(next);
  };

  const addVenture = () => {
    const next = [
      ...ventures,
      {
        name: 'New product',
        stage: 'vc-targeted',
        stageLabel: 'VC targeted',
        chips: [],
        description: '',
        status: 'in-development',
        projectLink: null,
      },
    ];
    setVentures(next);
    setEditingIdx(next.length - 1);
  };

  const remove = (idx: number) => {
    if (!confirm(`Remove "${ventures[idx].name}" from the Founder section?`)) return;
    save(ventures.filter((_, i) => i !== idx));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= ventures.length) return;
    const next = [...ventures];
    [next[idx], next[j]] = [next[j], next[idx]];
    save(next, j);
  };

  // Scroll the card being edited into view (Abdullah: no manual scroll-hunting)
  useEffect(() => {
    if (editingIdx !== null && editRef.current) {
      editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [editingIdx]);

  if (loading) return <Loader className="w-full py-12" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold">Founder Products</h2>
          <p className="text-sm text-gray-500 mt-1">
            Shown in the Founder section, in this order. Drag order with the arrows.
          </p>
        </div>
        <button
          onClick={addVenture}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Add Product
        </button>
      </div>

      {saving && <p className="text-sm text-indigo-600 mb-2">Saving…</p>}

      <div className="space-y-4 mt-4">
        {ventures.map((venture, idx) => {
          const isEditing = editingIdx === idx;
          return (
            <div
              key={idx}
              ref={isEditing ? editRef : undefined}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 ${
                isEditing ? 'border-indigo-500' : 'border-transparent'
              }`}
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      className={inputCls}
                      value={venture.name}
                      onChange={(e) => update(idx, { name: e.target.value })}
                      placeholder="Product name"
                      aria-label="Product name"
                    />
                    <input
                      className={inputCls}
                      value={venture.stageLabel}
                      onChange={(e) => update(idx, { stageLabel: e.target.value })}
                      placeholder="Badge text (e.g. VC targeted)"
                      aria-label="Badge text"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      className={inputCls}
                      value={venture.stage}
                      onChange={(e) => update(idx, { stage: e.target.value })}
                      aria-label="Stage"
                    >
                      {STAGES.map((s) => (
                        <option key={s.value} value={s.value}>
                          Stage: {s.label}
                        </option>
                      ))}
                    </select>
                    <select
                      className={inputCls}
                      value={venture.status}
                      onChange={(e) => update(idx, { status: e.target.value })}
                      aria-label="Status"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          Status: {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    className={inputCls}
                    value={venture.description}
                    onChange={(e) => update(idx, { description: e.target.value })}
                    placeholder="One or two sentences shown on the card"
                    rows={2}
                    aria-label="Description"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      className={inputCls}
                      value={venture.projectLink?.label ?? ''}
                      onChange={(e) =>
                        update(idx, {
                          projectLink: {
                            label: e.target.value,
                            match: venture.projectLink?.match ?? '',
                          },
                        })
                      }
                      placeholder="Link text (e.g. See the engineering) — optional"
                      aria-label="Link text"
                    />
                    <input
                      className={inputCls}
                      value={venture.projectLink?.match ?? ''}
                      onChange={(e) =>
                        update(idx, {
                          projectLink: {
                            label: venture.projectLink?.label ?? 'See the project',
                            match: e.target.value,
                          },
                        })
                      }
                      placeholder="Matches project title containing… (e.g. hailing)"
                      aria-label="Project match"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => {
                        setEditingIdx(null);
                        save(ventures, idx);
                      }}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => setEditingIdx(null)}
                      className="bg-gray-200 dark:bg-gray-700 px-5 py-2 rounded-lg text-sm"
                    >
                      Close
                    </button>
                    <span className="text-xs text-gray-400 self-center ml-2">
                      Changes save when you press Done
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                      {venture.stageLabel} · {STATUSES.find((s) => s.value === venture.status)?.label ?? venture.status}
                    </p>
                    <h3 className="text-lg font-semibold truncate">{venture.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {venture.description || <em>No description</em>}
                    </p>
                    {venture.projectLink?.match && (
                      <p className="text-xs text-gray-400 mt-1">
                        Links to project matching “{venture.projectLink.match}”
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <div className="flex gap-1">
                      <button
                        onClick={() => move(idx, -1)}
                        disabled={idx === 0}
                        className="px-2 py-1 rounded border text-xs disabled:opacity-30"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(idx, 1)}
                        disabled={idx === ventures.length - 1}
                        className="px-2 py-1 rounded border text-xs disabled:opacity-30"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingIdx(idx)}
                        className="text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(idx)}
                        className="text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
