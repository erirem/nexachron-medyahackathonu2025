'use client';

import { useState, useCallback, type JSX } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { DashboardNewsItem } from '../../../dashboard/_components/types';
import { ArticleEngagementSections } from './article-engagement-sections';
import { NewsTimeline } from './news-timeline';
import { ReaderEngagement } from './reader-engagement';
import { InlineMedia } from './inline-media';

interface NewsArticleProps {
  readonly article: DashboardNewsItem;
  readonly relatedNews?: readonly DashboardNewsItem[];
  readonly allNews?: readonly DashboardNewsItem[];
}

export function NewsArticle({ article, relatedNews = [], allNews = [] }: NewsArticleProps): JSX.Element {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likeCount ?? 156);

  const allImages = [
    { url: article.imageUrl, alt: article.title, caption: article.title },
    ...(article.images ?? [])
  ];

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  }, [isLiked]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  const fullContent = article.fullContent ?? `${article.summary}\n\n${article.detail}`;
  const paragraphs = fullContent.split('\\n\\n').filter(p => p.trim());

  return (
    <article className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-white/60 mb-8">
        <Link href="/dashboard" className="hover:text-white/80 transition-colors">
          Ana Sayfa
        </Link>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <Link href="/dashboard" className="hover:text-white/80 transition-colors">
          Haberler
        </Link>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="text-white/80 capitalize">{article.category}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        {/* Category and Breaking News Badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className="px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-sm text-sm font-semibold text-blue-300 border border-blue-400/30">
            {article.category}
          </span>
          {article.impact === 'Yüksek' && (
            <span className="px-4 py-2 rounded-full bg-red-500/20 backdrop-blur-sm text-sm font-semibold text-red-300 border border-red-400/30">
              🔥 SON DAKİKA
            </span>
          )}
        </div>

        {/* Title and Subtitle */}
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          {article.title}
        </h1>
        
        {article.subtitle && (
          <p className="text-xl lg:text-2xl text-white/80 mb-6 leading-relaxed font-medium">
            {article.subtitle}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-white/70 mb-8">
          <div className="flex items-center gap-3">
            {article.author?.avatar && (
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <div className="text-white font-semibold">{article.author?.name || 'AA Muhabiri'}</div>
              <div className="text-xs">{article.author?.title || 'Anadolu Ajansı'}</div>
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/20" />
          <span>{article.publishedAt || article.timestamp}</span>
          
          <div className="h-8 w-px bg-white/20" />
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {article.readingTime}
          </div>
          
          <div className="h-8 w-px bg-white/20" />
          <div className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {article.dateline}
          </div>
        </div>

        {/* Social Actions */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              isLiked 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <span className="font-medium">{likeCount}</span>
          </button>

          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`p-2.5 rounded-xl transition-all ${
              isSaved 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </button>

          <button className="p-2.5 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 border border-white/20 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <path d="M8.6 13.5l6.8 4m0-11l-6.8 4"/>
            </svg>
          </button>

          <button className="p-2.5 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 border border-white/20 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Image with Gallery */}
      <div className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a2234] to-[#0f1624]">
        <div className="relative aspect-[21/10] overflow-hidden">
          <Image
            src={allImages[currentImageIndex]?.url || article.imageUrl}
            alt={allImages[currentImageIndex]?.alt || article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Image Navigation */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              
              {/* Image Counter */}
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm">
                {currentImageIndex + 1} / {allImages.length}
              </div>
              
              {/* Image Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Image Caption */}
          {allImages[currentImageIndex]?.caption && (
            <div className="absolute bottom-4 left-4 right-16 px-4 py-2 rounded-lg bg-black/70 backdrop-blur-sm">
              <p className="text-white text-sm">{allImages[currentImageIndex]?.caption}</p>
              {allImages[currentImageIndex]?.credit && (
                <p className="text-white/70 text-xs mt-1">Fotoğraf: {allImages[currentImageIndex]?.credit}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div className="prose prose-invert prose-lg max-w-none">
        {/* Lead paragraph */}
        <div className="text-xl leading-relaxed text-white/90 font-medium mb-12 border-l-4 border-blue-500 pl-8 bg-blue-500/5 py-6 rounded-r-2xl">
          {article.summary}
        </div>

        {/* Article body */}
        <div className="space-y-8 text-lg leading-relaxed text-white/85">
          {paragraphs.map((paragraph, index) => (
            <div key={index}>
              <p className="mb-6 last:mb-0">
                {paragraph}
              </p>
              
              {/* Insert media after specific paragraphs */}
              {index === 1 && article.images?.[0] && (
                <InlineMedia
                  type="image"
                  src={article.images[0].url}
                  alt={article.images[0].alt}
                  caption={article.images[0].caption}
                  credit={article.images[0].credit}
                />
              )}
              
              {index === 3 && (
                <InlineMedia
                  type="quote"
                  quote="BIST 100 endeksinin bu performanı sadece sayılarla değil, ekonomiye olan güvenin de bir göstergesidir."
                  author="Dr. Mehmet Özkan, Ekonomi Uzmanı"
                />
              )}
              
              {index === 5 && article.images?.[1] && (
                <InlineMedia
                  type="image"
                  src={article.images[1].url}
                  alt={article.images[1].alt}
                  caption={article.images[1].caption}
                />
              )}
              
              {index === 7 && (
                <InlineMedia
                  type="chart"
                  caption="BIST 100 Endeksi Yıllık Performans Analizi - Son 5 yılın en yüksek seviyelerine ulaştı"
                />
              )}
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            Etiketler
          </h3>
          <div className="flex flex-wrap gap-3">
            {article.tags.map((tag, index) => (
              <Link
                key={index}
                href={`/dashboard?tag=${tag}`}
                className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white/80 hover:bg-white/20 transition-colors cursor-pointer"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Source Attribution */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              AA
            </div>
            <div>
              <div className="text-white font-bold text-lg">Anadolu Ajansı</div>
              <div className="text-white/70">Türkiye&apos;nin Küresel Haber Ajansı</div>
              <div className="text-white/60 text-sm mt-1">
                1920&apos;den beri güvenilir haber kaynağınız
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* News Timeline */}
      <NewsTimeline currentArticle={article} allNews={allNews} />
      
      {/* Related Articles */}
      {relatedNews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
            İlgili Haberler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedNews.slice(0, 4).map((news) => (
              <Link 
                key={news.id} 
                href={`/haber/${news.id}`}
                className="group"
              >
                <article className="flex gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20">
                  <div className="w-24 h-18 rounded-xl bg-white/10 flex-shrink-0 relative overflow-hidden">
                    <Image
                      src={news.imageUrl}
                      alt={news.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold line-clamp-2 mb-2 group-hover:text-white/90 transition-colors">
                      {news.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <span className="capitalize">{news.category}</span>
                      <span>•</span>
                      <span>{news.timestamp}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Reader Engagement */}
      <ReaderEngagement articleId={article.id} />
      
      {/* Article Engagement Sections */}
      {allNews.length > 0 && (
        <ArticleEngagementSections 
          currentArticle={article} 
          allNews={allNews} 
        />
      )}
      
      {/* Bottom Navigation */}
      <div className="mt-20 mb-8 flex items-center justify-between">
        <Link 
          href="/dashboard"
          className="group flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-x-1">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Tüm Haberler</span>
        </Link>
        
        <div className="text-white/60 text-sm">
          Anadolu Ajansı © 2024
        </div>
      </div>
    </article>
  );
}
