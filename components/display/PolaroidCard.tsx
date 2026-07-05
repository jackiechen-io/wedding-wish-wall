import type { DisplaySubmission } from '@/hooks/useApprovedRealtime';

export default function PolaroidCard({ item }: { item: DisplaySubmission }) {
  return (
    <article
      className="polaroid animate-polaroid-in bg-white p-3 shadow-[0_12px_35px_rgba(0,0,0,0.10)]"
      style={{ transform: `rotate(${item.tilt}deg)` }}
    >
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={item.image_url}
          alt={item.message}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="px-1 pb-2 pt-3">
        <p className="line-clamp-2 font-serif text-lg text-neutral-800">{item.message}</p>
        <p className="mt-1 text-right text-xs text-neutral-400">— {item.nickname}</p>
      </div>
    </article>
  );
}
