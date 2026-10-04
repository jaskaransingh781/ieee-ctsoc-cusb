const LOCALE = 'en-IN';

function parse(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

const dayMonthYear = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
const monthYear = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });
const dayMonth = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' });

/** "30 to 31 October 2026", "5 October 2026", or the event's own dateLabel. */
export function formatEventDate(event, fallback = 'Date to be announced') {
  if (event.dateLabel) return event.dateLabel;
  const start = parse(event.date);
  if (!start) return fallback;
  const end = parse(event.endDate);
  if (!end || end.getTime() === start.getTime()) return dayMonthYear.format(start);
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${start.getDate()} to ${end.getDate()} ${monthYear.format(start)}`;
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${dayMonth.format(start)} to ${dayMonthYear.format(end)}`;
  }
  return `${dayMonthYear.format(start)} to ${dayMonthYear.format(end)}`;
}

export function formatDate(iso) {
  const date = parse(iso);
  return date ? dayMonthYear.format(date) : null;
}

/** Whole days from today until the given date. Negative once it has passed. */
export function daysUntil(iso, now = new Date()) {
  const date = parse(iso);
  if (!date) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((date - today) / 86_400_000);
}

/**
 * Short mark for the typographic event visual.
 *   "MATLAB Workshop" -> "MW"     "Algolympia" -> "AL"
 *   "Zinnovatio 3.O"  -> "Z3"     (a numbered edition keeps its number)
 */
export function initials(title = '') {
  const words = title.split(/\s+/).filter(Boolean);
  const lettered = words.filter((word) => /^\p{L}/u.test(word));
  const numbered = words.find((word) => /^\d/.test(word));
  if (!lettered.length) return title.slice(0, 2).toUpperCase();
  if (lettered.length === 1) {
    const first = lettered[0];
    if (numbered) return `${first[0]}${numbered[0]}`.toUpperCase();
    return first.slice(0, 2).toUpperCase();
  }
  return lettered
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

/** True until the end of the given day in India (dates are 'YYYY-MM-DD'). */
export function isStillOpen(iso, now = Date.now()) {
  if (!iso) return true;
  const end = new Date(`${iso}T23:59:59+05:30`).getTime();
  return Number.isFinite(end) ? now <= end : true;
}

/** "4 October 2026" from a full date-time string, read in India time. */
export function formatDay(dateTime) {
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

const istDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
const istTime = new Intl.DateTimeFormat('en-IN', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Kolkata',
});

/**
 * A deadline in plain words, read in India time.
 *   { day: 'Today' | 'Tomorrow' | '4 October 2026', time: '11:59 PM IST' }
 */
export function formatDeadline(dateTime, now = Date.now()) {
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return null;
  const target = istDay.format(date);
  const today = istDay.format(new Date(now));
  const tomorrow = istDay.format(new Date(now + 86_400_000));
  const day = target === today ? 'Today' : target === tomorrow ? 'Tomorrow' : formatDay(dateTime);
  const time = `${istTime.format(date).replace(/\s?(am|pm)$/i, (match) => ` ${match.trim().toUpperCase()}`)} IST`;
  return { day, time };
}
