'use client';

import { type JSX } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { DashboardNewsItem } from '../../../dashboard/_components/types';

interface ArticleEngagementSectionsProps {
  readonly currentArticle: DashboardNewsItem;
  readonly allNews: readonly DashboardNewsItem[];
}

export function ArticleEngagementSections({ 
  currentArticle, 
  allNews 
}: ArticleEngagementSectionsProps): JSX.Element {
  const locale = useLocale();
  const editorialScore = (item: DashboardNewsItem): number => {
    const impactWeight = item.impact === 'Yüksek' ? 3 : item.impact === 'Orta' ? 2 : 1;
    const sentimentBonus = item.sentiment === 'positive' ? 0.2 : item.sentiment === 'neutral' ? 0.1 : 0;
    return impactWeight * 1000 + (item.viewCount ?? 0) + sentimentBonus;
  };

  const sortByEditorialPriority = (items: readonly DashboardNewsItem[]) =>
    [...items].sort((a, b) => editorialScore(b) - editorialScore(a));

  // "Okumaya Devam" - Same category, different topics
  const continueReading = sortByEditorialPriority(
    allNews
      .filter(item => 
        item.id !== currentArticle.id && 
        item.category === currentArticle.category &&
        !item.storyId
      )
  ).slice(0, 3);

  // "Farklı Perspektif" - Different categories, similar impact or tags
  const differentPerspective = sortByEditorialPriority(
    allNews
      .filter(item => 
        item.id !== currentArticle.id && 
        item.category !== currentArticle.category &&
        (item.impact === currentArticle.impact || 
         item.tags.some(tag => currentArticle.tags.includes(tag))) &&
        !item.storyId
      )
  ).slice(0, 3);

  // "Şunu da Sevebilirsiniz" - Based on reading behavior simulation
  const youMightLike = sortByEditorialPriority(
    allNews
      .filter(item => item.id !== currentArticle.id && !item.storyId)
  ).slice(0, 3);

  // Don't show the section if no relevant articles
  if (continueReading.length === 0 && differentPerspective.length === 0 && youMightLike.length === 0) {
    return <></>;
  }

  const renderNewsCard = (item: DashboardNewsItem) => (
    <Link 
      key={item.id}
      href={`/${locale}/haber/${item.id}`}
      className="group block"
    >
      <article className="bg-slate-800/30 hover:bg-slate-700/40 transition-all duration-300 border border-slate-600/30 hover:border-slate-500/50 backdrop-blur-sm rounded-xl overflow-hidden h-full">
        <div className="relative aspect-[16/9] overflow-hidden">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center text-slate-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm ${
              item.impact === 'Yüksek' 
                ? 'bg-red-500/80 text-white' 
                : 'bg-slate-700/80 text-slate-200'
            }`}>
              {item.category}
            </span>
          </div>
          
          {/* Reading time */}
          <div className="absolute bottom-3 right-3">
            <span className="px-2 py-1 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-xs rounded-md">
              {item.readingTime}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <h4 className="text-white font-semibold line-clamp-2 mb-3 group-hover:text-slate-200 transition-colors leading-snug text-base">
            {item.title}
          </h4>
          
          <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
            {item.summary}
          </p>
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{item.timestamp}</span>
            
            {item.viewCount && (
              <div className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>{item.viewCount.toLocaleString('tr-TR')}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );

  return (
    <section className="mt-16">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-200">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            Keşfetmeye Devam Edin
          </h2>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Editör Seçimi
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-600/30 rounded-2xl p-6">
          <p className="text-slate-300 text-base leading-relaxed mb-4">
            Anadolu Ajansı editörlerinin size özel seçtiği içeriklerle bilginizi derinleştirin. Algoritmalar değil, deneyimli gazetecilerimizin önerileriyle okuma yolculuğunuza devam edin.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
              <span>Tamamlayıcı Perspektifler</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
              <span>Farklı Bakış Açıları</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
              <span>Kaliği Kıran İçerikler</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Okumaya Devam Section */}
        {continueReading.length > 0 && (
          <div className="rounded-3xl bg-slate-800/20 border border-slate-600/30 p-8 backdrop-blur-sm hover:bg-slate-700/25 transition-all duration-300">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </div>
                  Okumaya Devam Edin
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-700/30 rounded-full">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-xs font-medium">{continueReading.length} Haber</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                <span className="text-white font-semibold">{currentArticle.category}</span> kategorisinde editörlerimizin özenle seçtiği derinlemesine analiz içeren tamamlayıcı haberler. Bu içerikler konuya dair daha geniş bir perspektif kazanmanıza yardımcı olacaktır.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {continueReading.map((item) => renderNewsCard(item))}
            </div>
          </div>
        )}

        {/* Farklı Perspektif Section */}
        {differentPerspective.length > 0 && (
          <div className="rounded-3xl bg-slate-800/15 border border-slate-600/25 p-8 backdrop-blur-sm hover:bg-slate-700/20 transition-all duration-300">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-600/50 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300">
                      <circle cx="12" cy="12" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                  </div>
                  Farklı Perspektif
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-600/30 rounded-full">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-xs font-medium">{differentPerspective.length} Görüş</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Aynı konuya farklı sektörlerden ve bakış açılarından yaklaşan editör seçimi içerikler. Bu haberler mevcut konunun daha geniş etkilerini ve bağlantılarını anlamanda yardımcı olacaktır.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {differentPerspective.map((item) => renderNewsCard(item))}
            </div>
          </div>
        )}

        {/* Şunu da Sevebilirsiniz Section */}
        {youMightLike.length > 0 && (
          <div className="rounded-3xl bg-slate-800/10 border border-slate-600/20 p-8 backdrop-blur-sm hover:bg-slate-700/15 transition-all duration-300">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-500/50 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  Şunu da Sevebilirsiniz
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-500/30 rounded-full">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-xs font-medium">Özel Seçim</span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Deneyimli editörlerimizin kendi okuma alışkanlıklarından yola çıkarak özel olarak seçtiği kaliteli içerikler. Bu haberler sizi yeni konulara yönlendirecek ve perspektifinizi genişletecektir.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {youMightLike.map((item) => renderNewsCard(item))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
