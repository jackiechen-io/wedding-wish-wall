'use client';

import { useRef, useState, useEffect, useMemo } from 'react';

export default function ImageCropEditor({
  file,
  onCrop,
  onCancel,
}: {
  file: File;
  onCrop: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const panRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startClientX: 0,
    startClientY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const prevZoomRef = useRef(1);
  const fitZoomRef = useRef(1);
  const pinchRef = useRef({ initialDist: 0, initialZoom: 1 });
  const isPinchingRef = useRef(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });

  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setImgNatural({ w, h });
      if (containerRef.current) {
        const containerSize = containerRef.current.clientWidth;
        if (containerSize > 0) {
          const fitZoom = Math.min(containerSize / w, containerSize / h);
          setZoom(fitZoom);
          fitZoomRef.current = fitZoom;
          prevZoomRef.current = fitZoom;
        }
      }
    };
    img.src = previewUrl;
    return () => { URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !imgNatural.w || !imgNatural.h) return;
    const p = panRef.current;
    const size = container.clientWidth;
    const cropSize = size * 0.8;
    const cropHalf = cropSize / 2;
    const dispW = imgNatural.w * zoom;
    const dispH = imgNatural.h * zoom;

    // Scale offset proportionally so crop window center stays stable
    const prevZoom = prevZoomRef.current;
    if (prevZoom !== zoom && prevZoom > 0) {
      const scale = zoom / prevZoom;
      p.offsetX *= scale;
      p.offsetY *= scale;
      if (p.isDragging) {
        p.startX = p.startClientX - p.offsetX;
        p.startY = p.startClientY - p.offsetY;
      }
    }
    prevZoomRef.current = zoom;

    // Clamp offset to keep crop window filled with image
    const minX = dispW > cropSize ? cropHalf - dispW / 2 : 0;
    const maxX = dispW > cropSize ? dispW / 2 - cropHalf : 0;
    const minY = dispH > cropSize ? cropHalf - dispH / 2 : 0;
    const maxY = dispH > cropSize ? dispH / 2 - cropHalf : 0;

    p.offsetX = Math.max(minX, Math.min(maxX, p.offsetX));
    p.offsetY = Math.max(minY, Math.min(maxY, p.offsetY));
    setOffset({ x: p.offsetX, y: p.offsetY });
  }, [zoom, imgNatural]);

  const fitZoom = fitZoomRef.current;
  const minZoom = fitZoom * 0.5;
  const maxZoom = fitZoom * 8;

  function getClampedOffset(offsetX: number, offsetY: number) {
    const container = containerRef.current;
    if (!container || !imgNatural.w || !imgNatural.h) return { x: offsetX, y: offsetY };
    const size = container.clientWidth;
    const cropSize = size * 0.8;
    const cropHalf = cropSize / 2;
    const dispW = imgNatural.w * zoom;
    const dispH = imgNatural.h * zoom;

    const minX = dispW > cropSize ? cropHalf - dispW / 2 : 0;
    const maxX = dispW > cropSize ? dispW / 2 - cropHalf : 0;
    const minY = dispH > cropSize ? cropHalf - dispH / 2 : 0;
    const maxY = dispH > cropSize ? dispH / 2 - cropHalf : 0;

    return {
      x: Math.max(minX, Math.min(maxX, offsetX)),
      y: Math.max(minY, Math.min(maxY, offsetY)),
    };
  }

  function syncOffsetToState() {
    const clamped = getClampedOffset(
      panRef.current.offsetX,
      panRef.current.offsetY
    );
    panRef.current.offsetX = clamped.x;
    panRef.current.offsetY = clamped.y;
    setOffset({ x: clamped.x, y: clamped.y });
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (isPinchingRef.current) return;
    const p = panRef.current;
    p.isDragging = true;
    p.startX = e.clientX - p.offsetX;
    p.startY = e.clientY - p.offsetY;
    p.startClientX = e.clientX;
    p.startClientY = e.clientY;
  }

  function handlePointerMove(e: React.PointerEvent) {
    const p = panRef.current;
    if (!p.isDragging) return;
    p.offsetX = e.clientX - p.startX;
    p.offsetY = e.clientY - p.startY;
    if (imgRef.current) {
      imgRef.current.style.transform = `translate(calc(-50% + ${p.offsetX}px), calc(-50% + ${p.offsetY}px))`;
    }
  }

  function handlePointerUp() {
    const p = panRef.current;
    if (!p.isDragging) return;
    p.isDragging = false;
    syncOffsetToState();
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      isPinchingRef.current = true;
      const p = panRef.current;
      if (p.isDragging) {
        p.isDragging = false;
        syncOffsetToState();
      }
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current.initialDist = Math.hypot(dx, dy);
      pinchRef.current.initialZoom = zoom;
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && isPinchingRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = dist / pinchRef.current.initialDist;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, pinchRef.current.initialZoom * scale));
      setZoom(newZoom);
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) {
      isPinchingRef.current = false;
    }
  }

  function handleSliderPointerDown() {
    if (imgRef.current) imgRef.current.style.transition = 'none';
  }

  function handleSliderPointerUp() {
    if (imgRef.current) {
      imgRef.current.style.transition = 'transform 0.15s ease-out';
      setTimeout(() => {
        if (imgRef.current) imgRef.current.style.transition = '';
      }, 200);
    }
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((z) => Math.max(minZoom, Math.min(maxZoom, z + delta)));
  }

  function handleCrop() {
    if (!containerRef.current || !imgRef.current || !imgNatural.w || !imgNatural.h) return;

    const size = containerRef.current.clientWidth;
    const cropSize = size * 0.8;
    const cropGap = (size - cropSize) / 2;
    const dispW = imgNatural.w * zoom;
    const dispH = imgNatural.h * zoom;
    const imgLeft = (size - dispW) / 2 + offset.x;
    const imgTop = (size - dispH) / 2 + offset.y;

    const srcX = Math.max(0, (cropGap - imgLeft) / zoom);
    const srcY = Math.max(0, (cropGap - imgTop) / zoom);
    const srcW = Math.min(imgNatural.w - srcX, cropSize / zoom);
    const srcH = Math.min(imgNatural.h - srcY, cropSize / zoom);

    const outputSize = 1200;
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, outputSize, outputSize);
    ctx.drawImage(
      imgRef.current,
      srcX, srcY,
      srcW, srcH,
      0, 0,
      outputSize, outputSize
    );

    canvas.toBlob((blob) => {
      if (blob) onCrop(blob);
    }, 'image/jpeg', 0.92);
  }

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
      >
        {imgNatural.w > 0 && (
          <>
            <img
              ref={imgRef}
              src={previewUrl}
              alt="裁切預覽"
              className="absolute select-none"
              draggable={false}
              style={{
                width: imgNatural.w * zoom,
                height: imgNatural.h * zoom,
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                pointerEvents: 'none',
              }}
            />

            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute"
                style={{
                  left: '10%',
                  top: '10%',
                  width: '80%',
                  height: '80%',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                }}
              >
                <div className="h-full w-full border-2 border-white/70" />
                <span className="absolute right-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] leading-none text-white/70">
                  1:1
                </span>
                <div className="pointer-events-none absolute inset-0">
                  <div className="h-full w-full bg-[linear-gradient(transparent_calc(50%-1px),rgba(255,255,255,0.3)_calc(50%-1px),rgba(255,255,255,0.3)_calc(50%+1px),transparent_calc(50%+1px)),linear-gradient(to_right,transparent_calc(50%-1px),rgba(255,255,255,0.3)_calc(50%-1px),rgba(255,255,255,0.3)_calc(50%+1px),transparent_calc(50%+1px))]" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 px-2">
        <span className="text-xs text-neutral-400">−</span>
        <input
          type="range"
          min={minZoom}
          max={maxZoom}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          onPointerDown={handleSliderPointerDown}
          onPointerUp={handleSliderPointerUp}
          className="flex-1 accent-neutral-900"
        />
        <span className="text-xs text-neutral-400">+</span>
        <span className="w-14 text-right text-xs tabular-nums text-neutral-500">
          {Math.round(zoom / fitZoomRef.current * 100)}%
        </span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-neutral-500 active:scale-[0.99]"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleCrop}
          className="flex-1 rounded-2xl bg-neutral-900 px-4 py-3 text-sm text-white active:scale-[0.99]"
        >
          確認裁切
        </button>
      </div>
    </div>
  );
}
