'use client';

import { useState } from 'react';
import { useAdminSubmissions } from '@/hooks/useAdminSubmissions';
import AdminTokenInput from './AdminTokenInput';
import SubmissionReviewCard from './SubmissionReviewCard';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminModerationPanel() {
  const [token, setToken] = useState('');
  const { rows, loading, load, moderate, exportAll } = useAdminSubmissions();

  async function safeModerate(id: string, action: 'approve' | 'reject' | 'delete') {
    try {
      await moderate(token, id, action);
    } catch (error) {
      alert(error instanceof Error ? error.message : '操作失敗');
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-6 text-neutral-900">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs tracking-[0.4em] text-neutral-400">STAFF ONLY</p>
            <h1 className="mt-2 font-serif text-4xl">Moderation</h1>
          </div>
          <div className="flex gap-2">
            <a
              href="/admin/gallery"
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm shadow-sm"
            >
              Gallery View
            </a>
            <button
              onClick={() => exportAll(token)}
              className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm shadow-sm"
            >
              Export Approved ZIP
            </button>
          </div>
        </div>

        <AdminTokenInput token={token} setToken={setToken} onLoad={() => load(token).catch((e) => alert(e.message))} />

        <div className="mt-6">
          {loading && <p className="text-sm text-neutral-400">載入中…</p>}
          {!loading && rows.length === 0 && <EmptyState title="目前沒有待審核內容" description="新的祝福送出後會出現在這裡。" />}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {rows.map((row) => (
            <SubmissionReviewCard
              key={row.id}
              row={row}
              onApprove={() => safeModerate(row.id, 'approve')}
              onReject={() => safeModerate(row.id, 'reject')}
              onDelete={() => safeModerate(row.id, 'delete')}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
