'use client';

import { useRef, useState, useEffect } from 'react';
import type { Sticker } from '@/types/sticker';
import type { Gradient } from '@/lib/text/gradients';
import { getCssGradient } from '@/lib/text/gradients';
import { STICKER_PNG } from '@/lib/stickers/stickerConfig';

export default function TextPreview({
  message,
  nickname,
  gradient,
  stickers,
  draggingId,
  setDraggingId,
  moveSticker,
  deleteSticker,
  rotateSticker,
  resizeSticker,
}: {
  message: string;
  nickname: string;
  gradient: Gradient;
  stickers: Sticker[];
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
  moveSticker: (id: string, x: number, y: number) => void;
  deleteSticker: (id: string) => void;
  rotateSticker: (id: string, angle: number) => void;
  resizeSticker: (id: string, size: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);
  const rotateRef = useRef<{ id: string; sa: number; angle: number; cx: number; cy: number } | null>(null);
  const resizeRef = useRef<{ id: string; startSize: number; startY: number } | null>(null);

  useEffect(() => {
    if (!rotateRef.current) return;
    function onMove(e: PointerEvent) {
      if (!rotateRef.current) return;
      const cur = Math.atan2(e.clientY - rotateRef.current.cy, e.clientX - rotateRef.current.cx);
      let delta = (cur - rotateRef.current.sa) * (180 / Math.PI);
      let newAngle = ((rotateRef.current.angle + delta) % 360 + 360) % 360;
      rotateSticker(rotateRef.current.id, newAngle);
    }
    function onUp() {
      setDraggingId(null);
      rotateRef.current = null;
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!rotateRef.current]);

  useEffect(() => {
    if (!resizeRef.current) return;
    function onMove(e: PointerEvent) {
      if (!resizeRef.current) return;
      const dy = e.clientY - resizeRef.current.startY;
      const newSize = Math.max(24, Math.min(150, resizeRef.current.startSize + dy * 0.3));
      resizeSticker(resizeRef.current.id, newSize);
    }
    function onUp() {
      setDraggingId(null);
      resizeRef.current = null;
    }
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!resizeRef.current]);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!containerRef.current || !draggingId || rotateRef.current || resizeRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    moveSticker(
      draggingId,
      ((e.clientX - rect.left) / rect.width) * 100,
      ((e.clientY - rect.top) / rect.height) * 100
    );
  }

  function onPointerUp() {
    if (rotateRef.current || resizeRef.current) return;
    setDraggingId(null);
  }

  function handleStickerClick(id: string) {
    const now = Date.now();
    if (lastTapRef.current?.id === id && now - lastTapRef.current.time < 300) {
      deleteSticker(id);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { id, time: now };
    }
  }

  function onStickerPointerDown(e: React.PointerEvent, id: string) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelectedId(id);
    setDraggingId(id);
  }

  function onRotatePointerDown(e: React.PointerEvent, id: string) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const sticker = stickers.find((s) => s.id === id);
    if (!sticker || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + (sticker.x / 100) * rect.width;
    const cy = rect.top + (sticker.y / 100) * rect.height;
    rotateRef.current = { id, sa: Math.atan2(e.clientY - cy, e.clientX - cx), angle: sticker.rotation, cx, cy };
    setDraggingId(id);
  }

  function onResizePointerDown(e: React.PointerEvent, id: string) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const sticker = stickers.find((s) => s.id === id);
    if (!sticker) return;
    resizeRef.current = { id, startSize: sticker.size, startY: e.clientY };
    setDraggingId(id);
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full overflow-hidden rounded-3xl border border-neutral-200 shadow-sm touch-none select-none"
      style={{ background: getCssGradient(gradient) }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {message && (
        <div className="pointer-events-none flex h-full items-center justify-center px-12 py-16">
          <p className="text-center text-3xl font-bold leading-relaxed text-neutral-800 md:text-4xl">
            {message}
          </p>
        </div>
      )}
      {nickname && (
        <div className="pointer-events-none absolute bottom-8 left-0 right-0 text-center">
          <p className="text-base text-neutral-500">— {nickname} —</p>
        </div>
      )}
      {stickers.map((s) => (
        <div
          key={s.id}
          className="group absolute touch-none select-none"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
          }}
        >
          <button
            type="button"
            className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100"
            onClick={(e) => { e.stopPropagation(); deleteSticker(s.id); }}
            aria-label="刪除貼圖"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {(selectedId === s.id || draggingId === s.id) && (
            <button
              type="button"
              className="absolute -left-6 -top-6 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-neutral-900/60 text-white shadow-md transition active:scale-90"
              onPointerDown={(e) => onRotatePointerDown(e, s.id)}
              aria-label="旋轉貼圖"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {(selectedId === s.id || draggingId === s.id) && (
            <button
              type="button"
              className="absolute -bottom-3 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-neutral-900/60 text-white shadow-md transition active:scale-90"
              onPointerDown={(e) => onResizePointerDown(e, s.id)}
              aria-label="縮放貼圖"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          )}

          <button
            type="button"
            className="h-full w-full"
            onPointerDown={(e) => onStickerPointerDown(e, s.id)}
            onClick={() => handleStickerClick(s.id)}
            aria-label="可拖曳貼圖"
          >
            <img
              src={STICKER_PNG[s.type]}
              alt=""
              className="pointer-events-none h-full w-full drop-shadow-sm"
              draggable={false}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
