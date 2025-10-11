import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Forward all query params to backend
    const pageSize = req.nextUrl.searchParams.get('pageSize') || '24';
    const page = req.nextUrl.searchParams.get('page') || '1';
    const sort = req.nextUrl.searchParams.get('sort') || 'recent';
    const category = req.nextUrl.searchParams.get('category');

    const params = new URLSearchParams({
        pageSize,
        page,
        sort,
    });

    if (category) params.append('category', category);

    try {
        const response = await fetch(`${API_URL}/api/reels/feed?${params.toString()}`, {
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
            success: true,
            data: {
                items: [],
                nextCursor: undefined,
                hasMore: false,
                total: 0
            },
            message: 'Reel feed retrieved successfully'
        });
    }
}