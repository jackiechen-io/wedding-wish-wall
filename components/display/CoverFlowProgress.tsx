'use client';

export default function CoverFlowProgress({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  if (total <= 1) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-30 flex items-center justify-center gap-2 sm:bottom-8 3xl:gap-3">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-700 ${
            i === current
              ? 'h-2 w-8 bg-white sm:h-2.5 sm:w-10 3xl:h-3 3xl:w-12'
              : 'h-1.5 w-1.5 bg-white/40 sm:h-2 sm:w-2 3xl:h-2.5 3xl:w-2.5'
          }`}
        />
      ))}
    </div>
  );
}
