import { useEffect, useState } from 'react';

const pad = (value) => String(value).padStart(2, '0');

/**
 * Live countdown to a date-time string such as '2026-10-30T09:00:00+05:30'.
 * Returns null when no target is given, otherwise
 *   { done, days, hours, minutes, seconds, hh, mm, ss }
 * and re-renders the calling component once a second.
 */
export function useCountdown(target) {
  const time = target ? new Date(target).getTime() : NaN;
  const valid = Number.isFinite(time);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!valid) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [valid, time]);

  if (!valid) return null;

  const left = Math.max(0, time - now);
  const days = Math.floor(left / 86_400_000);
  const hours = Math.floor(left / 3_600_000) % 24;
  const minutes = Math.floor(left / 60_000) % 60;
  const seconds = Math.floor(left / 1000) % 60;

  return { done: time - now <= 0, days, hours, minutes, seconds, hh: pad(hours), mm: pad(minutes), ss: pad(seconds) };
}

/** The current time, refreshed on a timer (every second by default). */
export function useNow(every = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), every);
    return () => clearInterval(timer);
  }, [every]);
  return now;
}
