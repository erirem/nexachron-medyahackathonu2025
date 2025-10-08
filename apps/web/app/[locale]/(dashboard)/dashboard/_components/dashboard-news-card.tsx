'use client';

import { type JSX, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { addBookmark, removeBookmark } from '@/services/api';
import { useLocale } from 'next-intl';
import type { DashboardNewsItem } from './types';
import { SafeImage } from './safe-image';

interface DashboardNewsCardProps {
  readonly item: DashboardNewsItem;
}

const categoryThemes: Record<string, { surface: string; icon: string; brief: string; imageTint: string; accent: string; border: string }> = {
  gundem: {
    surface: 'bg-gradient-to-b from-[#1e3a5f] via-[#15304a] to-[#0d1f35]',
    icon: 'bg-[#4a90e2]',
    brief: 'bg-[#4a90e2]/20 text-[#b8d4f0]',
    imageTint: 'bg-[#4a90e2]/16',
    accent: 'from-[#4a90e2] to-[#357abd]',
    border: 'border-[#4a90e2]/30'
  },
  finans: {
    surface: 'bg-gradient-to-b from-[#2f4d7a] via-[#233a5c] to-[#16263c]',
    icon: 'bg-[#3a83ff]',
    brief: 'bg-[#3a83ff]/18 text-[#b3d4ff]',
    imageTint: 'bg-[#3a83ff]/16',
    accent: 'from-[#3a83ff] to-[#2b6bcc]',
    border: 'border-[#3a83ff]/30'
  },
  teknoloji: {
    surface: 'bg-gradient-to-b from-[#3a2c64] via-[#2a2050] to-[#1a1435]',
    icon: 'bg-[#9c6bff]',
    brief: 'bg-[#9c6bff]/20 text-[#e0cafe]',
    imageTint: 'bg-[#9c6bff]/16',
    accent: 'from-[#9c6bff] to-[#7c4dcc]',
    border: 'border-[#9c6bff]/30'
  },
  savunma: {
    surface: 'bg-gradient-to-b from-[#603023] via-[#4b2219] to-[#2c130f]',
    icon: 'bg-[#ff7d3a]',
    brief: 'bg-[#ff7d3a]/22 text-[#ffd5bc]',
    imageTint: 'bg-[#ff7d3a]/18',
    accent: 'from-[#ff7d3a] to-[#e55a2b]',
    border: 'border-[#ff7d3a]/30'
  },
  diplomasi: {
    surface: 'bg-gradient-to-b from-[#26435f] via-[#1e3348] to-[#132233]',
    icon: 'bg-[#4f9dff]',
    brief: 'bg-[#4f9dff]/20 text-[#b6d7ff]',
    imageTint: 'bg-[#4f9dff]/16',
    accent: 'from-[#4f9dff] to-[#3d7acc]',
    border: 'border-[#4f9dff]/30'
  },
  enerji: {
    surface: 'bg-gradient-to-b from-[#275c3a] via-[#1f452c] to-[#142b1d]',
    icon: 'bg-[#30de7b]',
    brief: 'bg-[#30de7b]/20 text-[#c0fddc]',
    imageTint: 'bg-[#30de7b]/18',
    accent: 'from-[#30de7b] to-[#26b865]',
    border: 'border-[#30de7b]/30'
  },
  saglik: {
    surface: 'bg-gradient-to-b from-[#1f4652] via-[#173642] to-[#0f242d]',
    icon: 'bg-[#20c9ba]',
    brief: 'bg-[#20c9ba]/22 text-[#aaf4eb]',
    imageTint: 'bg-[#20c9ba]/18',
    accent: 'from-[#20c9ba] to-[#1ba89a]',
    border: 'border-[#20c9ba]/30'
  },
  ekonomi: {
    surface: 'bg-gradient-to-b from-[#5c3b17] via-[#452d13] to-[#291a0b]',
    icon: 'bg-[#ffad33]',
    brief: 'bg-[#ffad33]/22 text-[#ffe0a8]',
    imageTint: 'bg-[#ffad33]/18',
    accent: 'from-[#ffad33] to-[#e6991a]',
    border: 'border-[#ffad33]/30'
  },
  cevre: {
    surface: 'bg-gradient-to-b from-[#1f4c38] via-[#19392c] to-[#10251d]',
    icon: 'bg-[#3fe0a7]',
    brief: 'bg-[#3fe0a7]/20 text-[#c7f8e6]',
    imageTint: 'bg-[#3fe0a7]/18',
    accent: 'from-[#3fe0a7] to-[#34c085]',
    border: 'border-[#3fe0a7]/30'
  },
  spor: {
    surface: 'bg-gradient-to-b from-[#24426b] via-[#1a3354] to-[#10213b]',
    icon: 'bg-[#45c2ff]',
    brief: 'bg-[#45c2ff]/18 text-[#c3ecff]',
    imageTint: 'bg-[#45c2ff]/16',
    accent: 'from-[#45c2ff] to-[#3699cc]',
    border: 'border-[#45c2ff]/30'
  },
  dunya: {
    surface: 'bg-gradient-to-b from-[#2d1b69] via-[#221452] to-[#160d3a]',
    icon: 'bg-[#8b5cf6]',
    brief: 'bg-[#8b5cf6]/20 text-[#d1c4f0]',
    imageTint: 'bg-[#8b5cf6]/16',
    accent: 'from-[#8b5cf6] to-[#7c3aed]',
    border: 'border-[#8b5cf6]/30'
  },
  politika: {
    surface: 'bg-gradient-to-b from-[#6d3f58] via-[#553146] to-[#3d2434]',
    icon: 'bg-[#f0a3c3]',
    brief: 'bg-[#f0a3c3]/18 text-[#fbe1ed]',
    imageTint: 'bg-[#f0a3c3]/14',
    accent: 'from-[#f3b4ce] to-[#d78ea7]',
    border: 'border-[#f0a3c3]/25'
  },
  turizm: {
    surface: 'bg-gradient-to-b from-[#0f4c3a] via-[#0c3a2d] to-[#082820]',
    icon: 'bg-[#10b981]',
    brief: 'bg-[#10b981]/20 text-[#a7f3d0]',
    imageTint: 'bg-[#10b981]/16',
    accent: 'from-[#10b981] to-[#059669]',
    border: 'border-[#10b981]/30'
  },
  tarim: {
    surface: 'bg-gradient-to-b from-[#365314] via-[#2a3f0f] to-[#1e2b0a]',
    icon: 'bg-[#84cc16]',
    brief: 'bg-[#84cc16]/20 text-[#d9f99d]',
    imageTint: 'bg-[#84cc16]/16',
    accent: 'from-[#84cc16] to-[#65a30d]',
    border: 'border-[#84cc16]/30'
  },
  kultur: {
    surface: 'bg-gradient-to-b from-[#744024] via-[#5a301b] to-[#3f2213]',
    icon: 'bg-[#f2b48a]',
    brief: 'bg-[#f2b48a]/18 text-[#fde5d3]',
    imageTint: 'bg-[#f2b48a]/14',
    accent: 'from-[#f4c29d] to-[#d9986e]',
    border: 'border-[#f2b48a]/25'
  },
  sanat: {
    surface: 'bg-gradient-to-b from-[#581c87] via-[#431a5e] to-[#2d1b3d]',
    icon: 'bg-[#a855f7]',
    brief: 'bg-[#a855f7]/20 text-[#e9d5ff]',
    imageTint: 'bg-[#a855f7]/16',
    accent: 'from-[#a855f7] to-[#9333ea]',
    border: 'border-[#a855f7]/30'
  },
  egitim: {
    surface: 'bg-gradient-to-b from-[#1e40af] via-[#1e3a8a] to-[#1e2a5e]',
    icon: 'bg-[#3b82f6]',
    brief: 'bg-[#3b82f6]/20 text-[#bfdbfe]',
    imageTint: 'bg-[#3b82f6]/16',
    accent: 'from-[#3b82f6] to-[#2563eb]',
    border: 'border-[#3b82f6]/30'
  },
  bilim: {
    surface: 'bg-gradient-to-b from-[#0c4a6e] via-[#0a3a56] to-[#072a3e]',
    icon: 'bg-[#06b6d4]',
    brief: 'bg-[#06b6d4]/20 text-[#a5f3fc]',
    imageTint: 'bg-[#06b6d4]/16',
    accent: 'from-[#06b6d4] to-[#0891b2]',
    border: 'border-[#06b6d4]/30'
  },
  yasam: {
    surface: 'bg-gradient-to-b from-[#86506a] via-[#6a3f54] to-[#4c2d3c]',
    icon: 'bg-[#f2a9c8]',
    brief: 'bg-[#f2a9c8]/18 text-[#fde3ee]',
    imageTint: 'bg-[#f2a9c8]/14',
    accent: 'from-[#f4b7d2] to-[#d790ab]',
    border: 'border-[#f2a9c8]/25'
  },
  magazin: {
    surface: 'bg-gradient-to-b from-[#8a4242] via-[#6a3232] to-[#4a2323]',
    icon: 'bg-[#f2a6a6]',
    brief: 'bg-[#f2a6a6]/18 text-[#fde3e3]',
    imageTint: 'bg-[#f2a6a6]/14',
    accent: 'from-[#f3b5b5] to-[#d98c8c]',
    border: 'border-[#f2a6a6]/25'
  },
  default: {
    surface: 'bg-gradient-to-b from-[#232a3b] via-[#1b2130] to-[#111826]',
    icon: 'bg-[#5aa2ff]',
    brief: 'bg-[#5aa2ff]/18 text-[#c7e2ff]',
    imageTint: 'bg-[#5aa2ff]/16',
    accent: 'from-[#5aa2ff] to-[#3b82f6]',
    border: 'border-[#5aa2ff]/30'
  }
};

function normalizeCategory(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z]/g, '');
}

const sentimentDescriptions = {
  positive: 'Okur hissi • Olumlu',
  neutral: 'Okur hissi • Dengeli',
  negative: 'Okur hissi • Olumsuz'
} as const;

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

const insightIconMap = {
  impact: () => (
    <svg className="h-4 w-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h7l-1 8 11-12h-7z" />
    </svg>
  ),
  sentiment: () => (
    <svg className="h-4 w-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  views: () => (
    <svg className="h-4 w-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  shares: () => (
    <svg className="h-4 w-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  ),
  likes: () => (
    <svg className="h-4 w-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  readingTime: () => (
    <svg className="h-4 w-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  category: () => (
    <svg className="h-4 w-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  ),
  tag: () => (
    <svg className="h-4 w-4 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  )
} satisfies Record<string, () => JSX.Element>;

type InsightItem = {
  readonly key: keyof typeof insightIconMap;
  readonly label: string;
  readonly value: string;
  readonly icon: () => JSX.Element;
};

function formatCompactNumber(value?: number): string {
  if (value === undefined || value === null) {
    return 'Yeni';
  }

  return new Intl.NumberFormat('tr-TR', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}

function buildInsightItems(item: DashboardNewsItem, tagline: string): readonly InsightItem[] {
  const items: InsightItem[] = [
    {
      key: 'impact',
      label: 'Yayın etkisi',
      value: item.impact,
      icon: insightIconMap.impact
    },
    {
      key: 'sentiment',
      label: 'Okur hissi',
      value: sentimentDescriptions[item.sentiment],
      icon: insightIconMap.sentiment
    }
  ];

  if (item.viewCount !== undefined) {
    items.push({
      key: 'views',
      label: 'Okunma',
      value: formatCompactNumber(item.viewCount),
      icon: insightIconMap.views
    });
  }

  if (item.shareCount !== undefined) {
    items.push({
      key: 'shares',
      label: 'Paylaşım',
      value: formatCompactNumber(item.shareCount),
      icon: insightIconMap.shares
    });
  }

  if (item.likeCount !== undefined) {
    items.push({
      key: 'likes',
      label: 'Beğeni',
      value: formatCompactNumber(item.likeCount),
      icon: insightIconMap.likes
    });
  }

  const fallbackCandidates: InsightItem[] = [
    {
      key: 'readingTime',
      label: 'Okuma süresi',
      value: item.readingTime,
      icon: insightIconMap.readingTime
    },
    {
      key: 'category',
      label: 'Kategori',
      value: item.category,
      icon: insightIconMap.category
    },
    {
      key: 'tag',
      label: 'Odak etiketi',
      value: tagline,
      icon: insightIconMap.tag
    }
  ];

  for (const candidate of fallbackCandidates) {
    if (!items.some((insight) => insight.key === candidate.key) && items.length < 4) {
      items.push(candidate);
    }
  }

  return items.slice(0, 4);
}

const sentimentColors = {
  positive: 'bg-[#22a45b]',
  neutral: 'bg-[#3a7bd5]',
  negative: 'bg-[#d23b57]'
} as const;

export function DashboardNewsCard({ item }: DashboardNewsCardProps): JSX.Element {
  const locale = useLocale();
  const normalized = normalizeCategory(item.category);
  const theme = categoryThemes[normalized] ?? categoryThemes.default;
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const overlayCopy = getOverlayCopy(Number(item.id.replace(/\D/g, '') || 0));
  const briefLabel = getBriefLabel(item);
  const tagline = getTagline(item);
  const insightItems = buildInsightItems(item, tagline);

  return (
    <Link href={`/${locale}/haber/${item.id}`} className="block h-full">
      <article className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border ${theme.border} ${theme.surface} text-white shadow-[0_24px_56px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-opacity-50 hover:shadow-[0_36px_80px_rgba(0,0,0,0.65)] cursor-pointer`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-transparent mix-blend-overlay" aria-hidden />
      <div className="absolute inset-0 opacity-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 group-hover:opacity-100" aria-hidden />

      <div className="relative flex flex-1 flex-col gap-6 p-6">
        <header className="flex items-start">
          <div className="flex-1 min-w-0 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.35em] backdrop-blur-sm ${theme.brief}`}>
                {briefLabel}
              </span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/60 transition-colors duration-300 group-hover:text-white/80">
                {item.category}
              </span>
            </div>
            <h3 className="text-[1.35rem] font-bold leading-[1.3] text-white line-clamp-3 transition-colors duration-300 group-hover:text-white/95 mb-4">
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
          <SafeImage
            src={item.imageUrl}
            alt={item.title}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
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
          </div>
        </div>

        <section className="flex flex-1 flex-col gap-3 text-sm leading-relaxed text-white/75">
          <p className="line-clamp-3 transition-opacity duration-300 group-hover:opacity-0">{item.summary}</p>
          {item.detail && (
            <p className="text-white/65 line-clamp-2 text-[0.9rem] transition-opacity duration-300 group-hover:opacity-0">
              {item.detail}
            </p>
          )}
          <div className="grid grid-cols-1 gap-2 text-[0.7rem] transition-opacity duration-300 group-hover:opacity-0 sm:grid-cols-2">
            {insightItems.slice(0, 2).map((insight) => (
              <div
                key={`preview-${insight.key}`}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/8 text-white/80">
                  {insight.icon()}
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-[0.55rem] uppercase tracking-[0.18em] text-white/55">
                    {insight.label}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {insight.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <footer className="mt-auto flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.24em] text-white/60 transition-opacity duration-300 group-hover:opacity-0">
            <span>{overlayCopy}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-white/35" aria-hidden />
            <span>{`Etkisi • ${item.impact}`}</span>
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
              <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${theme.accent}/20 border ${theme.border} backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white`}>
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
            <div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${theme.accent} rounded-full animate-pulse`} style={{width: '40%'}} />
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
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (saving) return;
                  try {
                    setSaving(true);
                    if (!saved) {
                      await addBookmark(item.id);
                      setSaved(true);
                    } else {
                      await removeBookmark(item.id);
                      setSaved(false);
                    }
                  } finally {
                    setSaving(false);
                  }
                }}
                className={`group/btn flex items-center gap-1.5 rounded-lg bg-gradient-to-r ${theme.accent}/20 border ${theme.border} px-3 py-2 text-xs font-medium text-white backdrop-blur-sm transition-all hover:scale-105`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
                {saved ? 'Kaydedildi' : 'Kaydet'}
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
            
            <div className="flex items-center gap-3 text-xs text-white/55">
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h5l2 5h9" />
                  <path d="M7 13h8l3-5" />
                  <circle cx="7" cy="21" r="2" />
                  <circle cx="17" cy="21" r="2" />
                </svg>
                Canlı akışta takip et
              </span>
            </div>
          </div>
          
          {/* Insight Badges */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-3">
            {[{
              label: 'Yayın Tarihi',
              value: item.timestamp
            }, {
              label: 'Okuma Süresi',
              value: item.readingTime
            }, {
              label: 'Odak Başlığı',
              value: tagline
            }].map((meta) => (
              <div
                key={meta.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70"
              >
                <span className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/55">
                  {meta.label}
                </span>
                <p className="mt-1 text-sm font-medium text-white/90">
                  {meta.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
    </Link>
  );
}
