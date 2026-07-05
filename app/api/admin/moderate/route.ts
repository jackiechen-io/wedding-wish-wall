import { NextRequest, NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/auth/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    assertAdmin(req);
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, action } = await req.json();

    if (!id || !['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json({ message: 'Invalid id or action' }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      delete: 'deleted',
    };
    const update: Record<string, unknown> = { status: statusMap[action] };

    if (action === 'approve') {
      update.approved_at = new Date().toISOString();
    }

    const { error } = await getSupabaseAdmin()
      .from('submissions')
      .update(update)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
