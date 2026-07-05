import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { moderateText } from '@/lib/text/moderateText';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nickname, message, imageKey, imageUrl, contentType, fileSize } = body;

    if (!nickname?.trim() || !message?.trim() || !imageKey || !imageUrl) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (nickname.length > 30) {
      return NextResponse.json({ message: '暱稱不得超過30個字' }, { status: 400 });
    }

    if (message.length > 300) {
      return NextResponse.json({ message: '祝福不得超過300個字' }, { status: 400 });
    }

    if (fileSize > 450 * 1024) {
      return NextResponse.json({ message: '圖片檔案過大' }, { status: 400 });
    }

    const nickCheck = moderateText(nickname);
    if (!nickCheck.passed) {
      return NextResponse.json({ message: nickCheck.reason }, { status: 400 });
    }

    const msgCheck = moderateText(message);
    if (!msgCheck.passed) {
      return NextResponse.json({ message: msgCheck.reason }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('submissions')
      .insert({
        nickname: nickname.trim(),
        message: message.trim(),
        image_key: imageKey,
        image_url: imageUrl,
        content_type: contentType || 'image/jpeg',
        file_size: fileSize,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
