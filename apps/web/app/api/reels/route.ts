import { NextRequest } from 'next/server';
import type { ProfileVector, Reel } from '../../../lib/types/reels';
import { SAMPLE_REELS } from './data';

function scoreReelByProfile(reel: Reel, profile: ProfileVector): number {
    const base = 0;
    const catScore = profile[reel.category] ?? 0;
    return base + catScore;
}

function parseProfile(req: NextRequest): ProfileVector {
    const encoded = req.nextUrl.searchParams.get('profile') || undefined;
    if (!encoded) return {};
    try {
        return JSON.parse(decodeURIComponent(encoded));
    } catch {
        return {};
    }
}

export async function GET(req: NextRequest) {
    const limitParam = req.nextUrl.searchParams.get('limit');
    const cursorParam = req.nextUrl.searchParams.get('cursor');
    const limit = Math.min(Math.max(Number(limitParam) || 12, 1), 50);
    const profile = parseProfile(req);

    // Cursor as numeric offset, allows infinite wrap simulation with repeat
    const startIndex = Number(cursorParam) || 0;
    const ranked = [...SAMPLE_REELS].sort((a, b) => scoreReelByProfile(b, profile) - scoreReelByProfile(a, profile));
    const looped = Array.from({ length: limit }, (_, i) => ranked[(startIndex + i) % ranked.length]);
    const slice = looped
        .sort((a, b) => scoreReelByProfile(b, profile) - scoreReelByProfile(a, profile));

    const items = slice;
    const nextCursor = String(startIndex + items.length);

    return Response.json({ items, nextCursor });
}



