// Re-export from API service for backward compatibility
export type { ExploreItem, ExploreFeedResponse } from '../../services/api';

// Legacy types - kept for reference
export type ReelCategory = 'economy' | 'sports' | 'world' | 'culture' | 'tech' |
    'gundem' | 'ekonomi' | 'spor' | 'teknoloji' | 'savunma' | 'enerji' | 'kultur' | 'general';

export type Reel = {
    id: string;
    title: string;
    summary: string;
    category: string;
    videoUrl: string;
    thumbUrl: string;
    durationSec: number;
    city?: string;
    hrefId?: string;
};

export type ProfileVector = Partial<Record<ReelCategory, number>>;

export type ReelsPage = {
    items: Reel[];
    nextCursor?: string;
};

// Deprecated: Use ExploreFeedResponse from services/api instead
export type ExplorePage = {
    items: Array<{ kind: 'reel' } & Reel>;
    nextCursor?: string;
};


