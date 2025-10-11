'use client';

import { useState, useCallback, useEffect, useRef, type JSX } from 'react';
import { useGamification } from '@/contexts/gamification-context';
import { useTrackEvent } from '@/hooks/use-track-event';
import { UserRank, RANK_INFO } from '@/lib/types/gamification';

interface HypeButtonProps {
  readonly articleId: string;
  readonly articleTitle: string;
}

export function HypeButton({ articleId, articleTitle }: HypeButtonProps): JSX.Element {
  const { userProfile, giveHype, calculateHypePower } = useGamification();
  const track = useTrackEvent();
  const [isHyped, setIsHyped] = useState(false);
  const [hypeCount, setHypeCount] = useState(Math.floor(Math.random() * 50) + 10); // Mock hype count
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownAutoTooltip, setHasShownAutoTooltip] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);
  const hypeRef = useRef<HTMLDivElement>(null);

  // Intersection Observer - scroll ile görünürlük kontrolü
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasShownAutoTooltip) {
            setIsVisible(true);
            // Otomatik tooltip göster
            setTimeout(() => {
              setShowTooltip(true);
              setHasShownAutoTooltip(true);
            }, 500); // 0.5 saniye sonra göster
          }
        });
      },
      {
        threshold: 0.3, // %30 görünür olduğunda tetikle
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (hypeRef.current) {
      observer.observe(hypeRef.current);
    }

    return () => {
      if (hypeRef.current) {
        observer.unobserve(hypeRef.current);
      }
    };
  }, [hasShownAutoTooltip]);

  // Duygu analizi iconları (emoji yerine)
  const sentimentIcons = [
    { icon: 'smile', label: 'Mutlu', count: 12, color: 'text-yellow-400' },
    { icon: 'frown', label: 'Üzgün', count: 8, color: 'text-blue-400' },
    { icon: 'angry', label: 'Kızgın', count: 15, color: 'text-red-400' },
    { icon: 'surprise', label: 'Şaşırmış', count: 6, color: 'text-purple-400' },
    { icon: 'heart', label: 'Sevgi', count: 23, color: 'text-pink-400' },
    { icon: 'thumbs-up', label: 'Beğeni', count: 18, color: 'text-green-400' }
  ];

  // Icon render fonksiyonu
  const renderIcon = (iconName: string, size: number = 16) => {
    const iconProps = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" };
    
    switch (iconName) {
      case 'smile':
        return <svg {...iconProps}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
      case 'frown':
        return <svg {...iconProps}><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
      case 'angry':
        return <svg {...iconProps}><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5-2 4-2 4 2 4 2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>;
      case 'surprise':
        return <svg {...iconProps}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="9" r="1"/><path d="M8 15s1.5-2 4-2 4 2 4 2"/></svg>;
      case 'heart':
        return <svg {...iconProps}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
      case 'thumbs-up':
        return <svg {...iconProps}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>;
      default:
        return <svg {...iconProps}><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  const handleSentimentClick = useCallback((sentiment: string) => {
    setSelectedSentiment(selectedSentiment === sentiment ? null : sentiment);
    
    // Analytics tracking
    void track({ 
      eventType: 'click', 
      itemId: articleId, 
      metadata: { 
        action: 'sentiment', 
        surface: 'detail',
        sentiment
      } 
    });
  }, [selectedSentiment, track, articleId]);

  // Tooltip yönetimi
  const showTooltipWithDelay = useCallback(() => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    
    const timeout = setTimeout(() => {
      setShowTooltip(true);
    }, 1000); // 1 saniye sonra göster
    
    setTooltipTimeout(timeout);
  }, [tooltipTimeout]);

  const hideTooltip = useCallback(() => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    setShowTooltip(false);
  }, [tooltipTimeout]);

  const hideTooltipWithDelay = useCallback(() => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    
    const timeout = setTimeout(() => {
      setShowTooltip(false);
    }, 3000); // 3 saniye sonra gizle
    
    setTooltipTimeout(timeout);
  }, [tooltipTimeout]);

  // Component unmount olduğunda timeout'u temizle
  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
    };
  }, [tooltipTimeout]);

  const handleHype = useCallback(() => {
    if (!userProfile) return;

    const hypePower = calculateHypePower(userProfile.currentRank);
    const newHypeCount = isHyped ? hypeCount - hypePower : hypeCount + hypePower;
    
    setIsHyped(!isHyped);
    setHypeCount(newHypeCount);

    // Hype verme işlemi
    if (!isHyped) {
      giveHype(articleId, hypePower);
    }

    // Analytics tracking
    void track({ 
      eventType: 'click', 
      itemId: articleId, 
      metadata: { 
        action: 'hype', 
        surface: 'detail',
        hypePower,
        userRank: userProfile.currentRank
      } 
    });
  }, [userProfile, isHyped, hypeCount, calculateHypePower, giveHype, track, articleId]);

  if (!userProfile) {
    return <></>;
  }

  const hypePower = calculateHypePower(userProfile.currentRank);
  const rankInfo = RANK_INFO[userProfile.currentRank];

  return (
    <div className="relative mt-8" ref={hypeRef}>
      {/* Hype Section */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
        {/* Hype Button with Tooltip */}
        <div className="relative flex-shrink-0">
          <button
            onClick={handleHype}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 min-w-[100px] h-12 cursor-pointer ${
              isHyped 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
            onMouseEnter={showTooltipWithDelay}
            onMouseLeave={hideTooltipWithDelay}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill={isHyped ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              strokeWidth="2"
              className={isHyped ? 'animate-pulse' : ''}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-sm font-semibold">
              {isHyped ? 'Hype!' : 'Hype Ver'}
            </span>
            <span className="text-xs opacity-80">{hypeCount}</span>
          </button>

          {/* Tooltip - Hype Ver butonunun üzerinde */}
          {showTooltip && (
            <div className="absolute bottom-full left-0 mb-2 z-50 w-80">
              <div className="bg-slate-800 text-white text-sm rounded-lg p-5 shadow-xl border border-white/20">
                <div className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400 flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div className="space-y-3 flex-1">
                    <div className="font-semibold text-purple-400 text-base">Hype Sistemi</div>
                    <p className="text-white/90 text-sm leading-relaxed">
                      Rankınıza göre hype gücünüz değişir. Daha yüksek ranklar daha fazla hype verebilir ve haberleri öne çıkarabilir.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white/70">Rank atlamak için:</span>
                      <span className="text-green-400 font-medium">Haber oku + Oyun oyna</span>
                    </div>
                    
                    {/* Mevcut Rank Bilgisi */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className={rankInfo.color}>
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                      <div>
                        <div className={`font-semibold text-sm ${rankInfo.color}`}>
                          {rankInfo.name}
                        </div>
                        <div className="text-white/60 text-xs">
                          +{hypePower} hype gücü
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={hideTooltip}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              
              {/* Arrow */}
              <div className="absolute top-full left-6">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>
          )}
        </div>

        {/* Duygu Analizi İconları - Bar'ın geri kalanını doldur */}
        <div className="flex items-center gap-2 flex-1 justify-between">
          {sentimentIcons.map((sentiment) => (
            <div key={sentiment.label} className="relative flex-1 group">
              <button
                onClick={() => handleSentimentClick(sentiment.label)}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 hover:scale-105 w-full h-12 cursor-pointer ${
                  selectedSentiment === sentiment.label 
                    ? 'bg-white/20 scale-105' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`${sentiment.color}`}>
                  {renderIcon(sentiment.icon, 18)}
                </div>
                <span className={`text-xs font-medium ${sentiment.color}`}>
                  {sentiment.count}
                </span>
              </button>
              
              {/* Duygu Açıklama Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-40">
                <div className="bg-slate-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-white/20 whitespace-nowrap">
                  <div className="font-semibold">{sentiment.label}</div>
                  <div className="text-white/70">{sentiment.count} kişi</div>
                  
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-slate-700"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* User Rank Info */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 h-12 flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={rankInfo.color}>
            <circle cx="12" cy="12" r="10"/>
          </svg>
          <div className="text-sm">
            <div className={`font-semibold ${rankInfo.color}`}>
              {rankInfo.name}
            </div>
            <div className="text-white/60 text-xs">
              +{hypePower} hype
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}