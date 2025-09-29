'use client';

import { Fragment, useState } from 'react';
import Image from 'next/image';
import type { DashboardNewsItem } from './types';

interface DashboardNewsModalProps {
  item: DashboardNewsItem;
  isOpen: boolean;
  onClose: () => void;
  relatedNews?: DashboardNewsItem[];
}

export function DashboardNewsModal({ item, isOpen, onClose, relatedNews = [] }: DashboardNewsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'analysis'>('overview');
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  // Örnek timeline verileri
  const timelineEvents = [
    {
      id: '1',
      time: '2 saat önce',
      title: 'İlk gelişme',
      description: 'Konuyla ilgili ilk açıklama yapıldı',
      type: 'start'
    },
    {
      id: '2',
      time: '1 saat önce',
      title: 'Resmi açıklama',
      description: 'Yetkili makamlardan detaylı bilgi paylaşıldı',
      type: 'update'
    },
    {
      id: '3',
      time: 'Şimdi',
      title: 'Son durum',
      description: item.title,
      type: 'current'
    }
  ];

  const reactions = [
    { emoji: '👍', label: 'Beğendim', count: 234 },
    { emoji: '❤️', label: 'Sevdim', count: 156 },
    { emoji: '🤔', label: 'Düşündürücü', count: 89 },
    { emoji: '😮', label: 'Şaşırtıcı', count: 67 },
    { emoji: '😢', label: 'Üzücü', count: 45 }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
        <div className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-[#0f1623] via-[#141b2d] to-[#0d1520] rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="relative h-64 md:h-80">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            
            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-sm text-xs font-semibold text-blue-300 border border-blue-400/30">
                  {item.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs text-white/70">
                  {item.impact} Öncelik
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{item.title}</h1>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>{item.timestamp}</span>
                <span>•</span>
                <span>{item.readingTime}</span>
                <span>•</span>
                <span>{item.dateline}</span>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-16rem)]">
            {/* Tabs */}
            <div className="sticky top-0 bg-[#0f1623]/95 backdrop-blur-md border-b border-white/10 z-10">
              <div className="flex items-center gap-1 p-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'overview'
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Genel Bakış
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'timeline'
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Zaman Akışı
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'analysis'
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  AI Analizi
                </button>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg text-white/90 leading-relaxed">{item.summary}</p>
                    {item.detail && (
                      <p className="text-white/80 mt-4">{item.detail}</p>
                    )}
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-white/50">Etiketler:</span>
                    {item.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 rounded-full bg-white/10 text-sm text-white/80">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Related News */}
                  {relatedNews.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-white mb-4">İlgili Haberler</h3>
                      <div className="grid gap-3">
                        {relatedNews.slice(0, 3).map((news) => (
                          <div key={news.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer">
                            <div className="w-16 h-16 rounded-lg bg-white/10 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-white truncate">{news.title}</h4>
                              <p className="text-xs text-white/50">{news.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Timeline Tab */}
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Haberin Kronolojik Akışı</h3>
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/20" />
                    
                    {/* Timeline Events */}
                    <div className="space-y-6">
                      {timelineEvents.map((event, index) => (
                        <div key={event.id} className="relative flex items-start gap-4 pl-10">
                          {/* Timeline Dot */}
                          <div className={`absolute left-2.5 w-3 h-3 rounded-full ${
                            event.type === 'current' ? 'bg-blue-500' : 'bg-white/40'
                          } ring-4 ring-[#0f1623]`} />
                          
                          <div className={`flex-1 p-4 rounded-lg ${
                            event.type === 'current' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-white/5'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-white">{event.title}</h4>
                              <span className="text-xs text-white/50">{event.time}</span>
                            </div>
                            <p className="text-sm text-white/70">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Analysis Tab */}
              {activeTab === 'analysis' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                      <h3 className="text-lg font-semibold text-white">AI Detaylı Analizi</h3>
                    </div>
                    <div className="space-y-3 text-white/80">
                      <p>Bu haber, {item.category} kategorisinde önemli bir gelişmeyi işaret ediyor.</p>
                      <p>Sentiment analizi: <span className={`font-semibold ${
                        item.sentiment === 'positive' ? 'text-green-400' : 
                        item.sentiment === 'negative' ? 'text-red-400' : 'text-blue-400'
                      }`}>{item.sentiment === 'positive' ? 'Olumlu' : item.sentiment === 'negative' ? 'Olumsuz' : 'Nötr'}</span></p>
                      <p>Tahmini etki alanı: Ekonomi, Siyaset, Toplum</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Reactions */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-sm font-medium text-white/70 mb-4">Bu habere tepkiniz:</h3>
                <div className="flex items-center gap-2">
                  {reactions.map((reaction) => (
                    <button
                      key={reaction.emoji}
                      onClick={() => setUserReaction(reaction.emoji)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                        userReaction === reaction.emoji
                          ? 'bg-white/20 ring-2 ring-white/40'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-lg">{reaction.emoji}</span>
                      <span className="text-xs text-white/60">{reaction.count}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Comments */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-white/70 mb-4">Yorum ekleyin:</h3>
                <div className="space-y-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Görüşlerinizi paylaşın..."
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 resize-none focus:outline-none focus:border-white/30 transition"
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{comment.length}/500 karakter</span>
                    <button className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 font-medium hover:bg-blue-500/30 transition">
                      Gönder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}