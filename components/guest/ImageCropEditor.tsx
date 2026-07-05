'use client';

import { useRef, useState, useEffect } from 'react';

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
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });

  const previewUrl = URL.createObjectURL(file);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setImgNatural({ w, h });
      if (containerRef.current) {
        const containerSize = containerRef.current.clientWidth;
        if (containerSize > 0) {
          setZoom(Math.min(containerSize / w, containerSize / h));
        }
      }
    };
    img.src = previewUrl;
    return () => { URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const minZoom = 0.1;
  const maxZoom = 3;

  function handlePointerDown(e: React.PointerEvent) {
    if (!containerRef.current) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    containerRef.current.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }

  function handlePointerUp() {
    setIsDragging(false);
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.max(minZoom, Math.min(maxZoom, z + delta)));
  }

  function handleCrop() {
    const container = containerRef.current;
    if (!container || !imgNatural.w || !imgNatural.h) return;

    const size = container.clientWidth;
    const dispW = imgNatural.w * zoom;
    const dispH = imgNatural.h * zoom;
    const imgLeft = (size - dispW) / 2 + offset.x;
    const imgTop = (size - dispH) / 2 + offset.y;

    const srcX = Math.max(0, -imgLeft / zoom);
    const srcY = Math.max(0, -imgTop / zoom);
    const srcW = Math.min(imgNatural.w - srcX, size / zoom);
    const srcH = Math.min(imgNatural.h - srcY, size / zoom);

    const outputSize = 1200;
    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      container.querySelector('img')!,
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
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
      >
        {imgNatural.w > 0 && (
          <>
            <img
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
            <div className="pointer-events-none absolute inset-0 border-[3px] border-white/70">
              <div className="h-full w-full bg-[linear-gradient(transparent_calc(50%-1px),rgba(255,255,255,0.3)_calc(50%-1px),rgba(255,255,255,0.3)_calc(50%+1px),transparent_calc(50%+1px)),linear-gradient(to_right,transparent_calc(50%-1px),rgba(255,255,255,0.3)_calc(50%-1px),rgba(255,255,255,0.3)_calc(50%+1px),transparent_calc(50%+1px))]" />
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
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="flex-1 accent-neutral-900"
        />
        <span className="text-xs text-neutral-400">+</span>
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
