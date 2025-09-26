'use client';

import type { JSX } from 'react';
import Image from 'next/image';

interface SpotifyPodcastCardProps {
  readonly imageUrl: string;
  readonly title: string;
  readonly author: string;
  readonly category: 'Video' | 'Video • The Startup Ideas Podcast' | 'Video • My First Million' | 'Video • Piers Morgan Uncensored' | 'Episode' | 'Episode • Deep Dive with Ali Abdaal' | 'Episode • Breaking Points with Krystal and Saagar';
  readonly duration?: string;
  readonly date?: string;
  readonly description?: string;
  readonly isPlaying?: boolean;
  readonly playTime?: string;
}

export function SpotifyPodcastCard({
  imageUrl,
  title,
  author,
  category,
  duration,
  date,
  description,
  isPlaying = false,
  playTime
}: SpotifyPodcastCardProps): JSX.Element {
  return (
    <div className="group relative flex flex-col bg-[#181818] rounded-md p-4 transition-all duration-200 hover:bg-[#282828] cursor-pointer">
      {/* Image Container */}
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md shadow-[0_8px_24px_rgba(0,0,0,.5)]">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        
        {/* Play button overlay - only show on hover if not playing */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
            <button
              type="button"
              className="flex h-12 w-12 transform items-center justify-center rounded-full bg-[#1db954] shadow-xl transition-all duration-200 hover:scale-110"
              aria-label="Play"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-black">
                <path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"/>
              </svg>
            </button>
          </div>
        )}

        {/* Currently playing indicator */}
        {isPlaying && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-[#1db954] px-2 py-1">
            <div className="flex items-center gap-[2px]">
              <span className="h-3 w-[2px] animate-pulse bg-black" style={{ animationDelay: '0ms' }}/>
              <span className="h-4 w-[2px] animate-pulse bg-black" style={{ animationDelay: '150ms' }}/>
              <span className="h-2 w-[2px] animate-pulse bg-black" style={{ animationDelay: '300ms' }}/>
              <span className="h-3 w-[2px] animate-pulse bg-black" style={{ animationDelay: '450ms' }}/>
            </div>
          </div>
        )}

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-normal text-white">
            {duration}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-h-[62px] flex-col gap-1">
        {/* Title */}
        <h3 className="line-clamp-2 text-base font-bold leading-normal text-white">
          {title}
        </h3>

        {/* Metadata */}
        <div className="mt-1 flex flex-col gap-1 text-sm text-[#a7a7a7]">
          {/* Date if available */}
          {date && (
            <span className="text-sm">
              {date}
            </span>
          )}
          
          {/* Author and category */}
          <div className="flex items-center">
            <span className="line-clamp-1">
              {category.includes('•') ? category : `${category} • ${author}`}
            </span>
          </div>

          {/* Description if available */}
          {description && (
            <p className="mt-1 line-clamp-2 text-sm text-[#a7a7a7]">
              {description}
            </p>
          )}

          {/* Play time if currently playing */}
          {isPlaying && playTime && (
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1 w-full rounded-full bg-[#4d4d4d]">
                <div 
                  className="h-full rounded-full bg-white" 
                  style={{ width: playTime }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}