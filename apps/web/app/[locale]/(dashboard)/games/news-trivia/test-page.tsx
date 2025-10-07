'use client';

import { useState, useEffect, type JSX } from 'react';
import { useNews } from '@/hooks/use-news';

// Simple test component to verify news data and question generation
export default function NewsTriviaTestPage(): JSX.Element {
  const [testResults, setTestResults] = useState<string[]>([]);
  const { data: newsData, isLoading, error } = useNews({ 
    limit: 10,
    isPopular: true 
  });

  useEffect(() => {
    const results: string[] = [];
    
    if (isLoading) {
      results.push('⏳ Loading news data...');
    } else if (error) {
      results.push(`❌ Error loading news: ${error.message}`);
    } else if (newsData) {
      results.push(`✅ Loaded ${newsData.length} news items`);
      
      // Test question generation
      if (newsData.length > 0) {
        const news = newsData[0];
        results.push(`📰 Sample news: "${news.title}"`);
        results.push(`📂 Category: ${news.category || 'N/A'}`);
        results.push(`🏙️ City: ${news.city || 'N/A'}`);
        results.push(`📅 Created: ${news.created_at || 'N/A'}`);
        results.push(`📝 Summary: ${news.summary ? news.summary.substring(0, 100) + '...' : 'N/A'}`);
      }
    }
    
    setTestResults(results);
  }, [newsData, isLoading, error]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">News Trivia Test Page</h1>
        
        <div className="bg-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Results:</h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="text-white/80 font-mono text-sm">
                {result}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/tr/games/news-trivia" 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 inline-block"
          >
            Go to News Trivia Game
          </a>
        </div>
      </div>
    </div>
  );
}
