'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { type JSX } from 'react';

export default function SimpleTest(): JSX.Element {
  const router = useRouter();
  const locale = useLocale();

  const goToGames = () => {
    console.log('Going to games page...');
    console.log('Current URL:', window.location.href);
    console.log('Target URL:', `/${locale}/games`);
    
    // Force navigation
    window.location.href = `/${locale}/games`;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-white mb-8">Simple Navigation Test</h1>
        
        <div className="bg-white/10 rounded-xl p-8">
          <p className="text-white mb-6">Click the button below to go to games page:</p>
          
          <button
            onClick={goToGames}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
          >
            Go to Games Page
          </button>
          
          <div className="mt-6 text-white/60 text-sm">
            <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p>Target URL: /{locale}/games</p>
          </div>
        </div>
      </div>
    </div>
  );
}
