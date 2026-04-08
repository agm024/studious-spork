export default function ProductGridSkeleton({ count = 8 }) {
  const cards = Array.from({ length: count });

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-hidden="true">
      {cards.map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
        >
          <div className="h-40 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="mt-4 h-3 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="mt-2 h-4 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="mt-2 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="mt-4 h-5 w-28 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="mt-4 h-9 w-full rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
