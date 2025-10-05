'use client';

import { useState, type JSX } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { DashboardNewsItem } from '../../../dashboard/_components/types';

interface NewsTimelineProps {
  readonly currentArticle: DashboardNewsItem;
  readonly allNews: readonly DashboardNewsItem[];
}

function parseArticleDate(article: DashboardNewsItem): Date | null {
  if (article.storyDate) {
    const isoDate = new Date(article.storyDate);
    if (!Number.isNaN(isoDate.getTime())) {
      return isoDate;
    }
  }

  const parsed = Date.parse(article.publishedAt);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed);
  }

  return null;
}

export function NewsTimeline({ currentArticle, allNews }: NewsTimelineProps): JSX.Element | null {
  const [isExpanded, setIsExpanded] = useState(true);
  const locale = useLocale();

  // If no storyId, this article doesn't belong to a timeline
  if (!currentArticle.storyId) {
    return null;
  }

  // Find all articles in the same story
  const timelineArticles = allNews
    .filter(article => article.storyId === currentArticle.storyId)
    .sort((a, b) => {
      if (a.timelineOrder !== undefined && b.timelineOrder !== undefined) {
        return a.timelineOrder - b.timelineOrder;
      }

      const aDate = parseArticleDate(a);
      const bDate = parseArticleDate(b);

      if (aDate && bDate) {
        return aDate.getTime() - bDate.getTime();
      }

      return a.title.localeCompare(b.title);
    });

  // If only one article in timeline, don't show the component
  if (timelineArticles.length <= 1) {
    return null;
  }

  const currentIndex = timelineArticles.findIndex(article => article.id === currentArticle.id);
  const storyTitle = currentArticle.storyTitle || 'Haberin Gelişim Süreci';

  const getTimeDifference = (previous: DashboardNewsItem, current: DashboardNewsItem): string | null => {
    const previousDate = parseArticleDate(previous);
    const currentDate = parseArticleDate(current);

    if (!previousDate || !currentDate) {
      return null;
    }

    const diffInMs = currentDate.getTime() - previousDate.getTime();

    if (diffInMs <= 0) {
      return 'Aynı gün';
    }

    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays >= 365) {
      const years = Math.max(1, Math.round(diffInDays / 365));
      return `${years} yıl sonra`;
    }

    if (diffInDays >= 30) {
      const months = Math.max(1, Math.round(diffInDays / 30));
      return `${months} ay sonra`;
    }

    if (diffInDays > 1) {
      return `${diffInDays} gün sonra`;
    }

    return 'Ertesi gün';
  };

  return (
    <section className="mt-16">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-200">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            Zaman Akışı
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-6 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/60 transition-all text-white text-sm font-medium flex items-center gap-2 border border-slate-600/30"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            {isExpanded ? 'Zaman Akışını Gizle' : 'Zaman Akışını Göster'}
          </button>
        </div>
        
        <div className="bg-slate-800/30 border border-slate-600/30 rounded-2xl p-6">
          <h3 className="text-xl text-white font-bold mb-3">
            {storyTitle}
          </h3>
          <p className="text-slate-300 text-base leading-relaxed">
            Bu haberin <span className="text-slate-200 font-semibold">{timelineArticles.length} aşamalı</span> gelişim sürecini takip ederek konuya dair derinlemesine bir anlayış kazanabilirsiniz. Her gelişme aşaması, haberin tam hikayesini anlamanıza yardımcı olacaktır.
          </p>
          <div className="mt-4 flex items-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Tamamlanan aşamalar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400 animate-pulse"></div>
              <span>Şu an okuduğunuz</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              <span>Gelecek gelişmeler</span>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="relative">
          {/* Timeline Background */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600"></div>
          
          {/* Timeline Items */}
          <div className="space-y-8">
            {timelineArticles.map((article, index) => {
              const isCurrent = article.id === currentArticle.id;
              const isPast = currentIndex > index;
              const isFuture = currentIndex < index;
              const isFirst = index === 0;
              const isLast = index === timelineArticles.length - 1;
              
              // Time since previous article
              const timeSincePrevious = index > 0 
                ? getTimeDifference(timelineArticles[index - 1], article)
                : null;

              return (
                <div key={article.id} className="relative">
                  {/* Time Label */}
                  {timeSincePrevious && index > 0 && (
                    <div className="absolute -top-6 left-16 text-sm text-white/50 flex items-center gap-2">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {timeSincePrevious}
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Timeline Node */}
                    <div className="relative z-10">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center shadow-md
                        transition-all duration-300
                        ${isCurrent 
                          ? 'bg-gradient-to-br from-slate-600 to-slate-700 scale-110 ring-2 ring-slate-400/40' 
                          : isPast
                          ? 'bg-gradient-to-br from-slate-500 to-slate-600'
                          : 'bg-gradient-to-br from-slate-700 to-slate-800'
                        }
                      `}>
                        {isPast && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        )}
                        {isCurrent && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white animate-spin-slow">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2"/>
                          </svg>
                        )}
                        {isFuture && (
                          <span className="text-white/70 text-xs font-bold">{index + 1}</span>
                        )}
                      </div>

                      {/* Stage Label */}
                      <div className={`
                        absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap
                        text-xs font-medium px-1.5 py-0.5 rounded-md
                        ${isFirst ? 'bg-slate-600/15 text-slate-400' :
                          isLast ? 'bg-slate-500/15 text-slate-300' :
                          'bg-slate-700/15 text-slate-400'
                        }
                      `}>
                        {isFirst ? 'Başlangıç' : isLast ? 'Son' : `${index + 1}`}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <Link 
                        href={`/${locale}/haber/${article.id}`}
                        className={`
                          group/timeline block p-6 rounded-2xl border backdrop-blur-sm
                          transition-all duration-300 transform hover:scale-[1.02]
                          ${isCurrent 
                            ? 'bg-slate-800/40 border-slate-500/40 shadow-lg ring-1 ring-slate-400/20' 
                            : 'bg-slate-800/20 border-slate-600/30 hover:bg-slate-700/30 hover:border-slate-500/40 hover:shadow-xl'
                          }
                        `}
                      >
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                            {article.imageUrl ? (
                              <Image
                                src={article.imageUrl}
                                alt={article.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover/timeline:scale-110"
                                sizes="80px"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center text-slate-300">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  <path d="M21 15l-5-5-11 11" />
                                </svg>
                              </div>
                            )}
                            {isCurrent && (
                              <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                <span className="text-white text-xs font-bold bg-blue-500/80 px-2 py-1 rounded">
                                  OKUYORSUNUZ
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Article Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className={`
                                  inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2
                                  ${article.impact === 'Yüksek' 
                                    ? 'bg-red-500/20 text-red-400' 
                                    : article.impact === 'Orta'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                  }
                                `}>
                                  {article.impact} Öncelikli
                                </span>
                                <h3 className={`
                                  font-semibold mb-2 line-clamp-2 transition-colors duration-200
                                  ${isCurrent ? 'text-white' : 'text-white/90 group-hover/timeline:text-white'}
                                `}>
                                  {article.title}
                                </h3>
                              </div>
                              <div className="text-white/50 text-sm whitespace-nowrap">
                                {new Date(article.publishedAt).toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>

                            <p className="text-white/70 text-sm line-clamp-2 mb-3">
                              {article.summary}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-white/50">
                                <span>{article.category}</span>
                                <span>•</span>
                                <span>{article.readingTime}</span>
                                {article.viewCount && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                      </svg>
                                      {article.viewCount.toLocaleString('tr-TR')}
                                    </span>
                                  </>
                                )}
                              </div>

                              {!isCurrent && (
                                <span className="text-slate-400 group-hover/timeline:text-slate-200 text-sm flex items-center gap-1 transition-all duration-200">
                                  Oku
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover/timeline:translate-x-1">
                                    <polyline points="9 18 15 12 9 6" />
                                  </svg>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline End Indicator */}
          <div className="relative flex items-start gap-4 mt-8">
            <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md animate-pulse">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="flex-1 bg-slate-800/30 border border-slate-600/30 rounded-2xl p-6">
              <h4 className="text-white font-bold text-lg mb-2">
                Gelişim Devam Ediyor
              </h4>
              <p className="text-slate-300 mb-4">
                Bu hikayenin devamını kaçırmamak için bizi takip etmeye devam edin. Yeni gelişmeler olduğunda sizi anlık olarak bilgilendireceğiz.
              </p>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/60 border border-slate-500/30 rounded-lg text-slate-200 text-sm font-medium transition-colors">
                  Bildirimleri Aç
                </button>
                <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-600/30 rounded-lg text-slate-300 text-sm font-medium transition-colors">
                  Tüm Hikayeyi Gör
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
