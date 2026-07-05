'use client';

import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browserClient';
import type { PublicSubmission } from '@/types/submission';

const MAX_ITEMS = 30;

function randomTilt() {
  return Number((Math.random() * 10 - 5).toFixed(2));
}

export type DisplaySubmission = PublicSubmission & { tilt: number };

export function useApprovedRealtime() {
  const [items, setItems] = useState<DisplaySubmission[]>([]);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    async function loadInitial() {
      const { data } = await supabase
        .from('submissions')
        .select('id,nickname,message,hashtag,image_url,image_width,image_height,created_at,approved_at')
        .eq('status', 'approved')
        .order('approved_at', { ascending: false })
        .limit(MAX_ITEMS);

      if (data) setItems(data.map((row) => ({ ...row, tilt: randomTilt() })) as DisplaySubmission[]);
    }

    loadInitial();

    const channel = supabase
      .channel('approved-wall')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'submissions', filter: 'status=eq.approved' },
        (payload) => {
          const row = payload.new as PublicSubmission;
          setItems((prev) => {
            if (prev.some((item) => item.id === row.id)) return prev;
            return [{ ...row, tilt: randomTilt() }, ...prev].slice(0, MAX_ITEMS);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return items;
}
