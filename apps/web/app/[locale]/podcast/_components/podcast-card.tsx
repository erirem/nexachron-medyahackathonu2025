'use client';

interface Podcast {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  duration: string;
  category: string;
  isPlaying?: boolean;
}

interface PodcastCardProps {
  podcast: Podcast;
  onSelect: () => void;
}

export function PodcastCard({ podcast, onSelect }: PodcastCardProps) {
  return (
    <button
      onClick={onSelect}
      className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={podcast.imageUrl}
          alt={podcast.title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
        />
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-2 py-1 text-xs text-white">
          {podcast.duration}
        </div>

        {/* Category badge */}
        <div className="absolute top-2 left-2 rounded-lg bg-gradient-to-r from-[#0f6acd] to-[#1a8dff] px-2 py-1 text-xs text-white">
          {podcast.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 text-sm font-bold text-white line-clamp-1">
          {podcast.title}
        </h3>
        <p className="text-xs text-white/70 line-clamp-2">
          {podcast.subtitle}
        </p>
      </div>
    </button>
  );
}
