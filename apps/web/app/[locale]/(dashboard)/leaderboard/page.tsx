'use client';

import type { JSX } from "react";
import { useRouter } from 'next/navigation';
import { Leaderboard } from "@/components/leaderboard/leaderboard";

export default function LeaderboardPage(): JSX.Element {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#08111c] via-[#0d1421] to-[#0a0f1a]">
      <div className="container mx-auto py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Geri Dön
          </button>
        </div>
        
        <Leaderboard />
      </div>
    </div>
  );
}