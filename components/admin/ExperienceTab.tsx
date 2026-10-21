'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getIconOptionsForSelect } from '@/lib/icon-utils';
import StandardIcon from '@/components/standard-icon';
import Loader from '@/components/ui/loader';

interface Experience {
  key: string;
  title: string;
  location: string;
  description: string;
  date: string;
  icon?: string;
  source?: 'founder-seed' | 'admin';
}

type ModeFilter = 'all' | 'entrepreneurial' | 'professional';

const inputCls =
  'w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition';
const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5';

/**
 * Experience admin.
 *
 * UX contract (Abdullah):
 *  - Edit IN PLACE. Clicking Edit expands the form inside that card; the
 *    top panel of the old design is gone, so you never scroll up to find it.
 *  - Clicking Edit on a card near the end of a long list scrolls the CARD
 *    itself into view — no manual scroll-hunting.
 *  - A sticky save bar shows unsaved changes and saves/cancels from anywhere.
 *  - Both journey modes are visible and editable. The Entrepreneurial entries
 *    (including the founder seeds) are first-class rows, not hidden.
 */
export default function ExperienceTab() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Experience>>({});
  const [dirty, setDirty] = useState(false);
  const [filter, setFilter] = useState<ModeFilter>('all');
  const [iconSearch, setIconSearch] = useState('');
  const [isNew, setIsNew] = useState(false);

  const editCardRef = useRef<HTMLDivElement | null>(null);
  const newCardRef = useRef<HTMLDivElement | null>(null);

  const isEntrepreneurial = (e: Experience) =>
    Boolean(e.key?.startsWith('founder-')) ||
    e.source === 'founder-seed' ||
    /founder/i.test(e.title || '');

  const visible = useMemo(() => {
    if (filter === 'entrepreneurial') return experiences.filter(isEntrepreneurial);
    if (filter === 'professional') return experiences.filter((e) => !isEntrepreneurial(e));
    return experiences;
  }, [experiences, filter]);

  const counts = useMemo(
    () => ({
      all: experiences.length,
      entrepreneurial: experiences.filter(isEntrepreneurial).length,
      professional: experiences.filter((e) => !isEntrepreneurial(e)).length,
    }),
    [experiences]
  );

  const iconOptions = useMemo(() => {
    const all = getIconOptionsForSelect('experience');
    if (!iconSearch) return all;
    const q = iconSearch.toLowerCase();
    return all.filter(
      (o) => o.value.toLowerCase().includes(q) || o.label.toLowerCase().includes(q)
    );
  }, [iconSearch]);

  const loadExperiences = async () => {
    try {
      const res = await fetch('/api/admin/experience', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) setExperiences(data.data || []);
      else setExperiences([]);
    } catch {
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  // Bring the edited card into view — the whole point: no manual scrolling.
  useEffect(() => {
    if (!editKey && !isNew) return;
    const t = window.setTimeout(() => {
      const target = isNew ? newCardRef.current : editCardRef.current;
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 90);
    return () => window.clearTimeout(t);
  }, [editKey, isNew]);

  const startEdit = (exp: Experience) => {
    setIsNew(false);
    setEditKey(exp.key);
    setDraft({ ...exp });
    setIconSearch('');
    setDirty(false);
  };

  const startNew = () => {
    setEditKey(null);
    setIsNew(true);
    setDraft({
      title: '',
      location: '',
      description: '',
      date: '',
      icon: 'FaBriefcase',
    });
    setIconSearch('');
    setDirty(false);
  };

  const cancel = () => {
    setEditKey(null);
    setIsNew(false);
    setDraft({});
    setDirty(false);
    setIconSearch('');
  };

  const update = (patch: Partial<Experience>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  };

  const save = async () => {
    const title = (draft.title || '').trim();
    const date = (draft.date || '').trim();
    if (!title || !date) {
      toast.error('Title and date are required');
      return;
    }
    const targetKey = editKey;
    setSavingKey(targetKey ?? '__new__');
    try {
      const payload = {
        key: targetKey,
        experience: {
          title,
          location: (draft.location || '').trim(),
          description: draft.description || '',
          date,
          icon: draft.icon || 'FaBriefcase',
        },
      };
      const res = await fetch('/api/admin/experience', {
        method: targetKey ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to save');
        return;
      }
      toast.success(targetKey ? 'Experience updated' : 'Experience added');
      cancel();
      loadExperiences();
    } catch {
      toast.error('Failed to save — check your connection');
    } finally {
      setSavingKey(null);
    }
  };

  const remove = async (exp: Experience) => {
    if (!confirm(`Delete "${exp.title}"?`)) return;
    try {
      const res = await fetch('/api/admin/experience', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        // Key-based delete: an index would shift when the list re-sorts.
        body: JSON.stringify({ key: exp.key }),
      });
      if (res.ok) {
        if (editKey === exp.key) cancel();
        toast.success('Deleted');
        loadExperiences();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <Loader className="w-full py-12" />;

  const Editor = ({ isNewEntry }: { isNewEntry?: boolean }) => (
    <div className="space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Title</label>
          <input
            type="text"
            value={draft.title || ''}
            onChange={(e) => update({ title: e.target.value })}
            className={inputCls}
            placeholder="e.g. Data Analyst @ Company"
            autoFocus
          />
        </div>
        <div>
          <label className={labelCls}>Location / Type</label>
          <input
            type="text"
            value={draft.location || ''}
            onChange={(e) => update({ location: e.target.value })}
            className={inputCls}
            placeholder="e.g. Self-founded, Riyadh"
          />
        </div>
        <div>
          <label className={labelCls}>Date</label>
          <input
            type="text"
            value={draft.date || ''}
            onChange={(e) => update({ date: e.target.value })}
            className={inputCls}
            placeholder="MM/YYYY - Present"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          value={draft.description || ''}
          onChange={(e) => update({ description: e.target.value })}
          className={`${inputCls} resize-y`}
          rows={4}
          placeholder="What did you do? What changed because of it?"
        />
      </div>

      <div>
        <label className={labelCls}>Icon</label>
        <input
          type="text"
          placeholder="Search icons…"
          value={iconSearch}
          onChange={(e) => setIconSearch(e.target.value)}
          className={`${inputCls} mb-2`}
        />
        <select
          value={draft.icon || 'FaBriefcase'}
          onChange={(e) => update({ icon: e.target.value })}
          className={inputCls}
          size={Math.min(Math.max(iconOptions.length, 3), 8)}
        >
          {iconOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Preview:</span>
          <StandardIcon icon={draft.icon || 'FaBriefcase'} size="xl" />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={save}
          disabled={!dirty || savingKey !== null}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
        >
          {savingKey === (isNewEntry ? '__new__' : editKey) ? 'Saving…' : 'Save changes'}
        </button>
        <button
          onClick={cancel}
          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const filters: { id: ModeFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'entrepreneurial', label: 'Entrepreneurial' },
    { id: 'professional', label: 'Professional' },
  ];

  return (
    <div className="pb-24">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Experience</h2>
          <p className="text-sm text-gray-500 mt-1">
            Click <strong>Edit</strong> on any card to change it in place. Entries are sorted
            by date automatically.
          </p>
        </div>
        <button
          onClick={startNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
        >
          + Add Experience
        </button>
      </div>

      {/* Mode filters — every entry is reachable, including founder seeds */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {f.label}
            <span className="ml-2 opacity-70">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {/* New-entry card */}
      {isNew && (
        <div
          ref={newCardRef}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4 ring-2 ring-indigo-500"
        >
          <h3 className="text-lg font-semibold">Add Experience</h3>
          <Editor isNewEntry />
        </div>
      )}

      <div className="space-y-4">
        {visible.map((exp) => {
          const editing = editKey === exp.key;
          const entrepreneurial = isEntrepreneurial(exp);
          return (
            <div
              key={exp.key}
              ref={editing ? editCardRef : undefined}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition ${
                editing ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {/* Mode badge makes the two journey modes legible at a glance */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        entrepreneurial
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200'
                      }`}
                    >
                      {entrepreneurial ? 'Entrepreneurial' : 'Professional'}
                    </span>
                    {exp.source === 'founder-seed' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        Founder seed
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">{exp.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold break-words">{exp.title}</h3>
                  {exp.location && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{exp.location}</p>
                  )}
                  {!editing && exp.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
                {!editing && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(exp)}
                      aria-label={`Edit ${exp.title}`}
                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(exp)}
                      aria-label={`Delete ${exp.title}`}
                      className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              {editing && <Editor />}
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-12">
            No entries in this mode yet.
          </p>
        )}
      </div>

      {/* Sticky save bar — save/cancel from anywhere, no scroll-hunting */}
      {editKey && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {dirty ? 'Unsaved changes' : 'No changes yet'}
            </span>
            <div className="ml-auto flex gap-3">
              <button
                onClick={cancel}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-5 py-2 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={!dirty || savingKey !== null}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-semibold transition"
              >
                {savingKey === editKey ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}