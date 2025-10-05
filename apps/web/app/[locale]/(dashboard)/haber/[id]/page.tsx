import { notFound } from 'next/navigation';
import { type JSX } from 'react';
import { NewsArticle } from './_components/news-article';
import { NewsSidebar } from './_components/news-sidebar';
import { ReadingProgress } from './_components/reading-progress';
import { SmoothScrollWrapper } from './_components/smooth-scroll-wrapper';
import { DynamicScrollbarWrapper } from './_components/dynamic-scrollbar-wrapper';
import type { DashboardNewsItem } from '../../dashboard/_components/types';
import { fetchNewsById, fetchNewsList } from '@/services/api';
import './_components/scrollbar.css';

export default async function NewsPage({ params }: { params: Promise<{ id: string; locale: string }> }): Promise<JSX.Element> {
  const { id, locale } = await params;
  
  try {
    // Fetch the specific news article by ID
    const articleData = await fetchNewsById(id);
    // Transform the article data to match the expected format
    const article = transformNewsDataToDashboardItem(articleData);
    
    if (!article) {
      notFound();
    }

    // Fetch related news based on category
    const relatedNewsData = await fetchNewsList({ 
      categoryId: article.categoryId || undefined, 
      limit: 4 
    });
    
    // Transform related news data
    const relatedNews = relatedNewsData.items
      .filter(item => item.id !== id)
      .map(transformNewsDataToDashboardItem)
      .slice(0, 4);

    // Fetch popular news for sidebar
    const popularNewsData = await fetchNewsList({ 
      isPopular: true, 
      limit: 6 
    });
    
    // Transform popular news data
    const popularNews = popularNewsData.items
      .map(transformNewsDataToDashboardItem);

    // Fetch recent news for sidebar
    const recentNewsData = await fetchNewsList({ 
      limit: 5 
    });
    
    // Transform recent news data
    const recentNews = recentNewsData.items
      .map(transformNewsDataToDashboardItem);

    const currentUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://nexachron.com'}/${locale}/haber/${article.id}`;
    
    return (
      <>
        <ReadingProgress 
          articleTitle={article.title}
          articleUrl={currentUrl}
        />
        
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#162639_0%,#1a2234_55%,#0f1624_100%)]">
          <DynamicScrollbarWrapper>
            <SmoothScrollWrapper>
            <div className="container mx-auto px-6 py-8">
              <div className="flex gap-8 max-w-7xl mx-auto lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
                {/* Main Content */}
                <main className="flex-1 min-w-0">
                  <div
                    id="article-scroll-container"
                    className="lg:h-full lg:overflow-y-auto lg:pr-6 lg:pb-12 dynamic-scrollbar"
                  >
                    <NewsArticle 
                      article={article} 
                      relatedNews={relatedNews}
                      allNews={recentNewsData.items.map(transformNewsDataToDashboardItem)}
                    />
                  </div>
                </main>
                
                {/* Sidebar */}
                <NewsSidebar 
                  popularNews={popularNews}
                  recentNews={recentNews}
                  currentArticleId={article.id}
                />
              </div>
            </div>
            </SmoothScrollWrapper>
          </DynamicScrollbarWrapper>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error fetching news article:', error);
    notFound();
  }
}

// Helper function to transform news data to dashboard item format
function transformNewsDataToDashboardItem(item: any): DashboardNewsItem {
  // Parse media_summary if it exists and is a string
  let mediaSummary = null;
  if (item.media_summary) {
    try {
      // Check if it's already an object or a string that needs parsing
      mediaSummary = typeof item.media_summary === 'string' 
        ? JSON.parse(item.media_summary) 
        : item.media_summary;
    } catch (e) {
      console.error('Error parsing media_summary:', e);
      mediaSummary = null;
    }
  }

  // Extract images from media_summary if available, otherwise use other image sources
  let extractedImages = [];
  let primaryImageUrl = '';

  if (mediaSummary && mediaSummary.gallery_images && Array.isArray(mediaSummary.gallery_images)) {
    extractedImages = mediaSummary.gallery_images.map((img: any) => ({
      url: img.url,
      alt: item.title,
      caption: img.caption || undefined,
      credit: undefined,
    }));
    
    // Set featured image as primary if available
    if (mediaSummary.featured_image) {
      primaryImageUrl = mediaSummary.featured_image;
    } else if (extractedImages.length > 0) {
      primaryImageUrl = extractedImages[0].url;
    }
  } else {
    // Fallback to other image sources
    extractedImages = item.media?.map((media: any) => ({
      url: media.url,
      alt: item.title,
      caption: media.caption || undefined,
      credit: undefined,
    })) || [];
    
    if (item.media?.[0]?.url) {
      primaryImageUrl = item.media[0].url;
    } else if (item.image_url) {
      primaryImageUrl = item.image_url;
    } else if (item.primaryMedia?.url) {
      primaryImageUrl = item.primaryMedia.url;
    }
  }

  return {
    id: item.id,
    category: item.categoryId || item.category || 'Diğer',
    categoryId: item.categoryId || null,
    title: item.title || 'Başlık yok',
    summary: item.summary || item.content?.substring(0, 100) + '...' || '',
    detail: item.content || item.summary || '',
    fullContent: item.content || '',
    timestamp: item.createdAt ? formatRelativeTime(new Date(item.createdAt)) : 'Yakın zamanda',
    publishedAt: item.publishedAt || item.createdAt || new Date().toISOString(),
    storyDate: item.publishedAt || item.createdAt || new Date().toISOString(),
    readingTime: estimateReadingTime(item.content || ''),
    dateline: item.city || 'Türkiye',
    tags: [item.categoryId || item.category || 'genel'],
    imageUrl: primaryImageUrl,
    images: extractedImages,
    sentiment: item.isPopular ? 'positive' : 'neutral',
    impact: item.isPopular ? 'Yüksek' : 'Orta',
    viewCount: undefined, // Not available in the API response
    likeCount: undefined, // Not available in the API response
    shareCount: undefined, // Not available in the API response
    relatedIds: undefined,
    storyId: undefined,
    timelineOrder: undefined,
    storyTitle: undefined,
    author: undefined,
    isPopular: item.isPopular || false,
    city: item.city || null,
    createdAt: item.createdAt,
    subtitle: undefined,
  };
}

function formatRelativeTime(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat('tr', { numeric: 'auto' });
  const diffMinutes = Math.round(diffMs / 60000);

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMs / (60 * 60000));
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffMs / (24 * 60 * 60000));
  return rtf.format(diffDays, 'day');
}

function estimateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} dk okuma`;
}
