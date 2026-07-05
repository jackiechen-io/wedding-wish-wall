'use client';

import type { Sticker } from '@/types/sticker';
import type { Gradient } from '@/lib/text/gradients';
import { getCssGradient } from '@/lib/text/gradients';
import { STICKER_PNG } from '@/lib/stickers/stickerConfig';

export default function TextPreview({
  message,
  nickname,
  gradient,
  stickers,
}: {
  message: string;
  nickname: string;
  gradient: Gradient;
  stickers: Sticker[];
}) {
  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-3xl border border-neutral-200 shadow-sm"
      style={{ background: getCssGradient(gradient) }}
    >
      {message && (
        <div className="flex h-full items-center justify-center px-12 py-16">
          <p className="text-center text-3xl font-bold leading-relaxed text-neutral-800 md:text-4xl">
            {message}
          </p>
        </div>
      )}
      {nickname && (
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-base text-neutral-500">— {nickname} —</p>
        </div>
      )}
      {stickers.map((s) => (
        <div
          key={s.id}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img
            src={STICKER_PNG[s.type]}
            alt=""
            className="h-full w-full"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}
