import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';

export const runtime = 'nodejs';

function createImageKey(contentType: string) {
  const ext = contentType === 'image/webp' ? 'webp' : 'jpg';
  const date = new Date().toISOString().slice(0, 10);
  return `wedding/${date}/${crypto.randomUUID()}.${ext}`;
}

export async function POST(req: NextRequest) {
  try {
    const { contentType, fileSize } = await req.json();

    if (!contentType || !fileSize) {
      return NextResponse.json({ message: 'Missing contentType or fileSize' }, { status: 400 });
    }

    if (fileSize > 450 * 1024) {
      return NextResponse.json({ message: 'File too large' }, { status: 400 });
    }

    const key = createImageKey(contentType);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .storage
      .from('submissions')
      .createSignedUploadUrl(key);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/submissions/${data.path}`;

    return NextResponse.json({ uploadUrl: data.signedUrl, key: data.path, publicUrl });
  } catch {
    return NextResponse.json({ message: 'Failed to generate upload URL' }, { status: 500 });
  }
}
