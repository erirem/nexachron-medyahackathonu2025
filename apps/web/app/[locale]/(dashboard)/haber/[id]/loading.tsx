export default function Loading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)]">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex gap-8 lg:h-[calc(100vh-4rem)]">
          <main className="flex-1 min-w-0">
            <div className="lg:h-full lg:overflow-y-auto lg:pr-6 lg:pb-12">
              <div className="animate-pulse space-y-6">
                <div className="h-10 w-3/4 rounded-md bg-slate-700/60" />
                <div className="h-5 w-1/2 rounded-md bg-slate-700/50" />
                <div className="aspect-video w-full rounded-xl bg-slate-700/40" />
                <div className="space-y-3">
                  <div className="h-4 w-full rounded-md bg-slate-700/40" />
                  <div className="h-4 w-11/12 rounded-md bg-slate-700/40" />
                  <div className="h-4 w-10/12 rounded-md bg-slate-700/30" />
                  <div className="h-4 w-9/12 rounded-md bg-slate-700/30" />
                </div>
              </div>
            </div>
          </main>
          <aside className="hidden lg:block w-[360px]">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-1/2 rounded-md bg-slate-700/50" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 rounded-md bg-slate-700/40" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-10/12 rounded-md bg-slate-700/40" />
                    <div className="h-4 w-8/12 rounded-md bg-slate-700/30" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


