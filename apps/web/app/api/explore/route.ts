import { NextRequest } from 'next/server';
import type { ExploreItem, ExplorePage, ProfileVector } from '../../../lib/types/reels';
import { SAMPLE_REELS } from '../reels/data';

const SAMPLE_PHOTOS: ExploreItem[] = Array.from({ length: 24 }).map((_, i) => ({
    kind: 'photo',
    id: `p${i + 1}`,
    title: `Foto haber ${i + 1}`,
    summary: 'Kısa özet metni. Bu alan ileride gerçek verilerle dolacak.',
    category: (['economy', 'sports', 'world', 'culture', 'tech'] as const)[i % 5],
    imageUrl: `https://picsum.photos/seed/p${i + 1}/1080/1350`,
    thumbUrl: `https://picsum.photos/seed/p${i + 1}/600/600`,
    hrefId: `n${i + 1}`,
}));

function sampleExplore(): ExploreItem[] {
    // interleave reel/photo 50-50
    const reels = SAMPLE_REELS.map(r => ({ kind: 'reel', ...r } as ExploreItem));
    const out: ExploreItem[] = [];
    for (let i = 0; i < Math.max(reels.length, SAMPLE_PHOTOS.length); i++) {
        if (i < reels.length) out.push(reels[i]);
        if (i < SAMPLE_PHOTOS.length) out.push(SAMPLE_PHOTOS[i]);
    }
    return out;
}

function parseProfile(req: NextRequest): ProfileVector {
    const encoded = req.nextUrl.searchParams.get('profile') || undefined;
    if (!encoded) return {};
    try { return JSON.parse(decodeURIComponent(encoded)); } catch { return {}; }
}

export async function GET(req: NextRequest) {
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get('limit')) || 24, 1), 60);
    const cursor = Number(req.nextUrl.searchParams.get('cursor')) || 0;
    const _profile = parseProfile(req);
    const pool = sampleExplore();
    const items = Array.from({ length: limit }, (_, i) => pool[(cursor + i) % pool.length]);
    const res: ExplorePage = { items, nextCursor: String(cursor + items.length) };
    return Response.json(res);
}



