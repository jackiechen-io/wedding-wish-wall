'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

type Props = {
  className?: string;
  fixed?: boolean;
};

export default function QRCodeCard({ className, fixed = true }: Props) {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!origin) return null;

  return (
    <div className={`rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${fixed ? 'fixed bottom-6 right-6 z-30 hidden md:block' : ''} ${className ?? ''}`}>
      <QRCodeSVG
        value={`${origin}/guest`}
        size={88}
        level="M"
        className="block"
      />
      <p className="mt-2 text-center text-[10px] tracking-[0.2em] text-neutral-400">
        SCAN TO WISH
      </p>
    </div>
  );
}
