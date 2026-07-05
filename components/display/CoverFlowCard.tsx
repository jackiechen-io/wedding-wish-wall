'use client';

import { useState } from 'react';
import type { DisplaySubmission } from '@/hooks/useApprovedRealtime';

type CardPosition = 'prev' | 'current' | 'next';

const GRADIENTS = [
  'from-pink-200 via-pink-100 to-white',
  'from-sky-200 via-sky-100 to-white',
  'from-purple-200 via-purple-100 to-white',
  'from-teal-200 via-teal-100 to-white',
  'from-amber-200 via-amber-100 to-white',
  'from-rose-200 via-rose-100 to-white',
];

function CoverFlowCardInner({ item, position }: { item: DisplaySubmission; position: CardPosition }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = !!item.image_url && !imgError;
  const gradientClass = GRADIENTS[parseInt(item.id.slice(-2), 36) % GRADIENTS.length];

  if (hasImage) {
    return (
      <div className="polaroid relative h-full w-full overflow-hidden rounded-2xl bg-white shadow-[0_12px_35px_rgba(0,0,0,0.15)]">
        <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
          <img
            src={item.image_url}
            alt={item.message}
            className="h-full w-full object-cover"
            decoding="async"
            draggable={false}
            onError={() => setImgError(true)}
          />
        </div>
        <div className="px-3 pb-3 pt-2">
          <p className="line-clamp-2 font-serif text-base leading-snug text-neutral-800 sm:text-lg">
            {item.message}
          </p>
          <p className="mt-0.5 text-right text-xs text-neutral-400 sm:text-sm">
            — {item.nickname}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="polaroid relative flex h-full w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br shadow-[0_12px_35px_rgba(0,0,0,0.15)]">
      <div className={`flex h-full w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${gradientClass} p-6 sm:p-8`}>
        <p className="line-clamp-4 text-center font-serif text-xl leading-relaxed text-neutral-800 sm:text-3xl">
          {item.message}
        </p>
        <p className="mt-4 text-right text-sm text-neutral-400 sm:mt-6 sm:text-base">
          — {item.nickname}
        </p>
      </div>
    </div>
  );
}

export default function CoverFlowCard({
  items,
  currentIndex,
}: {
  items: DisplaySubmission[];
  currentIndex: number;
}) {
  const total = items.length;
  const prevIndex = (currentIndex - 1 + total) % total;
  const nextIndex = (currentIndex + 1) % total;

  if (total === 0) return null;

  return (
    <div className="relative mx-auto flex h-full w-full max-w-5xl items-center justify-center 3xl:max-w-7xl">
      {/* Previous card */}
      <div className="cover-flow-card prev">
        <CoverFlowCardInner item={items[prevIndex]} position="prev" />
      </div>

      {/* Current card */}
      <div className="cover-flow-card current">
        <CoverFlowCardInner item={items[currentIndex]} position="current" />
      </div>

      {/* Next card */}
      <div className="cover-flow-card next">
        <CoverFlowCardInner item={items[nextIndex]} position="next" />
      </div>

      <style jsx>{`
        .cover-flow-card {
          position: absolute;
          transition: all 800ms cubic-bezier(0.4, 0, 0.2, 1);
          backface-visibility: hidden;
          transform-style: preserve-3d;
          aspect-ratio: 4 / 5;
          width: min(50vw, 340px);
        }

        .cover-flow-card.prev {
          transform: translateX(calc(min(-50vw, -340px) * 0.55)) translateZ(-80px) scale(0.75);
          filter: blur(2px);
          opacity: 0.5;
          z-index: 1;
          pointer-events: none;
        }

        .cover-flow-card.current {
          transform: translateX(0) translateZ(0) scale(1);
          filter: none;
          opacity: 1;
          z-index: 3;
        }

        .cover-flow-card.next {
          transform: translateX(calc(min(50vw, 340px) * 0.55)) translateZ(-80px) scale(0.75);
          filter: blur(2px);
          opacity: 0.5;
          z-index: 1;
          pointer-events: none;
        }

        @media (min-width: 640px) {
          .cover-flow-card {
            width: min(42vw, 380px);
          }
          .cover-flow-card.prev {
            transform: translateX(calc(min(-42vw, -380px) * 0.55)) translateZ(-120px) scale(0.8);
          }
          .cover-flow-card.next {
            transform: translateX(calc(min(42vw, 380px) * 0.55)) translateZ(-120px) scale(0.8);
          }
        }

        @media (min-width: 1024px) {
          .cover-flow-card {
            width: min(35vw, 420px);
          }
          .cover-flow-card.prev {
            transform: translateX(calc(min(-35vw, -420px) * 0.55)) translateZ(-150px) scale(0.85);
          }
          .cover-flow-card.next {
            transform: translateX(calc(min(35vw, 420px) * 0.55)) translateZ(-150px) scale(0.85);
          }
        }

        @media (min-width: 1920px) {
          .cover-flow-card {
            width: min(30vw, 480px);
          }
          .cover-flow-card.prev {
            transform: translateX(calc(min(-30vw, -480px) * 0.55)) translateZ(-200px) scale(0.85);
          }
          .cover-flow-card.next {
            transform: translateX(calc(min(30vw, 480px) * 0.55)) translateZ(-200px) scale(0.85);
          }
        }
      `}</style>
    </div>
  );
}
