export function LoadingBar({ text, progress }: { text: string; progress: number }) {
  if (!text) return null;
  return (
    <div className="rounded-2xl bg-[#F8F9FA] p-4">
      <div className="mb-2 text-sm text-neutral-500">{text}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-neutral-900 transition-all duration-700 ease-out"
          style={{ width: `${Math.max(2, progress)}%` }}
        >
          <div className="h-full w-full animate-pulse rounded-full bg-neutral-700 opacity-30" />
        </div>
      </div>
    </div>
  );
}
