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

function InstagramPost({ item }: { item: DisplaySubmission }) {
  const [imgError, setImgError] = useState(false);
  const [liked, setLiked] = useState(false);
  const hasImage = !!item.image_url && !imgError;
  const gradientClass = GRADIENTS[parseInt(item.id.slice(-2), 36) % GRADIENTS.length];
  const tags = item.hashtag
    ? item.hashtag.split(/[#,\s]+/).filter(Boolean).map((t) => `#${t}`)
    : [];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_35px_rgba(0,0,0,0.15)]">
      {/* Header — @username + follow icon */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1.5 sm:px-4 sm:pt-4 sm:pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-amber-300 text-[10px] font-bold text-white shadow-inner sm:h-8 sm:w-8 sm:text-xs">
            {item.nickname.charAt(0)}
          </div>
          <span className="text-xs font-semibold text-neutral-800 sm:text-sm">
            @{item.nickname}
          </span>
        </div>
        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 text-neutral-400 transition hover:border-neutral-500 hover:text-neutral-600 active:scale-90 sm:h-7 sm:w-7"
          aria-label="追蹤"
        >
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </button>
      </div>

      {/* Content area */}
      {hasImage ? (
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
      ) : (
        <div className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${gradientClass} p-4 sm:p-6`}>
          <p className="line-clamp-4 text-center font-handwriting text-lg leading-relaxed text-neutral-800 sm:text-2xl">
            {item.message}
          </p>
        </div>
      )}

      {/* Social actions */}
      <div className="flex items-center gap-3 px-3 pt-2 pb-0.5 sm:px-4 sm:pt-3 sm:pb-1">
        <button
          type="button"
          onClick={() => setLiked(!liked)}
          className="transition active:scale-90"
          aria-label="喜歡"
        >
          <svg
            className={`h-5 w-5 sm:h-6 sm:w-6 ${liked ? 'text-red-500' : 'text-neutral-700'}`}
            fill={liked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={liked ? 0 : 2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        <button type="button" className="transition active:scale-90" aria-label="留言">
          <svg className="h-5 w-5 text-neutral-700 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        <button type="button" className="transition active:scale-90" aria-label="分享">
          <svg className="h-5 w-5 text-neutral-700 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </button>
        <div className="flex-1" />
        <button type="button" className="transition active:scale-90" aria-label="更多">
          <svg className="h-5 w-5 text-neutral-700 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </button>
      </div>

      {/* Hashtags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pt-0.5 sm:px-4">
          {tags.map((tag) => (
            <span key={tag} className="text-[11px] font-medium text-blue-600 sm:text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Caption */}
      <div className="flex-1 px-3 pb-3 pt-0.5 sm:px-4 sm:pb-4 sm:pt-1">
        <p className="text-[11px] leading-relaxed text-neutral-700 sm:text-xs">
          <span className="font-semibold text-neutral-800">@{item.nickname}</span>{' '}
          {item.message}
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
      <div className="cover-flow-card prev">
        <InstagramPost item={items[prevIndex]} />
      </div>

      <div className="cover-flow-card current">
        <InstagramPost item={items[currentIndex]} />
      </div>

      <div className="cover-flow-card next">
        <InstagramPost item={items[nextIndex]} />
      </div>

      <style jsx>{`
        .cover-flow-card {
          position: absolute;
          transition: all 800ms cubic-bezier(0.4, 0, 0.2, 1);
          backface-visibility: hidden;
          transform-style: preserve-3d;
          aspect-ratio: 4 / 6;
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
