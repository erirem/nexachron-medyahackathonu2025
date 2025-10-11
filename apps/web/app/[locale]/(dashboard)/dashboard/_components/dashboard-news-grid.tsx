'use client';

import type { JSX } from 'react';
import { DashboardNewsCard } from './dashboard-news-card';
import { FeaturedNewsCarousel } from './featured-news-carousel';
import { GameRecommendationCard } from '@/components/dashboard/game-recommendation-card';
import { useGameRecommendations } from '@/hooks/use-game-recommendations';
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
  // Tüm kartları aynı boyutta yapmak için false döndür
  return false;
}

export function DashboardNewsGrid({
  items,
  title = 'Öne çıkan haberler',
  subtitle,
  showAll = false
}: DashboardNewsGridProps): JSX.Element {
  // Oyun önerilerini al
  const { recommendations, getRecommendationPositions } = useGameRecommendations(items.length);
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
      <section className="w-full space-y-2">
      {/* Featured News Carousel */}
      {featuredItems.length > 0 && (
        <div className="-mx-6 sm:-mx-8 lg:-mx-12 px-6 sm:px-8 lg:px-12">
          <FeaturedNewsCarousel items={featuredItems} />
        </div>
      )}

      {/* AI Kişiselleştirme Göstergesi - Sadece "Sizin için" kategorisinde göster */}
      {title === "" && (
        <div className="-mx-6 sm:-mx-8 lg:-mx-12 px-6 sm:px-8 lg:px-12 mt-4">
          <div className="relative overflow-hidden rounded-2xl border border-[#8bc4ff]/20 bg-gradient-to-r from-[#8bc4ff]/8 via-[#6ab2f2]/12 to-[#8bc4ff]/8 px-4 py-3 shadow-[0_8px_32px_rgba(139,196,255,0.08)]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8bc4ff]/3 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center">
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#0f6acd] to-[#1a8dff] opacity-60" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#0f6acd] to-[#1a8dff] shadow-[0_8px_24px_rgba(15,106,205,0.4)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1 .34-4.58 2.5 2.5 0 0 1 3.24-3.56A2.5 2.5 0 0 1 9.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0-.34-4.58 2.5 2.5 0 0 0-3.24-3.56A2.5 2.5 0 0 0 14.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Kişiselleştirme</h3>
                <p className="text-xs text-white/70">AI Algoritmaları ile özel öneriler</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium text-white/80">{items.length} öneri</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-blue-300">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs font-medium text-white/80">Son 30 gün</span>
              </div>
            </div>
          </div>
        </div>
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


        {/* Uniform Grid Layout - 3 columns */}
        <div className="-mx-6 sm:-mx-8 lg:-mx-12 px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(() => {
            // Tüm kartları birleştir ve karıştır
            const allCards: Array<{ type: 'news' | 'game'; item: any; index: number }> = [];
            
            // Sponsored kartları ekle
            sponsoredItems.forEach((item, index) => {
              allCards.push({ type: 'news', item: { ...item, isSponsored: true }, index });
            });
            
            // Regular kartları ekle
            standardItems.forEach((item, index) => {
              allCards.push({ type: 'news', item, index: index + sponsoredItems.length });
            });
            
            // Oyun önerisi pozisyonlarını al
            const gamePositions = getRecommendationPositions(allCards.length + recommendations.length);
            
            // Oyun kartlarını belirli pozisyonlara ekle
            gamePositions.forEach((position, gameIndex) => {
              if (gameIndex < recommendations.length && position < allCards.length + recommendations.length) {
                allCards.splice(position, 0, { 
                  type: 'game', 
                  item: recommendations[gameIndex], 
                  index: -1 
                });
              }
            });
            
            return allCards.map((card, cardIndex) => {
              if (card.type === 'game') {
                return (
                  <div key={`game-${card.item.id}-${cardIndex}`} className="group h-full">
                    <GameRecommendationCard recommendation={card.item} />
                  </div>
                );
              } else {
                const newsItem = card.item;
                return (
                  <div key={`${newsItem.id}-${cardIndex}`} className="group relative h-full">
                    {newsItem.isSponsored && (
                      <div className="absolute -top-3 left-4 z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-sm whitespace-nowrap">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          SPONSORLU
                        </span>
                      </div>
                    )}
                    <DashboardNewsCard item={newsItem} />
                  </div>
                );
              }
            });
          })()}
          </div>
        </div>
      </div>
    </section>
  );
}
