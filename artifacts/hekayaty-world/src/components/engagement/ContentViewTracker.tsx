import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';

interface ContentViewTrackerProps {
  contentType: 'novel' | 'story' | 'comic' | 'series' | 'episode' | 'chapter';
  contentId: string;
  source?: string;
}

function getAnonymousSessionId(): string {
  if (typeof window === 'undefined') return '';
  const KEY = 'hky_anon_session_id';
  let sid = localStorage.getItem(KEY);
  if (!sid) {
    sid = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(KEY, sid);
  }
  return sid;
}

function detectDeviceCategory(): string {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function ContentViewTracker({ contentType, contentId, source = 'direct' }: ContentViewTrackerProps) {
  const trackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!contentId || trackedRef.current) return;

    // Meaningful view delay: 1500ms after component mounts to avoid counting quick bounces or bot pre-renders
    const timer = setTimeout(() => {
      trackedRef.current = true;
      const anonymousSessionId = getAnonymousSessionId();
      const deviceCategory = detectDeviceCategory();

      api.recordView({
        contentType,
        contentId,
        anonymousSessionId,
        source,
        deviceCategory,
      }).catch(() => {});
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [contentType, contentId, source]);

  return null;
}
