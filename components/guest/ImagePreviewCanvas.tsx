'use client';

import { RefObject } from 'react';
import type { Sticker } from '@/types/sticker';
import { STICKER_PNG } from '@/lib/stickers/stickerConfig';

export default function ImagePreviewCanvas({
  previewRef,
  previewUrl,
  stickers,
  draggingId,
  setDraggingId,
  moveSticker
}: {
  previewRef: RefObject<HTMLDivElement | null>;
  previewUrl: string;
  stickers: Sticker[];
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
  moveSticker: (id: string, x: number, y: number) => void;
}) {
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingId || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    moveSticker(draggingId, x, y);
  }

  return (
    <div
      ref={previewRef}
      className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
      onPointerMove={onPointerMove}
      onPointerUp={() => setDraggingId(null)}
      onPointerCancel={() => setDraggingId(null)}
    >
      <img src={previewUrl} alt="照片預覽" className="w-full select-none" />

      {stickers.map((s) => (
        <button
          key={s.id}
          type="button"
          className="absolute touch-none select-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            transform: 'translate(-50%, -50%)'
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDraggingId(s.id);
          }}
          aria-label="可拖曳貼圖"
        >
          <img
            src={STICKER_PNG[s.type]}
            alt="貼圖"
            className="pointer-events-none h-full w-full drop-shadow-sm"
            draggable={false}
          />
        </button>
      ))}
    </div>
  );
}
