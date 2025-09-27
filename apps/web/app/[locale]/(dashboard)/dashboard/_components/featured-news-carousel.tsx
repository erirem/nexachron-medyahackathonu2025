'use client';

import { useState, useEffect, useCallback, type JSX } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { DashboardNewsItem } from './types';

interface FeaturedNewsCarouselProps {
  readonly items: readonly DashboardNewsItem[];
  readonly autoPlayInterval?: number;
}

export function FeaturedNewsCarousel({ 
  items, 
  autoPlayInterval = 5000 
}: FeaturedNewsCarouselProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  }, [items.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length, goToNext, autoPlayInterval]);

  if (items.length === 0) return <></>;

  const currentItem = items[currentIndex];

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="relative aspect-[21/9] overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a2234] to-[#0f1624] shadow-2xl">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src={currentItem.imageUrl}
            alt={currentItem.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
          {/* Top Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {currentItem.impact === 'Yüksek' && (
                <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 backdrop-blur-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  SON DAKİKA
                </span>
              )}
              <span className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white/90 border border-white/20">
                {currentItem.category}
              </span>
            </div>
            
            {/* Slide Counter */}
            <div className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-sm px-4 py-2">
              <span className="text-sm font-medium text-white">
                {currentIndex + 1} / {items.length}
              </span>
            </div>
          </div>

          {/* Middle Section - Main Content */}
          <div className="max-w-3xl">
            <h2 className="mb-4 text-3xl font-bold leading-tight text-white lg:text-5xl">
              {currentItem.title}
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-white/80 lg:text-xl">
              {currentItem.summary}
            </p>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {currentItem.timestamp}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
                {currentItem.readingTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {currentItem.dateline}
              </span>
            </div>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {currentItem.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Section - Navigation and Actions */}
          <div className="flex items-end justify-between">
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link 
                href={`/haber/${currentItem.id}`}
                className="group flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 border border-white/20"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Haberi Oku
              </Link>
              <button className="group rounded-full bg-white/10 backdrop-blur-sm p-3 text-white transition-all hover:bg-white/20 border border-white/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </button>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4">
              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                className="group rounded-full bg-white/10 backdrop-blur-sm p-3 text-white transition-all hover:bg-white/20 hover:scale-110 border border-white/20"
                aria-label="Previous slide"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* Dots Indicator */}
              <div className="flex items-center gap-2">
                {items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 transition-all duration-300 ${
                      index === currentIndex 
                        ? 'w-8 bg-white' 
                        : 'w-2 bg-white/40 hover:bg-white/60'
                    } rounded-full`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNext}
                className="group rounded-full bg-white/10 backdrop-blur-sm p-3 text-white transition-all hover:bg-white/20 hover:scale-110 border border-white/20"
                aria-label="Next slide"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Side Preview (for next items) */}
        <div className="absolute right-0 top-0 hidden h-full w-1/4 lg:block">
          <div className="relative h-full opacity-30">
            {items.length > 1 && (
              <Image
                src={items[(currentIndex + 1) % items.length].imageUrl}
                alt="Next"
                fill
                className="object-cover"
                sizes="25vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black" />
          </div>
        </div>
      </div>
    </div>
  );
}