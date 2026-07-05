import { NextResponse } from 'next/server';
import { buildLineLoginUrl } from '@/lib/auth/lineAuth';

export const runtime = 'nodejs';

export async function GET() {
  const url = buildLineLoginUrl();
  if (!url) {
    return NextResponse.json({ message: 'LINE login not configured' }, { status: 501 });
  }
  return NextResponse.redirect(url);
}
