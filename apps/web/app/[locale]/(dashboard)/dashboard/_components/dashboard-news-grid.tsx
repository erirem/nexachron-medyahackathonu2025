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

function needsWideLayout(item: DashboardNewsItem): boolean {
  const titleLength = item.title.length;
  const summaryLength = item.summary.trim().length;
  const detailLength = item.detail.trim().length;
  const tagCount = item.tags.length;

  // Broaden layout for dense content so button group keeps a single row.
  return (
    titleLength > 110 ||
    summaryLength > 220 ||
    detailLength > 220 ||
    summaryLength + detailLength > 420 ||
    tagCount > 4
  );
}

export function DashboardNewsGrid({
  items,
  title = 'Öne çıkan haberler',
  subtitle,
  showAll = false
}: DashboardNewsGridProps): JSX.Element {
  // Add time-limited property to some news items (randomly select 2-3 items)
  const itemsWithTimeLimit = items.map((item, index) => {
    // Randomly select 2-3 items to be time-limited
    const shouldBeTimeLimited = Math.random() < 0.1 && index < 10; // 10% chance for first 10 items
    
    // Store time-limited news IDs in localStorage for persistence
    if (shouldBeTimeLimited && typeof window !== 'undefined') {
      const timeLimitedNews = JSON.parse(localStorage.getItem('timeLimitedNews') || '[]');
      if (!timeLimitedNews.includes(item.id)) {
        timeLimitedNews.push(item.id);
        localStorage.setItem('timeLimitedNews', JSON.stringify(timeLimitedNews));
      }
    }
    
    return {
      ...item,
      isTimeLimited: shouldBeTimeLimited
    };
  });

  // Separate featured items (high impact or specific categories)
  const featuredItems = itemsWithTimeLimit.filter(item => 
    item.impact === 'Yüksek' || 
    ['Finans', 'Savunma', 'Teknoloji'].includes(item.category)
  ).slice(0, 5); // Take top 5 for carousel
  
  const regularItems = itemsWithTimeLimit.filter(item => !featuredItems.includes(item));
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
        </div>


        {/* Mixed Grid Layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Sponsored/Large Cards - Span 2 columns */}
          {sponsoredItems.slice(0, 2).map((item, index) => {
            const spanWide = needsWideLayout(item) || index === 0;

            return (
              <div
                key={`${item.id}-${index}`}
                className={`group relative h-full ${
                  spanWide ? 'md:col-span-2 lg:col-span-2 xl:col-span-2' : ''
                }`}
              >
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
            );
          })}
          
          {/* Regular Cards */}
          {standardItems.map((item, index) => {
            const spanWide = needsWideLayout(item);

            return (
              <div
                key={`${item.id}-${index}`}
                className={`group h-full ${spanWide ? 'md:col-span-2 lg:col-span-2 xl:col-span-2' : ''}`}
              >
                <DashboardNewsCard item={item} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
