'use client';

import { useApprovedRealtime } from '@/hooks/useApprovedRealtime';
import PolaroidCard from './PolaroidCard';

export default function MainDisplay() {
  const items = useApprovedRealtime();

  return (
    <main className="screen-wall min-h-screen overflow-hidden bg-[#F8F9FA] px-4 py-6 sm:px-10 sm:py-8">
      <header className="mb-8 text-center">
        <h1 className="font-serif text-5xl tracking-[0.18em] text-neutral-900">Our Wedding Wishes</h1>
        <p className="mt-3 text-sm tracking-[0.4em] text-neutral-400">LOVE · PHOTO · BLESSINGS</p>
      </header>

      {items.length === 0 ? (
        <div className="flex h-[65vh] items-center justify-center text-center">
          <div>
            <p className="font-serif text-4xl text-neutral-400">Waiting for blessings…</p>
            <p className="mt-4 text-sm tracking-[0.3em] text-neutral-300">SCAN QR CODE</p>
          </div>
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-7">
          {items.map((item) => <PolaroidCard key={item.id} item={item} />)}
        </section>
      )}
    </main>
  );
}
