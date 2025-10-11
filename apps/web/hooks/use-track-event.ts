"use client";

import { useCallback, useEffect } from "react";
import { initAnalyticsClient, trackEvent, type TrackEventPayload } from "../lib/analytics-client";

export function useTrackEvent() {
  useEffect(() => {
    initAnalyticsClient();
  }, []);

  return useCallback(async (payload: TrackEventPayload) => {
    await trackEvent(payload);
  }, []);
}


