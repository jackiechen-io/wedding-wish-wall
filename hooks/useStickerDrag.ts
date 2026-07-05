'use client';

import { useState } from 'react';
import type { Sticker, StickerType } from '@/types/sticker';
import { STICKER_TYPES } from '@/lib/stickers/stickerConfig';

export function useStickerDrag() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function addSticker(type: StickerType) {
    setStickers((prev) => {
      if (prev.some((s) => s.type === type)) return prev;
      const stickerIndex = STICKER_TYPES.indexOf(type);
      return [
        ...prev,
        { id: crypto.randomUUID(), type, stickerIndex, x: 50, y: 48, size: 54, rotation: 0 }
      ];
    });
  }

  function deleteSticker(id: string) {
    setStickers((prev) => prev.filter((s) => s.id !== id));
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

  function rotateSticker(id: string, angle: number) {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rotation: angle } : s))
    );
  }

  function clearStickers() {
    setStickers([]);
  }

  return { stickers, setStickers, draggingId, setDraggingId, addSticker, deleteSticker, moveSticker, rotateSticker, clearStickers };
}
