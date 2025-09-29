'use client';

import { useEffect, type JSX, type ReactNode } from 'react';

interface SmoothScrollWrapperProps {
  readonly children: ReactNode;
}

export function SmoothScrollWrapper({ children }: SmoothScrollWrapperProps): JSX.Element {
  useEffect(() => {
    // Add smooth scrolling to all internal links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="#"]');
      
      if (link && link instanceof HTMLAnchorElement) {
        e.preventDefault();
        const targetId = link.hash.slice(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', handleClick);
    
    // Enable smooth scroll for the whole page
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  useEffect(() => {
    // Add intersection observer for fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            entry.target.classList.remove('opacity-0');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section) => {
      section.classList.add('opacity-0', 'transition-opacity', 'duration-700');
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return <>{children}</>;
}