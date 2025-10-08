"use client";

import type { JSX } from "react";

export default function LocaleSegmentLoading(): JSX.Element {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[radial-gradient(circle_at_top_left,#0e1a2a_0%,#0b1422_55%,#070e17_100%)] text-white">
      <div className="relative flex w-full max-w-[520px] flex-col items-center gap-6 px-8">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0f6acd] to-[#1a8dff] shadow-[0_18px_44px_rgba(9,100,177,0.35)]">
          <span className="text-lg font-extrabold tracking-widest">AA</span>
          <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 animate-ping rounded-full bg-white/70" aria-hidden />
          <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 rounded-full bg-white/90" aria-hidden />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold">Anadolu Ajansı</h2>
          <p className="mt-1 text-sm text-white/70">Gündemin nabzı yükleniyor…</p>
        </div>

        <NewsTickerSkeleton />

        <div className="mt-2 h-1 w-64 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[loadingbar_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#0f6acd] to-[#1a8dff]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loadingbar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

function NewsTickerSkeleton(): JSX.Element {
  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_42px_rgba(10,94,173,0.18)]">
      <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-white/60">
        <span className="inline-block h-2 w-2 rounded-full bg-[#0f6acd]" />
        Canlı Bülten
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 h-24 w-full animate-pulse rounded-xl bg-white/10" />
            <div className="mb-1 h-3 w-3/4 animate-pulse rounded bg-white/15" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}


