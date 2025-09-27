'use client';

import { useState, useEffect, useCallback, useRef, type JSX } from 'react';

interface ReadingProgressProps {
  readonly articleTitle: string;
  readonly articleUrl: string;
}

export function ReadingProgress({ articleTitle, articleUrl }: ReadingProgressProps): JSX.Element {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showFloatingActions, setShowFloatingActions] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  const updateProgress = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollTop = container.scrollTop;
      const docHeight = container.scrollHeight - container.clientHeight;
      const progressPercentage = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setProgress(Math.min(100, Math.max(0, progressPercentage)));
      setIsVisible(scrollTop > 100);
      setShowFloatingActions(scrollTop > 300);
      return;
    }

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progressPercentage = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    setProgress(Math.min(100, Math.max(0, progressPercentage)));
    setIsVisible(scrollTop > 100);
    setShowFloatingActions(scrollTop > 300);
  }, []);

  useEffect(() => {
    const container = document.getElementById('article-scroll-container');
    scrollContainerRef.current = container;

    const handleScroll = () => updateProgress();

    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      updateProgress();
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [updateProgress]);

  const shareToTwitter = useCallback(() => {
    const text = `${articleTitle} - Anadolu Ajansı`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(articleUrl)}`;
    window.open(url, '_blank');
  }, [articleTitle, articleUrl]);

  const shareToFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    window.open(url, '_blank');
  }, [articleUrl]);

  const shareToLinkedIn = useCallback(() => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
    window.open(url, '_blank');
  }, [articleUrl]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      // Show toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-top duration-300';
      toast.textContent = 'Link kopyalandı!';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    setShowShareMenu(false);
  }, [articleUrl]);

  const scrollToTop = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {/* Reading Progress Bar */}
      <div className={`fixed top-0 left-0 right-0 z-30 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg">
          <div 
            className="h-full bg-white shadow-sm transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Mini article info */}
        <div className="bg-black/90 backdrop-blur-sm text-white px-6 py-3 border-b border-white/10">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                AA
              </div>
              <div>
                <div className="text-sm font-medium line-clamp-1">{articleTitle}</div>
                <div className="text-xs text-white/70">{Math.round(progress)}% okundu</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-xs text-white/70">
                {progress < 25 ? '📖 Okumaya başladınız' : 
                 progress < 50 ? '🔥 Devam ediyor' : 
                 progress < 75 ? '⚡ Neredeyse bitti' : '🎉 Tamamlandı'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className={`fixed right-6 bottom-6 flex flex-col gap-3 z-40 transition-all duration-500 ${showFloatingActions ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}>
        
        {/* Share Menu */}
        <div className={`flex flex-col gap-2 transition-all duration-300 ${showShareMenu ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
          <button
            onClick={shareToTwitter}
            className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            title="Twitter'da paylaş"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </button>
          
          <button
            onClick={shareToFacebook}
            className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            title="Facebook'ta paylaş"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          
          <button
            onClick={shareToLinkedIn}
            className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            title="LinkedIn'de paylaş"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </button>
          
          <button
            onClick={copyToClipboard}
            className="w-12 h-12 rounded-full bg-gray-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            title="Linki kopyala"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-all"
          title="Paylaş"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <path d="m8.6 13.5 6.8 4"/>
            <path d="M8.6 10.5 15.4 6"/>
          </svg>
        </button>

        {/* Scroll to Top */}
        <button
          onClick={scrollToTop}
          className="w-14 h-14 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center shadow-xl hover:scale-110 hover:bg-black/30 transition-all"
          title="Başa dön"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
      </div>
    </>
  );
}
