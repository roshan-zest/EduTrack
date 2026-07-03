export function PageSkeleton() {
  return (
    <div className="fais-shell min-h-screen animate-pulse px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5">
      <div className="mx-auto flex max-w-[1520px] flex-col gap-4 lg:flex-row">
        <aside className="hidden w-[244px] shrink-0 rounded-[1.75rem] bg-slate-200/50 p-4 lg:block xl:w-[270px]">
          <div className="h-28 rounded-[1.5rem] bg-slate-200/70" />
          <div className="mt-5 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded-[1rem] bg-slate-200/70" />
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-[1.8rem] bg-slate-200/40 p-3.5 md:p-4.5 lg:p-5">
            <div className="rounded-[1.45rem] bg-slate-200/60 px-4 py-6 md:px-5">
              <div className="h-4 w-32 rounded bg-slate-300/70" />
              <div className="mt-3 h-8 w-72 max-w-full rounded-lg bg-slate-300/70" />
              <div className="mt-2 h-4 w-96 max-w-full rounded bg-slate-300/50" />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-[1.5rem] bg-slate-200/60" />
              ))}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-72 rounded-[1.85rem] bg-slate-200/50" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
