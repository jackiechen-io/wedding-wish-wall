'use client';

import { useEffect, useState, useRef } from 'react';
import { useApprovedRealtime } from '@/hooks/useApprovedRealtime';
import CoverFlowTitle from './CoverFlowTitle';
import CoverFlowCard from './CoverFlowCard';
import CoverFlowProgress from './CoverFlowProgress';
import LoadingWall from './LoadingWall';
import QRCodeCard from './QRCodeCard';

const ROTATION_INTERVAL = 7000;

export default function MainDisplay() {
  const items = useApprovedRealtime();
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsLenRef = useRef(items.length);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!loadedRef.current && items.length >= 0) {
      loadedRef.current = true;
      setLoading(false);
    }
    if (items.length > 0 && items.length > itemsLenRef.current) {
      setCurrentIndex(0);
    }
    itemsLenRef.current = items.length;
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, ROTATION_INTERVAL);
    return () => clearInterval(id);
  }, [items.length]);

  if (loading && items.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        <img
          src="/background.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <CoverFlowTitle />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <LoadingWall />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        <img
          src="/background.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <CoverFlowTitle />

        {/* Central placeholder */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-white/30">
            <svg className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <p className="font-serif text-4xl text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:text-5xl">
            第一則祝福等你寫下
          </p>
          <p className="text-sm tracking-[0.2em] text-white/40">
            掃描 QR Code 上傳照片與祝福
          </p>
        </div>

        {/* QR code — visible on all screen sizes in empty state */}
        <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
          <QRCodeCard fixed={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <img
        src="/background.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <CoverFlowTitle />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pb-16 pt-24 sm:pb-20 sm:pt-28">
        <CoverFlowCard items={items} currentIndex={currentIndex} />
      </div>

      <CoverFlowProgress total={items.length} current={currentIndex} />

      <QRCodeCard />
    </div>
  );
}
