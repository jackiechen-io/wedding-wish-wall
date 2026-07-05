import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/auth/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    assertAdmin(req);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('submissions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ rows: data });
}
