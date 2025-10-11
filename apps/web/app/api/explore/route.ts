import { NextRequest } from 'next/server';

/**
 * Deprecated: This route now proxies to the backend API
 * Direct usage: Use /api/reels/explore from backend instead
 */
export async function GET(req: NextRequest) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Forward all query params to backend
    const limit = req.nextUrl.searchParams.get('limit') || '24';
    const cursor = req.nextUrl.searchParams.get('cursor') || '0';
    const category = req.nextUrl.searchParams.get('category');
    const userId = req.nextUrl.searchParams.get('userId');

    const params = new URLSearchParams({
        limit,
        cursor,
    });

    if (category) params.append('category', category);
    if (userId) params.append('userId', userId);

    try {
        const response = await fetch(`${API_URL}/api/reels/explore?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Backend API responded with ${response.status}`);
        }

        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        console.error('Failed to fetch from backend:', error);

        // Return empty response on error
        return Response.json({
            items: [],
            nextCursor: undefined,
            hasMore: false,
        });
    }
}



