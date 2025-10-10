'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface NewsTrackingContextType {
  readNewsIds: Set<string>;
  markNewsAsRead: (newsId: string) => void;
  isNewsRead: (newsId: string) => boolean;
  getReadPercentage: (totalNewsCount: number) => number;
  shouldShowTriviaPopup: (totalNewsCount: number) => boolean;
  dismissTriviaPopup: () => void;
  hasDismissedTriviaPopup: boolean;
}

const NewsTrackingContext = createContext<NewsTrackingContextType | undefined>(undefined);

// Local storage key for tracking read news
const READ_NEWS_STORAGE_KEY = 'nexachron_read_news';
const TRIVIA_POPUP_DISMISSED_KEY = 'nexachron_trivia_popup_dismissed';

export function NewsTrackingProvider({ children }: { children: ReactNode }) {
  const [readNewsIds, setReadNewsIds] = useState<Set<string>>(new Set());
  const [hasDismissedTriviaPopup, setHasDismissedTriviaPopup] = useState(false);

  // Load read news from localStorage on mount
  useEffect(() => {
    try {
      const storedReadNews = localStorage.getItem(READ_NEWS_STORAGE_KEY);
      const storedDismissed = localStorage.getItem(TRIVIA_POPUP_DISMISSED_KEY);
      
      if (storedReadNews) {
        const readIds = JSON.parse(storedReadNews) as string[];
        setReadNewsIds(new Set(readIds));
      }
      
      if (storedDismissed) {
        setHasDismissedTriviaPopup(JSON.parse(storedDismissed));
      }
    } catch (error) {
      console.error('Failed to load news tracking data:', error);
    }
  }, []);

  // Save read news to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(READ_NEWS_STORAGE_KEY, JSON.stringify(Array.from(readNewsIds)));
    } catch (error) {
      console.error('Failed to save news tracking data:', error);
    }
  }, [readNewsIds]);

  // Save popup dismissal state
  useEffect(() => {
    try {
      localStorage.setItem(TRIVIA_POPUP_DISMISSED_KEY, JSON.stringify(hasDismissedTriviaPopup));
    } catch (error) {
      console.error('Failed to save popup dismissal state:', error);
    }
  }, [hasDismissedTriviaPopup]);

  const markNewsAsRead = useCallback((newsId: string) => {
    setReadNewsIds(prev => new Set([...prev, newsId]));
  }, []);

  const isNewsRead = useCallback((newsId: string) => {
    return readNewsIds.has(newsId);
  }, [readNewsIds]);

  const getReadPercentage = useCallback((totalNewsCount: number) => {
    if (totalNewsCount === 0) return 0;
    return Math.round((readNewsIds.size / totalNewsCount) * 100);
  }, [readNewsIds.size]);

  const shouldShowTriviaPopup = useCallback((totalNewsCount: number) => {
    if (hasDismissedTriviaPopup) return false;
    if (totalNewsCount === 0) return false;
    
    const readPercentage = getReadPercentage(totalNewsCount);
    console.log(`[NewsTracking] Checking trivia popup: ${readNewsIds.size}/${totalNewsCount} (${readPercentage}%)`);
    return readPercentage >= 80;
  }, [hasDismissedTriviaPopup, getReadPercentage, readNewsIds.size]);

  const dismissTriviaPopup = useCallback(() => {
    setHasDismissedTriviaPopup(true);
  }, []);

  return (
    <NewsTrackingContext.Provider value={{
      readNewsIds,
      markNewsAsRead,
      isNewsRead,
      getReadPercentage,
      shouldShowTriviaPopup,
      dismissTriviaPopup,
      hasDismissedTriviaPopup
    }}>
      {children}
    </NewsTrackingContext.Provider>
  );
}

export const useNewsTracking = () => {
  const context = useContext(NewsTrackingContext);
  if (context === undefined) {
    throw new Error('useNewsTracking must be used within a NewsTrackingProvider');
  }
  return context;
};
