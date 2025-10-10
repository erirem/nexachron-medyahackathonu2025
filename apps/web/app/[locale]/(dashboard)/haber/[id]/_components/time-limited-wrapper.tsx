'use client';

import { useState, useEffect, type JSX } from 'react';
import { ReadingProgress } from './reading-progress';

interface TimeLimitedWrapperProps {
  readonly articleTitle: string;
  readonly articleUrl: string;
  readonly newsId: string;
}

export function TimeLimitedWrapper({ 
  articleTitle, 
  articleUrl, 
  newsId 
}: TimeLimitedWrapperProps): JSX.Element {
  const [isTimeLimited, setIsTimeLimited] = useState(false);

  useEffect(() => {
    // Check if this news is time-limited from localStorage
    const timeLimitedNews = JSON.parse(localStorage.getItem('timeLimitedNews') || '[]');
    setIsTimeLimited(timeLimitedNews.includes(newsId));
  }, [newsId]);

  return (
    <ReadingProgress 
      articleTitle={articleTitle}
      articleUrl={articleUrl}
      newsId={newsId}
      isTimeLimited={isTimeLimited}
    />
  );
}

