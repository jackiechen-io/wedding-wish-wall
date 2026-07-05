export default function LoadingWall() {
  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-7">
      {Array.from({ length: 14 }).map((_, i) => (
        <article
          key={i}
          className="animate-pulse rounded-2xl bg-white p-3 shadow-[0_12px_35px_rgba(0,0,0,0.06)]"
        >
          <div className="aspect-[4/3] rounded-lg bg-neutral-100" />
          <div className="mt-3 space-y-2 px-1">
            <div className="h-4 w-3/4 rounded bg-neutral-100" />
            <div className="h-3 w-1/3 rounded bg-neutral-100" />
          </div>
        </article>
      ))}
    </section>
  );
}
