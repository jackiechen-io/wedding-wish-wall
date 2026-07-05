'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

export default function QRStickerPage() {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!origin) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-8 print:p-0">
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-3xl bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.15)] print:shadow-none">
          <QRCodeSVG
            value={`${origin}/guest`}
            size={400}
            level="M"
            className="block"
          />
        </div>
        <p className="text-center font-serif text-3xl tracking-[0.3em] text-neutral-800">
          SCAN TO WISH
        </p>
        <p className="text-center text-sm tracking-[0.15em] text-neutral-400">
          {origin}/guest
        </p>
        <p className="mt-4 max-w-md text-center text-xs text-neutral-400">
          Print at 100% scale (no scaling). Recommended size: 12cm × 12cm.
        </p>
      </div>
    </main>
  );
}
