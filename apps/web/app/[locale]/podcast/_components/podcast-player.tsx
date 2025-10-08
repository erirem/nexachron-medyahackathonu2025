'use client';

import { useState } from 'react';

interface Podcast {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  duration: string;
  category: string;
  isPlaying?: boolean;
}

interface PodcastPlayerProps {
  podcast: Podcast;
  isPlaying: boolean;
  onClose: () => void;
  onPlayPause: () => void;
}

export function PodcastPlayer({ podcast, isPlaying, onClose, onPlayPause }: PodcastPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime] = useState(900); // 15 minutes in seconds

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / totalTime) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-br from-[#1a2234] to-[#0f1624] p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Podcast Image */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <img
              src={podcast.imageUrl}
              alt={podcast.title}
              className="h-64 w-64 rounded-2xl object-cover shadow-2xl"
            />
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                <div className="h-16 w-16 animate-pulse rounded-full bg-white/20 backdrop-blur-sm" />
              </div>
            )}
          </div>
        </div>

        {/* Podcast Info */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-xl font-bold text-white">{podcast.title}</h2>
          <p className="text-sm text-white/70">{podcast.subtitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs text-white/70">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalTime)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/20">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#0f6acd] to-[#1a8dff] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          {/* Previous */}
          <button className="rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={onPlayPause}
            className="rounded-full bg-gradient-to-r from-[#0f6acd] to-[#1a8dff] p-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            {isPlaying ? (
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Next */}
          <button className="rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Additional Controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
