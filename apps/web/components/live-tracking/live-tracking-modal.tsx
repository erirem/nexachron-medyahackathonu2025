'use client';

import { useState, type JSX } from 'react';

interface LiveTrackingModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function LiveTrackingModal({ isOpen, onClose }: LiveTrackingModalProps): JSX.Element {
  if (!isOpen) return <></>;

  // Mock video data
  const liveVideos = [
    {
      id: 1,
      title: 'Ana Haber Bülteni',
      location: 'İstanbul',
      viewers: 1250
    },
    {
      id: 2,
      title: 'Ekonomi Gündemi',
      location: 'Ankara',
      viewers: 890
    },
    {
      id: 3,
      title: 'Spor Haberleri',
      location: 'İzmir',
      viewers: 2100
    },
    {
      id: 4,
      title: 'Teknoloji Haberleri',
      location: 'Bursa',
      viewers: 750
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Canlı Takip</h2>
              <p className="text-slate-400 text-sm">Gerçek zamanlı haber yayınları</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Development Notice */}
          <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400 flex-shrink-0">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <div>
                <h3 className="font-medium text-amber-400 mb-1">Geliştirme Aşamasında</h3>
                <p className="text-slate-300 text-sm">
                  Bu bölüm şu anda geliştirme aşamasındadır. Veri sağlandığında canlı video yayınları bu şekilde görünecektir.
                </p>
              </div>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveVideos.map((video) => (
              <div 
                key={video.id}
                className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors"
              >
                {/* Video Placeholder - YouTube Style */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                  {/* YouTube-style thumbnail background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-blue-900/20" />
                  
                  {/* Center play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-black/80 flex items-center justify-center shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-1">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                  </div>

                  {/* Live Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded bg-red-500 text-white text-xs font-medium">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    CANLI
                  </div>

                  {/* Viewers Count */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/80 text-white text-xs">
                    <div className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      {video.viewers}
                    </div>
                  </div>

                  {/* Lock Icon Overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-3 mx-auto shadow-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <circle cx="12" cy="16" r="1"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </div>
                      <div className="text-white text-sm font-medium">Kilitli</div>
                      <div className="text-slate-400 text-xs">Geliştirme aşamasında</div>
                    </div>
                  </div>
                </div>

                {/* Video Info - YouTube Style */}
                <div className="p-4">
                  <div className="flex gap-3">
                    {/* Channel Avatar */}
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    
                    {/* Video Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium mb-1 line-clamp-2">{video.title}</h3>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <span>Nexachron News</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {video.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 rounded-lg bg-slate-800 border border-slate-700">
            <h3 className="text-white font-medium mb-3">Canlı Takip Özellikleri</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12l2 2 4-4"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-white text-sm">Gerçek Zamanlı</div>
                  <div className="text-slate-400 text-xs">Anlık güncellemeler</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-white text-sm">Çoklu Yayın</div>
                  <div className="text-slate-400 text-xs">Farklı konular</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-white text-sm">İnteraktif</div>
                  <div className="text-slate-400 text-xs">Yorum ve etkileşim</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              Canlı yayınlar yakında aktif olacak! 🚀
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
