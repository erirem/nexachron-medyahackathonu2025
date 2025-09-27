'use client';

import { useEffect, type JSX, type ReactNode } from 'react';
import { useDynamicScrollbar } from './use-dynamic-scrollbar';

interface DynamicScrollbarWrapperProps {
  readonly children: ReactNode;
}

export function DynamicScrollbarWrapper({ children }: DynamicScrollbarWrapperProps): JSX.Element {
  // Ana container için dinamik scrollbar
  useDynamicScrollbar('article-scroll-container');
  
  // Sidebar için dinamik scrollbar
  useEffect(() => {
    const sidebarElements = document.querySelectorAll('.sidebar-scrollbar');
    
    sidebarElements.forEach((element) => {
      let scrollTimeout: NodeJS.Timeout | null = null;

      const handleScroll = () => {
        element.classList.add('scrolling');

        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        scrollTimeout = setTimeout(() => {
          element.classList.remove('scrolling');
        }, 1000);
      };

      element.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        element.removeEventListener('scroll', handleScroll);
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
      };
    });
  }, []);

  return <>{children}</>;
}