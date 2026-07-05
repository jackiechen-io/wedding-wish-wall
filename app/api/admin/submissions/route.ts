import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/auth/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import type { SubmissionStatus } from '@/types/submission';

export const runtime = 'nodejs';

const VALID_STATUSES: SubmissionStatus[] = ['pending', 'approved', 'rejected', 'deleted'];

export async function GET(req: NextRequest) {
  try {
    assertAdmin(req);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let query = getSupabaseAdmin()
    .from('submissions')
    .select('*');

  if (status === 'all') {
    // no filter — returns all statuses
  } else if (status && VALID_STATUSES.includes(status as SubmissionStatus)) {
    query = query.eq('status', status);
  } else {
    query = query.eq('status', 'pending');
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ rows: data });
}
