'use client';

import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';
import { SITE_COPY_DEFAULTS } from '@/lib/site-copy';

const inputCls =
  'w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition';

/**
 * Site Copy admin — every section heading / subtitle / card label in one
 * editable list. Emptied fields fall back to the default wording.
 */
export default function SiteCopyTab() {
  const [copy, setCopy] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/site-copy', { cache: 'no-store' });
        const json = await res.json();
        if (res.ok) setCopy(json.data || {});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const keys = useMemo(() => {
    const all = Object.keys(SITE_COPY_DEFAULTS);
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter(
      (k) => k.toLowerCase().includes(q) || (copy[k] || '').toLowerCase().includes(q)
    );
  }, [query, copy]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-copy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copy }),
      });
      if (res.ok) {
        toast.success('Site copy saved');
        setDirty(false);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save — check your connection');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader className="w-full py-12" />;

  return (
    <div className="pb-16">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Site Copy</h2>
          <p className="text-sm text-gray-500 mt-1">
            Every section heading and label. Leave a field empty to restore the
            default wording.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter fields…"
            className={`${inputCls} !w-56`}
          />
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap"
          >
            {saving ? 'Saving…' : 'Save all'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {keys.map((key) => (
          <div
            key={key}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5"
          >
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              {key}
            </label>
            <input
              type="text"
              value={copy[key] ?? ''}
              onChange={(e) => {
                setCopy((c) => ({ ...c, [key]: e.target.value }));
                setDirty(true);
              }}
              className={inputCls}
              placeholder={SITE_COPY_DEFAULTS[key]}
            />
            {copy[key] !== SITE_COPY_DEFAULTS[key] && (
              <p className="mt-1.5 text-[11px] text-gray-400">
                Default: “{SITE_COPY_DEFAULTS[key]}”
              </p>
            )}
          </div>
        ))}
        {keys.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-12">No matching fields.</p>
        )}
      </div>
    </div>
  );
}