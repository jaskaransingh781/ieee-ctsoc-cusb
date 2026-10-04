import { useLiveNewsletterData } from './live';

const longMonth = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const shortMonth = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const checkedAt = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Kolkata',
});

/** '2026-09' -> { label: 'September 2026', short: 'Sept 2026' } */
export function describeIssue(issue) {
  const date = new Date(`${issue.month}-01T00:00:00Z`);
  return { ...issue, label: longMonth.format(date), short: shortMonth.format(date) };
}

/**
 * The newsletter section's data, ready to draw:
 *   state   'loading' | 'live' | 'offline'
 *   latest  the newest issue found, or null
 *   earlier the issues before it
 *   checked when the server last looked, in words
 */
export function useLiveNewsletter() {
  const data = useLiveNewsletterData();
  if (!data) return { state: 'loading', latest: null, earlier: [], checked: null };

  const issues = (data.ok && Array.isArray(data.issues) ? data.issues : [])
    .filter((issue) => /^\d{4}-\d{2}$/.test(issue?.month ?? '') && /^https:\/\/ctsoc\.ieee\.org\//.test(issue?.url ?? ''))
    .map(describeIssue);
  if (!issues.length) return { state: 'offline', latest: null, earlier: [], checked: null };

  const when = new Date(data.checkedAt ?? Date.now());
  return {
    state: 'live',
    latest: issues[0],
    earlier: issues.slice(1),
    checked: Number.isNaN(when.getTime()) ? 'just now' : `${checkedAt.format(when)} IST`,
  };
}
