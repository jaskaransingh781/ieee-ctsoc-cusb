import { useEffect, useState, useSyncExternalStore } from 'react';
import { getEventStatusVersion, refreshEventStatuses, subscribeEventStatuses } from '../data/events';
import { site } from '../data/site';

/**
 * Redraws the calling component when an event's status changes (an event
 * starts or ends while the page is open). Returns a number that goes up by
 * one each time, for use as a useMemo dependency.
 */
export function useLiveEvents() {
  return useSyncExternalStore(subscribeEventStatuses, getEventStatusVersion, getEventStatusVersion);
}

/** Checks the clock against every event twice a minute. Used once, by the app. */
export function useEventClock(every = 30_000) {
  useEffect(() => {
    refreshEventStatuses();
    const timer = setInterval(() => refreshEventStatuses(), every);
    return () => clearInterval(timer);
  }, [every]);
}

/** Sets the browser tab title for a page. */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${site.name}` : `${site.name} | ${site.branch}`;
  }, [title]);
}

/** True once the page has been scrolled past `offset` pixels. */
export function useScrolled(offset = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return scrolled;
}

/** Prevents the page behind an overlay (menu, lightbox) from scrolling. */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.classList.add('is-locked');
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.classList.remove('is-locked');
      body.style.paddingRight = '';
    };
  }, [locked]);
}
