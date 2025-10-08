import { NextRequest } from 'next/server';
import type { ProfileVector } from '../../../../lib/types/reels';
import { SAMPLE_REELS } from '../../data';

function parseProfile(req: NextRequest): ProfileVector {
    const encoded = req.nextUrl.searchParams.get('profile') || undefined;
    if (!encoded) return {};
    try {
        return JSON.parse(decodeURIComponent(encoded));
    } catch {
        return {};
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const dir = (req.nextUrl.searchParams.get('dir') || 'up') as 'up' | 'down';
    const profile = parseProfile(req);

    const index = SAMPLE_REELS.findIndex(r => r.id === id);
    if (index < 0) return Response.json({ item: SAMPLE_REELS[0] });

    // For simplicity, ignore profile ranking here and step +/-1 with wrap
    const delta = dir === 'up' ? 1 : -1;
    const nextIndex = (index + delta + SAMPLE_REELS.length) % SAMPLE_REELS.length;
    const item = SAMPLE_REELS[nextIndex];
    return Response.json({ item });
}



