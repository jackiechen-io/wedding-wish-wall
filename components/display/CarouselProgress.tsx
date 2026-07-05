'use client';

export default function CarouselProgress({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2 pb-6 pt-4 3xl:gap-3">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          className={`rounded-full transition-all duration-500 ${
            i === current
              ? 'h-2 w-10 bg-white 3xl:h-3 3xl:w-14'
              : 'h-1.5 w-1.5 bg-white/40 hover:bg-white/60 3xl:h-2.5 3xl:w-2.5'
          }`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
}
