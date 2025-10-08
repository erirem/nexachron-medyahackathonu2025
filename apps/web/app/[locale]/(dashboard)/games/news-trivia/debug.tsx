'use client';

import { useState, useEffect, type JSX } from 'react';
import { useNews } from '@/hooks/use-news';

export default function NewsTriviaDebug(): JSX.Element {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const { data: newsData, isLoading, error, isFetching } = useNews({ 
    limit: 10,
    isPopular: true 
  });

  useEffect(() => {
    const info: string[] = [];
    
    info.push(`🔄 isLoading: ${isLoading}`);
    info.push(`🔄 isFetching: ${isFetching}`);
    info.push(`❌ error: ${error ? error.message : 'None'}`);
    info.push(`📊 newsData length: ${newsData ? newsData.length : 'null'}`);
    
    if (newsData && newsData.length > 0) {
      const sample = newsData[0];
      info.push(`📰 Sample news: "${sample.title}"`);
      info.push(`📂 Category: ${sample.category || 'N/A'}`);
      info.push(`🏙️ City: ${sample.city || 'N/A'}`);
    }
    
    setDebugInfo(info);
  }, [newsData, isLoading, error, isFetching]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">News Trivia Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">API Status:</h2>
            <div className="space-y-2">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-white/80 font-mono text-sm">
                  {info}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Actions:</h2>
            <div className="space-y-3">
              <a 
                href="/tr/games/news-trivia" 
                className="block bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 text-center"
              >
                Go to News Trivia Game
              </a>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all duration-200"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>

        {newsData && newsData.length > 0 && (
          <div className="mt-8 bg-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Sample News Data:</h2>
            <div className="space-y-4">
              {newsData.slice(0, 3).map((news, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">{news.title}</h3>
                  <p className="text-white/70 text-sm mb-2">{news.summary}</p>
                  <div className="flex gap-4 text-xs text-white/60">
                    <span>Category: {news.category || 'N/A'}</span>
                    <span>City: {news.city || 'N/A'}</span>
                    <span>Created: {news.created_at ? new Date(news.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
