'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Submission, SubmissionStatus } from '@/types/submission';
import AdminTokenInput from './AdminTokenInput';
import { EmptyState } from '@/components/ui/EmptyState';

const TABS: { label: string; value: SubmissionStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Deleted', value: 'deleted' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  deleted: 'bg-neutral-100 text-neutral-500',
};

function getAspectLabel(w: number | null, h: number | null): string | null {
  if (!w || !h) return null;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
}

function getAspectRatio(w: number | null, h: number | null): number | null {
  if (!w || !h) return null;
  return Math.round((w / h) * 100) / 100;
}

export default function AdminGallery() {
  const [token, setToken] = useState('');
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<SubmissionStatus | 'all'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (t: string, status?: SubmissionStatus | 'all') => {
    setLoading(true);
    try {
      const params = status && status !== 'all' ? `?status=${status}` : '';
      const res = await fetch(`/api/admin/submissions${params}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || '載入失敗');
      setRows(json.rows);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) load(token, activeTab);
  }, [activeTab, token, load]);

  function handleTabClick(tab: SubmissionStatus | 'all') {
    setActiveTab(tab);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.id)));
    }
  }

  async function bulkAction(action: 'approve' | 'reject' | 'delete') {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch('/api/admin/moderate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id, action }),
          })
        )
      );
      await load(token, activeTab);
    } catch (error) {
      alert(error instanceof Error ? error.message : '操作失敗');
    } finally {
      setBusy(false);
    }
  }

  function handleExport() {
    window.location.href = `/api/admin/export?token=${encodeURIComponent(token)}`;
  }

  const tabCounts: Record<string, number> = {};
  return (
    <main className="min-h-screen bg-[#F8F9FA] p-6 text-neutral-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs tracking-[0.4em] text-neutral-400">STAFF ONLY</p>
            <h1 className="mt-2 font-serif text-4xl">Gallery</h1>
          </div>
          <button
            onClick={handleExport}
            className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm shadow-sm"
          >
            Export Approved ZIP
          </button>
        </div>

        <AdminTokenInput
          token={token}
          setToken={setToken}
          onLoad={() => load(token, activeTab)}
        />

        {token && (
          <>
            <div className="mt-6 flex flex-wrap gap-2 border-b border-neutral-200">
              {TABS.map((tab) => {
                const count = tab.value === 'all' ? rows.length : rows.filter((r) => r.status === tab.value).length;
                tabCounts[tab.value] = count;
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleTabClick(tab.value)}
                    className={`px-4 py-3 text-sm transition ${
                      isActive
                        ? 'border-b-2 border-neutral-900 font-medium text-neutral-900'
                        : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-1.5 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                      {tabCounts[tab.value]}
                    </span>
                  </button>
                );
              })}
            </div>

            {loading && (
              <div className="mt-8 flex justify-center">
                <div className="h-1.5 w-48 overflow-hidden rounded-full bg-neutral-200">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-neutral-900" />
                </div>
              </div>
            )}

            {!loading && rows.length === 0 && (
              <div className="mt-8">
                <EmptyState title="沒有資料" description="目前沒有符合條件的內容。" />
              </div>
            )}

            {!loading && rows.length > 0 && selected.size > 0 && (
              <div className="sticky bottom-4 mt-4 flex items-center gap-3 rounded-2xl bg-neutral-900 px-5 py-3 text-white shadow-lg">
                <span className="text-sm">{selected.size} 個選取</span>
                <button
                  onClick={() => bulkAction('approve')}
                  disabled={busy}
                  className="rounded-full bg-white px-4 py-1.5 text-xs text-neutral-900 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => bulkAction('reject')}
                  disabled={busy}
                  className="rounded-full border border-white/30 px-4 py-1.5 text-xs disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => bulkAction('delete')}
                  disabled={busy}
                  className="rounded-full border border-red-400 px-4 py-1.5 text-xs text-red-400 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}

            {!loading && rows.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.size === rows.length && rows.length > 0}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  <span className="text-xs text-neutral-400">Select all</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {rows.map((row) => {
                    const isSelected = selected.has(row.id);
                    return (
                      <article
                        key={row.id}
                        className={`group relative rounded-3xl bg-white p-3 shadow-sm transition ${
                          isSelected ? 'ring-2 ring-neutral-900' : ''
                        }`}
                      >
                        <label className="absolute left-5 top-5 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/80">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(row.id)}
                            className="h-4 w-4 rounded border-neutral-300"
                          />
                        </label>
                        <div className="relative aspect-square overflow-hidden rounded-2xl">
                          <img
                            src={row.image_url}
                            alt={row.message}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="truncate text-sm font-medium text-neutral-800">
                              {row.nickname}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[row.status]}`}
                            >
                              {row.status}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-xs text-neutral-500">{row.message}</p>
                          <p className="text-xs text-neutral-300">
                            {new Date(row.created_at).toLocaleDateString('zh-TW', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {row.file_size && ` · ${Math.round(row.file_size / 1024)} KB`}
                            {row.image_width && row.image_height
                              ? ` · ${row.image_width}×${row.image_height} (${getAspectLabel(row.image_width, row.image_height)})`
                              : ''}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
