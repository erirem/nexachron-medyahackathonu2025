'use client';

import { type JSX } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { DashboardNewsItem } from '../../../dashboard/_components/types';

interface NewsSidebarProps {
  readonly popularNews: readonly DashboardNewsItem[];
  readonly recentNews: readonly DashboardNewsItem[];
  readonly currentArticleId?: string;
}

export function NewsSidebar({ 
  popularNews, 
  recentNews, 
  currentArticleId 
}: NewsSidebarProps): JSX.Element {
  const locale = useLocale();
  const filteredPopular = popularNews.filter(item => item.id !== currentArticleId).slice(0, 5);
  const filteredRecent = recentNews.filter(item => item.id !== currentArticleId).slice(0, 4);

  return (
    <aside className="w-80 flex-shrink-0">
      <div className="lg:sticky lg:top-8 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto sidebar-scrollbar space-y-8">
        
        {/* Popular News Section */}
        <section className="rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-400">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">🔥 Popüler Haberler</h2>
          </div>
          
          <div className="space-y-4">
            {filteredPopular.map((item) => (
              <Link 
                key={item.id} 
                href={`/${locale}/haber/${item.id}`}
                className="group block"
              >
                <article className="flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-300 border border-transparent hover:border-white/20">
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center text-slate-300">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <path d="M21 15l-5-5-11 11" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium line-clamp-2 leading-snug mb-1 group-hover:text-white/90 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span className="capitalize">{item.category}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          
          <Link 
            href={`/${locale}/dashboard`} 
            className="block mt-4 text-center py-2 px-4 rounded-lg bg-white/10 text-white/70 text-sm font-medium hover:bg-white/20 hover:text-white transition-colors"
          >
            Tüm Popüler Haberleri Gör
          </Link>
        </section>

        {/* Recent News Section */}
        <section className="rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">⏱️ Son Haberler</h2>
          </div>
          
          <div className="space-y-4">
            {filteredRecent.map((item) => (
              <Link 
                key={item.id} 
                href={`/${locale}/haber/${item.id}`}
                className="group block"
              >
                <article className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-300 border border-transparent hover:border-white/20">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-2 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-medium line-clamp-2 leading-snug mb-2 group-hover:text-white/90 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/70 px-2 py-1 rounded bg-white/10 capitalize">
                          {item.category}
                        </span>
                        <span className="text-xs text-white/50">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter Subscription */}
        <section className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-400/20 p-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">📧 AA Bülteni</h3>
            <p className="text-sm text-white/70 mb-4">
              Güncel haberler doğrudan e-postanızda
            </p>
            <button className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
              Ücretsiz Abone Ol
            </button>
          </div>
        </section>

        {/* Social Media */}
        <section className="rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-4 text-center">🌐 Bizi Takip Edin</h3>
          <div className="flex justify-center gap-3">
            <button className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-600/30 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </button>
            <button className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-600/30 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </button>
            <button className="w-10 h-10 rounded-lg bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 hover:bg-pink-600/30 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.758-1.378l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
              </svg>
            </button>
          </div>
        </section>
      </div>
    </aside>
  );
}
