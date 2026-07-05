'use client';

import { useState } from 'react';
import type { Sticker, StickerType } from '@/types/sticker';

export function useStickerDrag() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function addSticker(type: StickerType) {
    setStickers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, x: 50, y: 48, size: 54 }
    ]);
  }

  function moveSticker(id: string, x: number, y: number) {
    setStickers((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
          : s
      )
    );
  }

  function clearStickers() {
    setStickers([]);
  }

  return { stickers, setStickers, draggingId, setDraggingId, addSticker, moveSticker, clearStickers };
}
