'use client';

import type { JSX } from 'react';
import { SpotifyPodcastCard } from './spotify-podcast-card';

interface PodcastItem {
  readonly id: string;
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

interface SpotifyPodcastGridProps {
  readonly items: PodcastItem[];
  readonly title?: string;
  readonly subtitle?: string;
  readonly showAll?: boolean;
}

export function SpotifyPodcastGrid({
  items,
  title = "Popular with listeners of Deep Dive with Ali Abdaal",
  subtitle,
  showAll = false
}: SpotifyPodcastGridProps): JSX.Element {
  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          {title && (
            <h2 className="text-2xl font-bold text-white">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-[#a7a7a7]">
              {subtitle}
            </p>
          )}
        </div>
        {showAll && (
          <button
            type="button"
            className="text-sm font-bold text-[#a7a7a7] transition-colors hover:text-white"
          >
            Show all
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
        {items.map((item) => (
          <SpotifyPodcastCard
            key={item.id}
            imageUrl={item.imageUrl}
            title={item.title}
            author={item.author}
            category={item.category}
            duration={item.duration}
            date={item.date}
            description={item.description}
            isPlaying={item.isPlaying}
            playTime={item.playTime}
          />
        ))}
      </div>
    </section>
  );
}