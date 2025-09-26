'use client';

import type { JSX } from 'react';
import { SpotifyNewsCard } from './spotify-news-card';
import type { DashboardNewsItem } from './types';

interface SpotifyNewsGridProps {
  readonly items: DashboardNewsItem[];
  readonly title?: string;
  readonly subtitle?: string;
  readonly showAll?: boolean;
}

export function SpotifyNewsGrid({
  items,
  title = "Popular with listeners of Deep Dive with Ali Abdaal",
  subtitle,
  showAll = false
}: SpotifyNewsGridProps): JSX.Element {
  return (
    <section className="w-full">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          {title && (
            <h2 className="text-2xl font-semibold text-white/90">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-white/60">
              {subtitle}
            </p>
          )}
        </div>
        {showAll && (
          <button
            type="button"
            className="rounded-full border border-white/10 px-4 py-1.5 text-sm font-semibold text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            Tümünü Gör
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {items.map((item) => (
          <SpotifyNewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
