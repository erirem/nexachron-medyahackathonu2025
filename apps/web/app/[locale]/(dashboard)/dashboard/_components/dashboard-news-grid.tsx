'use client';

import type { JSX } from 'react';
import { DashboardNewsCard } from './dashboard-news-card';
import type { DashboardNewsItem } from './types';

interface DashboardNewsGridProps {
  readonly items: DashboardNewsItem[];
  readonly title?: string;
  readonly subtitle?: string;
  readonly showAll?: boolean;
}

function getCategoryLabel(category: string): string {
  const categoryLabels: Record<string, string> = {
    'Finans': 'SICAK HABER • FİNANS',
    'Diplomasi': 'GÜNDEMDE • DİPLOMASİ', 
    'Savunma': 'SICAK HABER • SAVUNMA',
    'Teknoloji': 'GÜNDEMDE • TEKNOLOJİ',
    'Sağlık': 'ŞU SIRALAR POPÜLER • SAĞLIK',
    'Ekonomi': 'SICAK HABER • EKONOMİ',
    'Enerji': 'GÜNDEMDE • ENERJİ',
    'Çevre': 'GÜNDEMDE • ENERJİ', 
    'Turizm': 'ŞU SIRALAR POPÜLER • TURİZM',
    'Spor': 'SICAK HABER • SPOR',
    'Tarım': 'GÜNDEMDE • TARIM'
  };
  
  return categoryLabels[category] || `GÜNDEMDE • ${category.toUpperCase()}`;
}

export function DashboardNewsGrid({
  items,
  title = 'Öne çıkan haberler',
  subtitle,
  showAll = false
}: DashboardNewsGridProps): JSX.Element {
  return (
    <section className="w-full">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          {title && (
            <h2 className="text-2xl font-semibold text-white/90">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-white/60">
              {subtitle}
            </p>
          )}
        </div>
        {showAll && (
          <button
            type="button"
            className="rounded-full border border-white/10 px-4 py-1.5 text-sm font-semibold text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            Tümünü Gör
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col">
            <div className="mb-2">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-white/50">
                {getCategoryLabel(item.category)}
              </p>
            </div>
            <DashboardNewsCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
