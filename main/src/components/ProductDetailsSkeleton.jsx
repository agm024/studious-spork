export default function ProductDetailsSkeleton() {
  return (
    <section className="container-pad py-10" aria-hidden="true">
      <div className="h-9 w-28 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse mb-6" />
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="w-full aspect-[4/3] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="mt-3 grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-16 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        </div>

        <div>
          <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="mt-3 h-8 w-5/6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="mt-5 h-9 w-52 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="mt-4 h-20 w-full rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="mt-6 h-24 w-full rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="mt-7 flex gap-3">
            <div className="h-12 flex-1 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-12 flex-1 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
