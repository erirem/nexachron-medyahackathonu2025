'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { type JSX } from 'react';

export default function TestNavigation(): JSX.Element {
  const router = useRouter();
  const locale = useLocale();

  const handleRouterPush = () => {
    console.log('Router.push clicked');
    router.push(`/${locale}/games`);
  };

  const handleHistoryBack = () => {
    console.log('History.back clicked');
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Navigation Test</h1>
        
        <div className="space-y-4">
          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Buttons:</h2>
            
            <div className="space-y-3">
              <button
                onClick={handleRouterPush}
                className="w-full bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-600 transition-all duration-200"
              >
                Test Router.push()
              </button>
              
              <button
                onClick={handleHistoryBack}
                className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-600 transition-all duration-200"
              >
                Test window.history.back()
              </button>
              
              <Link
                href={`/${locale}/games`}
                className="w-full bg-yellow-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-yellow-600 transition-all duration-200 text-center block"
              >
                Test Link Component
              </Link>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Info:</h2>
            <div className="text-white/80 space-y-2">
              <p>Locale: {locale}</p>
              <p>Target URL: /{locale}/games</p>
              <p>Current URL: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Links:</h2>
            <div className="space-y-2">
              <Link href={`/${locale}/games`} className="block text-blue-400 hover:text-blue-300">
                → Games Page
              </Link>
              <Link href={`/${locale}/games/news-trivia`} className="block text-blue-400 hover:text-blue-300">
                → News Trivia Game
              </Link>
              <Link href={`/${locale}/dashboard`} className="block text-blue-400 hover:text-blue-300">
                → Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
