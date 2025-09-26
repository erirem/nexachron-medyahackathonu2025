'use client';

import type { JSX } from 'react';
import Image from 'next/image';
import type { DashboardNewsItem } from './types';

interface SpotifyNewsCardProps {
  readonly item: DashboardNewsItem;
}

const categoryThemes: Record<string, { surface: string; icon: string; brief: string; imageTint: string }> = {
  finans: {
    surface: 'bg-gradient-to-b from-[#2f4d7a] via-[#233a5c] to-[#16263c]',
    icon: 'bg-[#3a83ff]',
    brief: 'bg-[#3a83ff]/18 text-[#b3d4ff]',
    imageTint: 'bg-[#3a83ff]/16'
  },
  teknoloji: {
    surface: 'bg-gradient-to-b from-[#3a2c64] via-[#2a2050] to-[#1a1435]',
    icon: 'bg-[#9c6bff]',
    brief: 'bg-[#9c6bff]/20 text-[#e0cafe]',
    imageTint: 'bg-[#9c6bff]/16'
  },
  savunma: {
    surface: 'bg-gradient-to-b from-[#603023] via-[#4b2219] to-[#2c130f]',
    icon: 'bg-[#ff7d3a]',
    brief: 'bg-[#ff7d3a]/22 text-[#ffd5bc]',
    imageTint: 'bg-[#ff7d3a]/18'
  },
  diplomasi: {
    surface: 'bg-gradient-to-b from-[#26435f] via-[#1e3348] to-[#132233]',
    icon: 'bg-[#4f9dff]',
    brief: 'bg-[#4f9dff]/20 text-[#b6d7ff]',
    imageTint: 'bg-[#4f9dff]/16'
  },
  enerji: {
    surface: 'bg-gradient-to-b from-[#275c3a] via-[#1f452c] to-[#142b1d]',
    icon: 'bg-[#30de7b]',
    brief: 'bg-[#30de7b]/20 text-[#c0fddc]',
    imageTint: 'bg-[#30de7b]/18'
  },
  saglik: {
    surface: 'bg-gradient-to-b from-[#1f4652] via-[#173642] to-[#0f242d]',
    icon: 'bg-[#20c9ba]',
    brief: 'bg-[#20c9ba]/22 text-[#aaf4eb]',
    imageTint: 'bg-[#20c9ba]/18'
  },
  ekonomi: {
    surface: 'bg-gradient-to-b from-[#5c3b17] via-[#452d13] to-[#291a0b]',
    icon: 'bg-[#ffad33]',
    brief: 'bg-[#ffad33]/22 text-[#ffe0a8]',
    imageTint: 'bg-[#ffad33]/18'
  },
  cevre: {
    surface: 'bg-gradient-to-b from-[#1f4c38] via-[#19392c] to-[#10251d]',
    icon: 'bg-[#3fe0a7]',
    brief: 'bg-[#3fe0a7]/20 text-[#c7f8e6]',
    imageTint: 'bg-[#3fe0a7]/18'
  },
  spor: {
    surface: 'bg-gradient-to-b from-[#24426b] via-[#1a3354] to-[#10213b]',
    icon: 'bg-[#45c2ff]',
    brief: 'bg-[#45c2ff]/18 text-[#c3ecff]',
    imageTint: 'bg-[#45c2ff]/16'
  },
  default: {
    surface: 'bg-gradient-to-b from-[#232a3b] via-[#1b2130] to-[#111826]',
    icon: 'bg-[#5aa2ff]',
    brief: 'bg-[#5aa2ff]/18 text-[#c7e2ff]',
    imageTint: 'bg-[#5aa2ff]/16'
  }
};

function normalizeCategory(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z]/g, '');
}

const overlaySnippets = [
  'Günün özetine göz at',
  'Derinlemesine analiz',
  'Saha haberi anlık',
  'Uzman yorumu hazır',
  'Kısa notlarla öğren',
  'Editör seçkisi'
];

function getOverlayCopy(index: number): string {
  return overlaySnippets[index % overlaySnippets.length];
}

function getBriefLabel(item: DashboardNewsItem): string {
  if (item.impact === 'Yüksek') {
    return 'Sıcak Haber';
  }
  if (item.impact === 'Orta') {
    return 'Gündemde';
  }
  return 'Takipte';
}

function getTagline(item: DashboardNewsItem): string {
  return item.tags?.[0] ?? item.category;
}

const sentimentColors = {
  positive: 'bg-[#22a45b]',
  neutral: 'bg-[#3a7bd5]',
  negative: 'bg-[#d23b57]'
} as const;

export function SpotifyNewsCard({ item }: SpotifyNewsCardProps): JSX.Element {
  const normalized = normalizeCategory(item.category);
  const theme = categoryThemes[normalized] ?? categoryThemes.default;

  const overlayCopy = getOverlayCopy(Number(item.id.replace(/\D/g, '') || 0));
  const briefLabel = getBriefLabel(item);
  const tagline = getTagline(item);

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 ${theme.surface} text-white shadow-[0_22px_48px_rgba(2,8,20,0.45)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-white/15 hover:shadow-[0_32px_68px_rgba(2,10,28,0.55)]`}
    >
      <div className="absolute inset-0 bg-white/6 mix-blend-overlay" aria-hidden />

      <div className="relative flex flex-1 flex-col gap-6 p-6">
        <header className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)] ${theme.icon}`}>
            {item.category.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.3em] ${theme.brief}`}>
                {briefLabel}
              </span>
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-white/55">
                {item.category}
              </span>
            </div>
            <h3 className="text-xl font-semibold leading-snug text-white line-clamp-3">{item.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70">
                  <circle cx="12" cy="12" r="7" />
                  <path d="M12 7v5l3 2" />
                </svg>
                {item.readingTime}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
              <span>{item.dateline}</span>
            </div>
          </div>
        </header>

        <div className={`relative overflow-hidden rounded-xl border border-white/10 ${theme.imageTint} aspect-video`}>
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#050a13]/88 via-[#081429]/80 to-[#0b1d33]/88 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute inset-0 flex flex-col justify-between p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-white/25 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-white shadow-[0_12px_24px_rgba(0,0,0,0.45)]">
                {overlayCopy}
              </span>
              <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.32em] text-white/60">
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70">
                    <circle cx="12" cy="12" r="7" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  {item.readingTime}
                </span>
                <span className="h-0.5 w-0.5 rounded-full bg-white/40" aria-hidden />
                <span>{item.dateline}</span>
              </div>
            </div>

            <div className="space-y-4 text-white">
              <p className="text-base font-semibold leading-snug">{item.summary}</p>
              {item.detail && (
                <p className="text-sm text-white/85 leading-relaxed line-clamp-3">{item.detail}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" opacity="0.2" fill="currentColor" />
                  <path d="M12 7v6l3 2" />
                </svg>
                AI Özet
              </button>
              <button
                type="button"
                className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
                Sesli Dinle
              </button>
              <button
                type="button"
                className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4h12a1 1 0 011 1v15l-7-4-7 4V5a1 1 0 011-1z" />
                </svg>
                Kaydet
              </button>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="rounded px-2 py-1 bg-black/65 backdrop-blur-sm">
              <span className="text-white text-xs font-medium">{item.timestamp}</span>
            </div>
          </div>

          <div className={`absolute top-3 right-3 h-2 w-2 rounded-full ${sentimentColors[item.sentiment]} animate-pulse`} />
          <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-white">
            {tagline}
          </div>
        </div>

        <section className="flex flex-1 flex-col justify-between gap-3 text-sm leading-relaxed text-white/75">
          <p className="line-clamp-3">{item.summary}</p>
          <footer className="flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.24em] text-white/60">
            <span>{item.timestamp}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-white/35" aria-hidden />
            <span>{item.impact}</span>
          </footer>
        </section>
      </div>
    </article>
  );
}
