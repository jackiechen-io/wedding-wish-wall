'use client';

import { RefObject, useRef, useState, useCallback, useEffect } from 'react';
import type { Sticker } from '@/types/sticker';
import { STICKER_PNG } from '@/lib/stickers/stickerConfig';

export default function ImagePreviewCanvas({
  previewRef,
  previewUrl,
  stickers,
  draggingId,
  setDraggingId,
  moveSticker,
  deleteSticker,
  rotateSticker
}: {
  previewRef: RefObject<HTMLDivElement | null>;
  previewUrl: string;
  stickers: Sticker[];
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
  moveSticker: (id: string, x: number, y: number) => void;
  deleteSticker: (id: string) => void;
  rotateSticker: (id: string, angle: number) => void;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState({ scale: 1, tx: 0, ty: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const panRef = useRef<{ sx: number; sy: number; tx: number; ty: number } | null>(null);
  const rotateRef = useRef<{ id: string; sa: number; angle: number; cx: number; cy: number } | null>(null);
  const draggingIdRef = useRef(draggingId);
  draggingIdRef.current = draggingId;

  const container = containerRef.current;

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (previewRef) {
        (previewRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [previewRef]
  );

  // --- Document-level rotation handler via useEffect ---
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

  // --- Sticker drag ---
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!container || !draggingId || rotateRef.current) return;
    const rect = container.getBoundingClientRect();
    moveSticker(
      draggingId,
      ((e.clientX - rect.left) / rect.width) * 100,
      ((e.clientY - rect.top) / rect.height) * 100
    );
  }

  function onPointerUp() {
    if (rotateRef.current) return;
    setDraggingId(null);
    panRef.current = null;
  }

  // --- Double-tap delete ---
  function handleStickerClick(id: string) {
    const now = Date.now();
    if (lastTapRef.current?.id === id && now - lastTapRef.current.time < 300) {
      deleteSticker(id);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { id, time: now };
    }
  }

  // --- Sticker selection + drag start ---
  function onStickerPointerDown(e: React.PointerEvent, id: string) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelectedId(id);
    setDraggingId(id);
  }

  // --- Rotation handle ---
  function onRotatePointerDown(e: React.PointerEvent, id: string) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const sticker = stickers.find((s) => s.id === id);
    if (!sticker || !container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.left + (sticker.x / 100) * rect.width;
    const cy = rect.top + (sticker.y / 100) * rect.height;
    rotateRef.current = { id, sa: Math.atan2(e.clientY - cy, e.clientX - cx), angle: sticker.rotation, cx, cy };
    setDraggingId(id);
  }

  // --- Pinch-to-zoom (touch) ---
  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), scale: zoom.scale };
    }
  }

  function onTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / pinchRef.current.dist;
      setZoom((prev) => ({
        ...prev,
        scale: Math.max(0.5, Math.min(5, pinchRef.current!.scale * ratio)),
      }));
    }
  }

  function onTouchEnd() {
    pinchRef.current = null;
  }

  // --- Pan (pointer down on background, single finger on desktop) ---
  function onBgPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (draggingId) return;
    panRef.current = { sx: e.clientX, sy: e.clientY, tx: zoom.tx, ty: zoom.ty };
  }

  function onBgPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (draggingId || !panRef.current) return;
    e.preventDefault();
    setZoom((prev) => ({
      ...prev,
      tx: panRef.current!.tx + (e.clientX - panRef.current!.sx),
      ty: panRef.current!.ty + (e.clientY - panRef.current!.sy),
    }));
  }

  // --- Fullscreen ---
  function toggleFullscreen() {
    setZoom({ scale: 1, tx: 0, ty: 0 });
    setIsFullscreen((prev) => !prev);
  }

  function resetZoom() {
    setZoom({ scale: 1, tx: 0, ty: 0 });
  }

  const viewportTransform = `scale(${zoom.scale}) translate(${zoom.tx / zoom.scale}px, ${zoom.ty / zoom.scale}px)`;

  const canvasMarkup = (
    <div
      ref={setRef}
      className={`relative overflow-hidden ${isFullscreen ? 'flex-1 touch-none' : 'rounded-3xl border border-neutral-200 bg-neutral-100 shadow-sm touch-none'}`}
      style={isFullscreen ? { height: '100%' } : { aspectRatio: '1 / 1' }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerDown={onBgPointerDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="w-full"
        style={{ transform: viewportTransform, transformOrigin: '0 0' }}
      >
        <img src={previewUrl} alt="照片預覽" className="w-full select-none block" draggable={false} />
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
            {/* Delete button */}
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

            {/* Rotation handle */}
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

            {/* Sticker image */}
            <button
              type="button"
              className="h-full w-full"
              onPointerDown={(e) => onStickerPointerDown(e, s.id)}
              onClick={() => handleStickerClick(s.id)}
              aria-label="可拖曳貼圖"
            >
              <img
                src={STICKER_PNG[s.type]}
                alt="貼圖"
                className="pointer-events-none h-full w-full drop-shadow-sm"
                draggable={false}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black">
        <div className="flex items-center justify-between px-4 py-3 text-white">
          <button type="button" onClick={toggleFullscreen} className="rounded-full p-1 hover:bg-white/10 active:scale-95" aria-label="關閉全螢幕">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="text-xs text-white/60">拖曳移動貼圖</span>
          <button type="button" onClick={resetZoom} className="rounded-full px-3 py-1 text-xs text-white/60 hover:bg-white/10 active:scale-95">
            重設縮放
          </button>
        </div>
        {canvasMarkup}
      </div>
    );
  }

  return (
    <div>
      {canvasMarkup}
      <button
        type="button"
        onClick={toggleFullscreen}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-500 transition active:scale-[0.99] sm:hidden"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
        全螢幕編輯
      </button>
    </div>
  );
}
