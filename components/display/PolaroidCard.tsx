'use client';

import { useState } from 'react';
import type { DisplaySubmission } from '@/hooks/useApprovedRealtime';

export default function PolaroidCard({ item }: { item: DisplaySubmission }) {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      className="polaroid animate-polaroid-in bg-white p-3 shadow-[0_12px_35px_rgba(0,0,0,0.10)]"
      style={{ transform: `rotate(${item.tilt}deg)` }}
    >
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
        {imgError ? (
          <div className="flex h-full items-center justify-center text-neutral-300">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <img
            src={item.image_url}
            alt={item.message}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="px-1 pb-2 pt-3">
        <p className="line-clamp-2 font-serif text-lg text-neutral-800">{item.message}</p>
        <p className="mt-1 text-right text-xs text-neutral-400">— {item.nickname}</p>
      </div>
    </article>
  );
}
