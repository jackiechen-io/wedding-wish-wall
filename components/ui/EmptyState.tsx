export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-8 text-center">
      <p className="font-serif text-xl text-neutral-700">{title}</p>
      {description && <p className="mt-2 text-sm text-neutral-400">{description}</p>}
    </div>
  );
}
