import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import Archiver from 'archiver';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token || !process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('submissions')
    .select('*')
    .eq('status', 'approved')
    .order('approved_at', { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const archive = Archiver('zip', { zlib: { level: 6 } });

      archive.on('data', (chunk) => controller.enqueue(chunk));
      archive.on('end', () => controller.close());
      archive.on('error', (err) => controller.error(err));

      const metadata = data.map((row, i) => ({
        index: i + 1,
        id: row.id,
        nickname: row.nickname,
        message: row.message,
        image_url: row.image_url,
        approved_at: row.approved_at
      }));

      archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });

      for (const row of data) {
        const ext = row.content_type === 'image/webp' ? 'webp' : 'jpg';
        const filename = `${row.nickname}-${row.id.slice(0, 8)}.${ext}`;

        try {
          const response = await fetch(row.image_url);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            archive.append(Buffer.from(buffer), { name: `images/${filename}` });
          }
        } catch {
          archive.append(`Failed to fetch: ${row.image_url}`, { name: `errors/${filename}.txt` });
        }
      }

      archive.finalize();
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="approved-submissions-${new Date().toISOString().slice(0, 10)}.zip"`
    }
  });
}
