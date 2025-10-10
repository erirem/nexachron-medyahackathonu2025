"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useTrackEvent } from './use-track-event';

interface ReadingTimeOptions {
  itemId: string;
  category?: string;
  surface?: string;
  minReadingTime?: number; // Minimum seconds to count as reading
  maxReadingTime?: number; // Maximum seconds to track per session
  heartbeatInterval?: number; // How often to send heartbeat (seconds)
}

interface ReadingSession {
  startTime: number;
  lastActivity: number;
  totalTime: number;
  isActive: boolean;
  heartbeatTimer?: NodeJS.Timeout;
}

export function useReadingTime(options: ReadingTimeOptions) {
  const {
    itemId,
    category,
    surface = 'news_detail',
    minReadingTime = 5, // 5 seconds minimum
    maxReadingTime = 1800, // 30 minutes maximum
    heartbeatInterval = 30, // 30 seconds heartbeat
  } = options;

  const track = useTrackEvent();
  const sessionRef = useRef<ReadingSession | null>(null);
  const lastScrollRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  // Start reading session
  const startReading = useCallback(() => {
    if (sessionRef.current?.isActive) return;

    const now = Date.now();
    sessionRef.current = {
      startTime: now,
      lastActivity: now,
      totalTime: 0,
      isActive: true,
    };

    // Track reading start
    track({
      eventType: 'reading_start',
      itemId,
      metadata: {
        surface,
        category,
        timestamp: new Date(now).toISOString(),
      },
    });

    // Set up heartbeat timer
    sessionRef.current.heartbeatTimer = setInterval(() => {
      if (sessionRef.current?.isActive) {
        updateReadingTime();
      }
    }, heartbeatInterval * 1000);

    console.debug(`[ReadingTime] Started reading session for ${itemId}`);
  }, [itemId, category, surface, track, heartbeatInterval]);

  // Update reading time based on activity
  const updateReadingTime = useCallback(() => {
    if (!sessionRef.current?.isActive) return;

    const now = Date.now();
    const timeSinceLastActivity = (now - sessionRef.current.lastActivity) / 1000;
    
    // Only count time if user was active recently (within 2 minutes)
    if (timeSinceLastActivity <= 120 && isVisibleRef.current) {
      const sessionTime = (now - sessionRef.current.startTime) / 1000;
      const newTotalTime = Math.min(sessionTime, maxReadingTime);
      
      // Only track if we've reached minimum reading time
      if (newTotalTime >= minReadingTime && newTotalTime > sessionRef.current.totalTime) {
        const timeToTrack = newTotalTime - sessionRef.current.totalTime;
        sessionRef.current.totalTime = newTotalTime;

        // Send reading time update
        track({
          eventType: 'reading_time',
          itemId,
          metadata: {
            surface,
            category,
            reading_time_seconds: Math.floor(newTotalTime),
            time_increment: Math.floor(timeToTrack),
            timestamp: new Date(now).toISOString(),
          },
        });

        console.debug(`[ReadingTime] Updated reading time: ${Math.floor(newTotalTime)}s for ${itemId}`);
      }
    }

    sessionRef.current.lastActivity = now;
  }, [itemId, category, surface, track, minReadingTime, maxReadingTime]);

  // End reading session
  const endReading = useCallback((reason: 'user_action' | 'page_unload' | 'timeout' = 'user_action') => {
    if (!sessionRef.current?.isActive) return;

    const session = sessionRef.current;
    session.isActive = false;

    // Clear heartbeat timer
    if (session.heartbeatTimer) {
      clearInterval(session.heartbeatTimer);
      session.heartbeatTimer = undefined;
    }

    // Final reading time update
    if (session.totalTime >= minReadingTime) {
      track({
        eventType: 'reading_time',
        itemId,
        metadata: {
          surface,
          category,
          reading_time_seconds: Math.floor(session.totalTime),
          session_end: true,
          end_reason: reason,
          timestamp: new Date().toISOString(),
        },
      });

      // Track completion if significant reading time
      if (session.totalTime >= 60) { // 1+ minute
        track({
          eventType: 'read_complete',
          itemId,
          metadata: {
            surface,
            category,
            reading_time_seconds: Math.floor(session.totalTime),
            completion_quality: session.totalTime >= 300 ? 'high' : 'medium',
            timestamp: new Date().toISOString(),
          },
        });
      }

      console.debug(`[ReadingTime] Ended reading session: ${Math.floor(session.totalTime)}s for ${itemId}`);
    }

    sessionRef.current = null;
  }, [itemId, category, surface, track, minReadingTime]);

  // Handle scroll activity
  const handleScroll = useCallback(() => {
    const now = Date.now();
    lastScrollRef.current = now;
    
    if (!sessionRef.current?.isActive) {
      startReading();
    } else {
      updateReadingTime();
    }
  }, [startReading, updateReadingTime]);

  // Handle visibility change
  const handleVisibilityChange = useCallback(() => {
    isVisibleRef.current = !document.hidden;
    
    if (document.hidden && sessionRef.current?.isActive) {
      // Pause reading when tab is hidden
      updateReadingTime();
    } else if (!document.hidden && sessionRef.current?.isActive) {
      // Resume reading when tab becomes visible
      sessionRef.current.lastActivity = Date.now();
    }
  }, [updateReadingTime]);

  // Handle page unload
  const handleBeforeUnload = useCallback(() => {
    endReading('page_unload');
  }, [endReading]);

  // Set up event listeners
  useEffect(() => {
    // Start reading on mount
    startReading();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add beforeunload listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // End reading session
      endReading('user_action');
    };
  }, [startReading, handleScroll, handleVisibilityChange, handleBeforeUnload, endReading]);

  // Return reading session info for debugging
  return {
    isReading: sessionRef.current?.isActive || false,
    readingTime: sessionRef.current?.totalTime || 0,
    startReading,
    endReading,
  };
}
