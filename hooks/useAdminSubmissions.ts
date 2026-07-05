'use client';

import { useState } from 'react';
import type { Submission } from '@/types/submission';

export function useAdminSubmissions() {
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  async function load(token: string, status?: string) {
    setLoading(true);
    try {
      const params = status ? `?status=${status}` : '';
      const res = await fetch(`/api/admin/submissions${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || '載入失敗');
      setRows(json.rows);
    } finally {
      setLoading(false);
    }
  }

  async function moderate(token: string, id: string, action: 'approve' | 'reject' | 'delete') {
    const res = await fetch('/api/admin/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, action })
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.message || '操作失敗');
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function exportAll(token: string) {
    window.location.href = `/api/admin/export?token=${encodeURIComponent(token)}`;
  }

  return { rows, loading, load, moderate, exportAll };
}
