'use client';

import { useEffect, useState } from 'react';
import { useApprovedRealtime } from '@/hooks/useApprovedRealtime';
import PolaroidCard from './PolaroidCard';
import QRCodeCard from './QRCodeCard';
import LoadingWall from './LoadingWall';
import CarouselOverlay from './CarouselOverlay';

export default function MainDisplay() {
  const items = useApprovedRealtime();
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (items.length > 0) setLoading(false);
  }, [items]);

  return (
    <main className="screen-wall min-h-screen overflow-hidden bg-[#F8F9FA] px-4 py-6 sm:px-10 sm:py-8">
      <header className="mb-8 text-center">
        <h1 className="font-serif text-5xl tracking-[0.18em] text-neutral-900 3xl:text-7xl">Our Wedding Wishes</h1>
        <p className="mt-3 text-sm tracking-[0.4em] text-neutral-400 3xl:text-base">LOVE · PHOTO · BLESSINGS</p>
      </header>

      {loading && items.length === 0 ? (
        <LoadingWall />
      ) : items.length === 0 ? (
        <div className="flex h-[65vh] items-center justify-center text-center">
          <div>
            <p className="font-serif text-4xl text-neutral-400">Waiting for blessings…</p>
            <p className="mt-4 text-sm tracking-[0.3em] text-neutral-300">
              Scan the QR code to leave yours
            </p>
          </div>
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 3xl:grid-cols-4 4xl:grid-cols-5">
          {items.map((item, i) => (
            <div key={item.id} onClick={() => setSelectedIndex(i)} className="cursor-pointer">
              <PolaroidCard item={item} />
            </div>
          ))}
        </section>
      )}

      <QRCodeCard />

      {selectedIndex !== null && (
        <CarouselOverlay
          items={items}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </main>
  );
}
