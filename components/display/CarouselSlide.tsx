'use client';

import { useState } from 'react';
import type { DisplaySubmission } from '@/hooks/useApprovedRealtime';

export default function CarouselSlide({ item }: { item: DisplaySubmission }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = !!item.image_url && !imgError;

  if (hasImage) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <img
            src={item.image_url}
            alt={item.message}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            decoding="async"
            onError={() => setImgError(true)}
          />
        </div>
        <div className="bg-gradient-to-t from-black/60 via-black/30 to-transparent">
          <div className="mx-auto max-w-2xl px-6 pb-8 pt-4 sm:px-10 sm:pb-10 3xl:max-w-4xl">
            <p className="font-handwriting text-lg text-white sm:text-xl 3xl:text-3xl">{item.message}</p>
            <p className="mt-2 text-right text-sm text-white/60 3xl:text-lg">— {item.nickname}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-8 sm:p-16">
      <div className="max-w-xl rounded-2xl bg-white/15 p-8 backdrop-blur-md sm:p-12 3xl:max-w-2xl 3xl:p-16">
        <p className="text-center font-handwriting text-2xl leading-relaxed text-white sm:text-4xl 3xl:text-5xl">
          {item.message}
        </p>
        <p className="mt-6 text-right text-base text-white/60 sm:mt-8 sm:text-lg 3xl:text-xl">
          — {item.nickname}
        </p>
      </div>
    </div>
  );
}
