'use client';

import type { JSX } from 'react';
import { DashboardNewsCard } from './dashboard-news-card';
import { FeaturedNewsCarousel } from './featured-news-carousel';
import type { DashboardNewsItem } from './types';

interface DashboardNewsGridProps {
  readonly items: readonly DashboardNewsItem[];
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
  // Separate featured items (high impact or specific categories)
  const featuredItems = items.filter(item => 
    item.impact === 'Yüksek' || 
    ['Finans', 'Savunma', 'Teknoloji'].includes(item.category)
  ).slice(0, 5); // Take top 5 for carousel
  
  const regularItems = items.filter(item => !featuredItems.includes(item));
  const sponsoredItems = regularItems.filter(item => 
    item.tags.some(tag => tag.toLowerCase().includes('sponsor') || tag.toLowerCase().includes('reklam'))
  );
  const standardItems = regularItems.filter(item => !sponsoredItems.includes(item));
  
  return (
    <section className="w-full space-y-12">
      {/* Featured News Carousel */}
      {featuredItems.length > 0 && (
        <div className="-mx-6 sm:-mx-8 lg:-mx-12 px-6 sm:px-8 lg:px-12">
          <FeaturedNewsCarousel items={featuredItems} />
        </div>
      )}

      {/* Main Content */}
      <div>
        <div className="mb-8 flex items-baseline justify-between">
          <div>
            {title && (
              <h2 className="text-3xl font-bold text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-base text-white/70">
                {subtitle}
              </p>
            )}
          </div>
          {showAll && (
            <button
              type="button"
              className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition-all hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              Tümünü Gör
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-1">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>


        {/* Mixed Grid Layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Sponsored/Large Cards - Span 2 columns */}
          {sponsoredItems.slice(0, 2).map((item, index) => (
            <div key={item.id} className={`group relative ${
              index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
            }`}>
              <div className="absolute -top-3 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-sm whitespace-nowrap">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  SPONSORLU
                </span>
              </div>
              <DashboardNewsCard item={item} />
            </div>
          ))}
          
          {/* Regular Cards */}
          {standardItems.map((item) => (
            <div key={item.id} className="group">
              <DashboardNewsCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
