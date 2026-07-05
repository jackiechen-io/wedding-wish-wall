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

    const supabase = getSupabaseAdmin();

    if (action === 'delete') {
      const { data: row } = await supabase
        .from('submissions')
        .select('image_key')
        .eq('id', id)
        .single();

      if (row?.image_key) {
        await supabase.storage.from('submissions').remove([row.image_key]);
      }

      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
    };
    const update: Record<string, unknown> = { status: statusMap[action] };

    if (action === 'approve') {
      update.approved_at = new Date().toISOString();
    }

    const { error } = await supabase
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
