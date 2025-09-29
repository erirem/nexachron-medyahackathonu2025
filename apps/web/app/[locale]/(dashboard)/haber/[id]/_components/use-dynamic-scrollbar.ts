'use client';

import { useEffect, useRef } from 'react';

export function useDynamicScrollbar(elementId?: string) {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const element = elementId 
      ? document.getElementById(elementId)
      : document.documentElement;
    
    if (!element) return;

    const handleScroll = () => {
      // Add scrolling class
      element.classList.add('scrolling');

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Remove scrolling class after scroll ends
      scrollTimeoutRef.current = setTimeout(() => {
        element.classList.remove('scrolling');
      }, 1000); // Hide scrollbar 1 second after scrolling stops
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [elementId]);
}