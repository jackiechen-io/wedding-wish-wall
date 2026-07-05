'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import type { DisplaySubmission } from '@/hooks/useApprovedRealtime';
import CarouselSlide from './CarouselSlide';
import CarouselControls from './CarouselControls';
import CarouselProgress from './CarouselProgress';

export default function CarouselOverlay({
  items,
  initialIndex,
  onClose,
}: {
  items: DisplaySubmission[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goNextRef = useRef(goNext);
  goNextRef.current = goNext;

  const goPrevRef = useRef(goPrev);
  goPrevRef.current = goPrev;

  // Auto-play
  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(id);
  }, [isPaused, items.length]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'ArrowLeft') goPrevRef.current();
      if (e.key === 'ArrowRight') goNextRef.current();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex select-none flex-col"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/background.webp"
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 active:scale-90 sm:right-6 sm:top-6 3xl:h-14 3xl:w-14"
        aria-label="Close carousel"
      >
        <svg className="h-5 w-5 3xl:h-7 3xl:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute left-4 top-4 z-20 rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur sm:left-6 sm:top-6 sm:px-4 sm:py-1.5 sm:text-sm 3xl:left-8 3xl:top-8 3xl:px-6 3xl:py-2 3xl:text-base">
        {currentIndex + 1} / {items.length}
      </div>

      {/* Slide */}
      <div className="relative z-10 flex flex-1 flex-col">
        <div key={currentIndex + items[currentIndex]?.id} className="flex-1 animate-fade-in">
          <CarouselSlide item={items[currentIndex]} />
        </div>
      </div>

      {/* Controls */}
      {items.length > 1 && (
        <CarouselControls onPrev={goPrev} onNext={goNext} />
      )}

      {/* Progress */}
      {items.length > 1 && (
        <div className="relative z-10">
          <CarouselProgress total={items.length} current={currentIndex} />
        </div>
      )}
    </div>
  );
}
