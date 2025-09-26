import type { JSX } from 'react';
import { SpotifyPodcastGrid } from '@/components/spotify-podcast-grid';

const mockPodcasts = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop',
    title: 'How To Lead Unmatched',
    author: '',
    category: 'Video • The Unmatched Tribe with Paul Mitchell' as const,
    date: 'Jan 21',
    duration: '16 min 27 sec',
    description: 'You cannot pour from an empty cup. It\'s a saying we\'ve often hear, but when people are in the context of leadership, it takes on a profound new depth.'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=400&fit=crop',
    title: 'My n8n AI agent scrapes Google Maps and makes cold calls (INSANE)',
    author: '',
    category: 'Video • The Startup Ideas Podcast' as const,
    date: 'Sep 19',
    duration: '27 min 24 sec',
    description: 'Find $30k/mo local businesses you can start. Get the guide: https://startupideas.com/local...'
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
    title: '"We\'re Never Told The TRUTH"Directors Oliver Stone and...',
    author: '',
    category: 'Video • Piers Morgan Uncensored' as const,
    date: 'Sep 19',
    duration: '35 min 32 sec',
    description: 'America has a long history of political assassinations, with the most iconic being those of John F Kennedy...'
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    title: 'Faith, Power & Chaos: My Conversation With Nick Fuentes - Stay Free #351',
    author: 'Russell Brand',
    category: 'Episode' as const,
    date: 'Sep 18',
    duration: '1 hr 58 min',
    isPlaying: true,
    playTime: '35%'
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
    title: 'Jimmy Kimmel OFF-AIR, Netanyahu DENIES Ceasefire as BOMBS...',
    author: '',
    category: 'Video • PBD Podcast' as const,
    date: 'Sep 20'
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop',
    title: 'How To Turn $100K into $4,000,000 with Nick Huber',
    author: '',
    category: 'Video • My First Million' as const,
    duration: '1 hr 2 min'
  },
  {
    id: '7',
    imageUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=400&fit=crop',
    title: '9/19/25: Trump CHEERS Kimmel Shutdown; Late Night RESPONDS',
    author: '',
    category: 'Episode • Breaking Points with Krystal and Saagar' as const,
    date: 'Sep 20'
  },
  {
    id: '8',
    imageUrl: 'https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=400&h=400&fit=crop',
    title: 'How I\'m Scaling My Business from 7 to 8 Figures with Ravi Abuvala',
    author: '',
    category: 'Episode • Deep Dive with Ali Abdaal' as const,
    duration: '45 min'
  }
];

const mockPodcasts2 = [
  {
    id: '9',
    imageUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=400&fit=crop',
    title: 'The Art of Learning: Josh Waitzkin on How to Master Any Skill',
    author: 'Tim Ferriss',
    category: 'Episode' as const,
    date: 'Sep 21',
    duration: '2 hr 15 min'
  },
  {
    id: '10',
    imageUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=400&fit=crop',
    title: 'Building a $100M Business in 3 Years',
    author: '',
    category: 'Video • My First Million' as const,
    date: 'Sep 20',
    duration: '58 min'
  },
  {
    id: '11',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    title: 'The Psychology of Money: Morgan Housel',
    author: '',
    category: 'Episode • Deep Dive with Ali Abdaal' as const,
    date: 'Sep 18',
    duration: '1 hr 32 min'
  },
  {
    id: '12',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop',
    title: 'How to Build Wealth in Your 20s',
    author: 'Graham Stephan',
    category: 'Video' as const,
    date: 'Sep 19',
    duration: '18 min'
  }
];

export default function SpotifyDemoPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#121212] p-8">
      <div className="mx-auto max-w-[1955px]">
        {/* Title */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Spotify Podcast Cards Demo
          </h1>
          <p className="mt-2 text-sm text-[#a7a7a7]">
            Ekran görüntüsündeki Spotify tasarımının birebir klonu
          </p>
        </header>

        {/* First Grid */}
        <div className="mb-12">
          <SpotifyPodcastGrid
            items={mockPodcasts}
            title="Popular with listeners of Deep Dive with Ali Abdaal"
            showAll={true}
          />
        </div>

        {/* Second Grid */}
        <div className="mb-12">
          <SpotifyPodcastGrid
            items={mockPodcasts2}
            title="Popular with listeners of Les Fridman Podcast"
            showAll={true}
          />
        </div>

        {/* Third Grid - Catch up on your shows */}
        <div>
          <SpotifyPodcastGrid
            items={mockPodcasts.slice(0, 4)}
            title="Catch up on your shows"
          />
        </div>
      </div>
    </div>
  );
}