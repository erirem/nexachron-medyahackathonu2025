'use client';

import { useState, useEffect, type JSX } from 'react';
import Image from 'next/image';

interface InlineMediaProps {
  readonly type: 'image' | 'video' | 'quote' | 'chart';
  readonly src?: string;
  readonly alt?: string;
  readonly caption?: string;
  readonly credit?: string;
  readonly quote?: string;
  readonly author?: string;
  readonly onVisible?: () => void;
}

export function InlineMedia({ 
  type, 
  src, 
  alt, 
  caption, 
  credit, 
  quote, 
  author, 
  onVisible 
}: InlineMediaProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          onVisible?.();
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById(`inline-media-${type}-${Math.random()}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [type, onVisible, isVisible]);

  if (type === 'image' && src) {
    return (
      <div 
        id={`inline-media-image-${src}`}
        className={`my-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="relative rounded-2xl overflow-hidden bg-slate-800/30 border border-slate-600/30">
          <div className="relative aspect-video">
            <Image
              src={src}
              alt={alt || ''}
              fill
              className={`object-cover transition-all duration-500 ${isLoaded ? 'scale-100 blur-0' : 'scale-105 blur-sm'}`}
              onLoad={() => setIsLoaded(true)}
              sizes="(max-width: 768px) 100vw, 896px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          {(caption || credit) && (
            <div className="p-4 bg-slate-800/50 backdrop-blur-sm">
              {caption && (
                <p className="text-slate-200 text-sm leading-relaxed">{caption}</p>
              )}
              {credit && (
                <p className="text-slate-400 text-xs mt-1">Fotoğraf: {credit}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'video' && src) {
    return (
      <div 
        id={`inline-media-video-${src}`}
        className={`my-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="relative rounded-2xl overflow-hidden bg-slate-800/30 border border-slate-600/30">
          <div className="relative aspect-video">
            <video
              className="w-full h-full object-cover"
              poster={src.replace('.mp4', '-poster.jpg')}
              controls={isVisible}
            >
              <source src={src} type="video/mp4" />
              Tarayıcınız video oynatmayı desteklemiyor.
            </video>
            {!isVisible && (
              <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300 ml-1">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
          {caption && (
            <div className="p-4 bg-slate-800/50 backdrop-blur-sm">
              <p className="text-slate-200 text-sm leading-relaxed">{caption}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'quote' && quote) {
    return (
      <div 
        id={`inline-media-quote-${Math.random()}`}
        className={`my-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="relative border-l-4 border-slate-500 pl-8 py-6">
          <div className="absolute left-4 top-4 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
            </svg>
          </div>
          <blockquote className="text-xl text-slate-200 font-medium italic leading-relaxed mb-4">
            {quote}
          </blockquote>
          {author && (
            <cite className="text-slate-400 text-sm">— {author}</cite>
          )}
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div 
        id={`inline-media-chart-${Math.random()}`}
        className={`my-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="bg-slate-800/30 border border-slate-600/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <h3 className="text-slate-200 font-semibold">Analiz</h3>
          </div>
          <div className="aspect-[2/1] bg-slate-900/30 rounded-lg flex items-center justify-center">
            <p className="text-slate-400 text-sm">Grafik yükleniyor...</p>
          </div>
          {caption && (
            <p className="text-slate-300 text-sm mt-4">{caption}</p>
          )}
        </div>
      </div>
    );
  }

  return <></>;
}