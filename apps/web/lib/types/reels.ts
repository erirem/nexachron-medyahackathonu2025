export type ReelCategory = 'economy' | 'sports' | 'world' | 'culture' | 'tech';

export type Reel = {
    id: string;
    title: string;
    summary: string;
    category: ReelCategory;
    videoUrl: string;
    thumbUrl: string;
    durationSec: number;
    city?: string;
};

export type ProfileVector = Partial<Record<ReelCategory, number>>;

export type ReelsPage = {
    items: Reel[];
    nextCursor?: string;
};

export type ExploreItem =
    | ({ kind: 'reel' } & Reel)
    | {
        kind: 'photo';
        id: string;
        title: string;
        summary: string;
        category: ReelCategory;
        imageUrl: string;
        thumbUrl: string;
        hrefId: string; // future article id
    };

export type ExplorePage = {
    items: ExploreItem[];
    nextCursor?: string;
};


