'use client';

import { type JSX } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { DashboardNewsItem } from './types';

interface DashboardNewsCardProps {
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

export function DashboardNewsCard({ item }: DashboardNewsCardProps): JSX.Element {
  const normalized = normalizeCategory(item.category);
  const theme = categoryThemes[normalized] ?? categoryThemes.default;

  const overlayCopy = getOverlayCopy(Number(item.id.replace(/\D/g, '') || 0));
  const briefLabel = getBriefLabel(item);
  const tagline = getTagline(item);

  return (
    <Link href={`/haber/${item.id}`} className="block h-full">
      <article className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 ${theme.surface} text-white shadow-[0_24px_56px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_36px_80px_rgba(0,0,0,0.65)] cursor-pointer`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent mix-blend-overlay" aria-hidden />
      <div className="absolute inset-0 opacity-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 group-hover:opacity-100" aria-hidden />

      <div className="relative flex flex-1 flex-col gap-6 p-6">
        <header className="flex items-start gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[0_16px_36px_rgba(0,0,0,0.4)] transform transition-transform duration-300 group-hover:scale-110 ${theme.icon}`}>
            {item.category.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.35em] backdrop-blur-sm ${theme.brief}`}>
                {briefLabel}
              </span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/60 transition-colors duration-300 group-hover:text-white/80">
                {item.category}
              </span>
            </div>
            <h3 className="text-[1.35rem] font-bold leading-[1.3] text-white line-clamp-3 transition-colors duration-300 group-hover:text-white/95">
              {item.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/65">
              <span className="flex items-center gap-1.5 transition-all duration-300 group-hover:text-white/80">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-80">
                  <circle cx="12" cy="12" r="9" strokeDasharray="4 2" />
                  <path d="M12 7v5l3 2" />
                </svg>
                {item.readingTime}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden />
              <span className="transition-all duration-300 group-hover:text-white/80">{item.dateline}</span>
            </div>
          </div>
        </header>

        <div className={`relative overflow-hidden rounded-[20px] border border-white/10 ${theme.imageTint} aspect-[16/10] group`}>
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
          
          {/* Floating elements with animation */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 transform transition-all duration-300 group-hover:translate-y-[-4px]">
            <div className="rounded-full px-3 py-1.5 bg-black/70 backdrop-blur-md border border-white/10">
              <span className="text-white text-xs font-medium">{item.timestamp}</span>
            </div>
          </div>
          
          <div className={`absolute top-3 right-3 flex items-center gap-2`}>
            <div className={`h-2.5 w-2.5 rounded-full ${sentimentColors[item.sentiment]} shadow-lg animate-pulse`} />
            <div className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white border border-white/10">
              {tagline}
            </div>
          </div>
        </div>

        <section className="flex flex-1 flex-col justify-between gap-3 text-sm leading-relaxed text-white/75">
          <p className="line-clamp-3 transition-opacity duration-300 group-hover:opacity-0">{item.summary}</p>
          <footer className="flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.24em] text-white/60">
            <span>{item.timestamp}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-white/35" aria-hidden />
            <span>{item.impact}</span>
          </footer>
        </section>
      </div>

      {/* Hover Overlay - Tüm kartı kaplayan */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/85 to-black/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Hover Content - Tüm kart üzerinde */}
      <div className="absolute inset-0 flex flex-col p-6 opacity-0 transition-all duration-300 group-hover:opacity-100">
        {/* Top Section */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
                AI ile Özetlendi
              </span>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${sentimentColors[item.sentiment]} shadow-lg`} />
                <span className="text-xs font-medium text-white/70">{item.sentiment === 'positive' ? 'Olumlu' : item.sentiment === 'negative' ? 'Olumsuz' : 'Nötr'}</span>
              </div>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="relative h-1 bg-white/10 rounded-full overflow-hidden mb-3">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" style={{width: '40%'}} />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-3">
          <h3 className="text-lg font-bold text-white leading-tight">{item.title}</h3>
          
          {/* AI Summary with Bullet Points */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <p className="text-sm text-white/95 leading-relaxed flex-1">
                {item.summary}
              </p>
            </div>
            {item.detail && (
              <div className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <p className="text-sm text-white/85 leading-relaxed flex-1">
                  {item.detail}
                </p>
              </div>
            )}
          </div>
          
          {/* Tags with Icons */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            {item.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="rounded-full bg-white/10 border border-white/10 px-2.5 py-1 text-[0.7rem] text-white/80 hover:bg-white/20 transition-colors cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Bottom Actions - Enhanced */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button onClick={(e) => e.stopPropagation()} className="group/btn flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-400/20 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm transition-all hover:from-blue-600/30 hover:to-blue-500/30 hover:scale-105">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
                Kaydet
              </button>
              <button onClick={(e) => e.stopPropagation()} className="group/btn flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-400/20 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm transition-all hover:from-green-600/30 hover:to-green-500/30 hover:scale-105">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="10 8 16 12 10 16 10 8"/>
                </svg>
                Dinle
              </button>
              <button onClick={(e) => e.stopPropagation()} className="group/btn flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/20 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <path d="M8.6 13.5l6.8 4m0-11l-6.8 4"/>
                </svg>
                Paylaş
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-white/50">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>2.3k</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/50">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                </svg>
                <span>89%</span>
              </div>
            </div>
          </div>
          
          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-white/50">
            <div className="flex items-center gap-2">
              <span>{item.category}</span>
              <span>•</span>
              <span>{item.timestamp}</span>
              <span>•</span>
              <span>{item.readingTime}</span>
            </div>
            <span className="text-white/70 font-medium">{item.dateline}</span>
          </div>
        </div>
      </div>
    </article>
    </Link>
  );
}
