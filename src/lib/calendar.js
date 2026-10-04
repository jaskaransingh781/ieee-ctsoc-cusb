// ---------------------------------------------------------------------------
// Calendar maths for the "Our calendar" section. Plain functions with no
// React in them, so they can be tested on their own (npm test).
// All days are India days ('YYYY-MM-DD' read in Asia/Kolkata).
// ---------------------------------------------------------------------------

const IST = 'Asia/Kolkata';
const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: IST }); // YYYY-MM-DD

/** 'YYYY-MM-DD' for a moment in time, in India. */
export const istDay = (time = Date.now()) => dayFormat.format(new Date(time));

const pad = (value) => String(value).padStart(2, '0');
const iso = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`;

/** Start and end of an India day as timestamps. */
const dayStart = (day) => new Date(`${day}T00:00:00+05:30`).getTime();
const dayEnd = (day) => new Date(`${day}T23:59:59+05:30`).getTime();

/** Adds days to a 'YYYY-MM-DD' string. */
export function addDays(day, count) {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + count));
  return iso(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/**
 * The weeks of a month, Monday first. Each day is
 *   { iso, day, inMonth }
 * and days from the neighbouring months fill the first and last week.
 */
export function monthMatrix(year, month) {
  const first = iso(year, month, 1);
  const weekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const weeks = Math.ceil((weekday + daysInMonth) / 7);
  const start = addDays(first, -weekday);

  return Array.from({ length: weeks }, (_, week) =>
    Array.from({ length: 7 }, (__, column) => {
      const day = addDays(start, week * 7 + column);
      return { iso: day, day: Number(day.slice(8)), inMonth: day.slice(0, 7) === first.slice(0, 7) };
    }),
  );
}

/**
 * Everything the calendar can draw, from the events list:
 *   kind 'event'    an event's day or days
 *   kind 'window'   the lighter band after a main day (IEEE Day celebrations)
 *   kind 'deadline' a registration or submission deadline
 * and, separately, past events known only by month.
 */
export function buildCalendar(events) {
  const entries = [];
  const monthly = [];

  for (const event of events) {
    const to = `/events/${event.slug}`;

    if (event.date) {
      const end = event.endDate ?? event.date;
      if (event.windowLabel && end !== event.date) {
        // A main day, then a window of celebrations.
        entries.push({
          id: event.slug,
          kind: 'event',
          title: event.title,
          short: event.short ?? event.title,
          start: event.date,
          end: event.date,
          from: dayStart(event.date),
          until: dayEnd(end),
          dateLabel: event.dateLabel,
          to,
        });
        entries.push({
          id: `${event.slug}-window`,
          kind: 'window',
          title: event.windowLabel,
          short: event.windowLabel,
          start: addDays(event.date, 1),
          end,
          from: dayStart(event.date),
          until: dayEnd(end),
          to,
        });
      } else {
        entries.push({
          id: event.slug,
          kind: 'event',
          title: event.title,
          short: event.short ?? event.title,
          start: event.date,
          end,
          from: event.startsAt ? new Date(event.startsAt).getTime() : dayStart(event.date),
          until: event.endsAt ? new Date(event.endsAt).getTime() : dayEnd(end),
          to,
        });
      }
    } else if (event.months?.length) {
      monthly.push({ id: event.slug, title: event.title, months: event.months, dateLabel: event.dateLabel, to });
    }

    if (event.registrationUrl && event.registrationCloses) {
      const day = istDay(event.registrationCloses);
      entries.push({
        id: `${event.slug}-registration`,
        kind: 'deadline',
        title: `${event.title}: registration closes`,
        short: 'Reg. closes',
        start: day,
        end: day,
        from: dayStart(day),
        until: new Date(event.registrationCloses).getTime(),
        to,
      });
    }

    if (event.submission?.deadline) {
      const day = event.submission.deadline;
      entries.push({
        id: `${event.slug}-submission`,
        kind: 'deadline',
        title: `${event.title}: ${event.submission.label} closes`,
        short: 'PPT due',
        start: day,
        end: day,
        from: dayStart(day),
        until: dayEnd(day),
        to,
      });
    }
  }

  entries.sort((a, b) => a.start.localeCompare(b.start) || a.kind.localeCompare(b.kind));
  return { entries, monthly };
}

/** 'upcoming' before it starts, 'ongoing' while it runs, 'past' afterwards. */
export function entryStatus(entry, now = Date.now()) {
  if (now > entry.until) return 'past';
  if (now >= entry.from) return 'ongoing';
  return 'upcoming';
}

/**
 * The bars to draw in one week. Each bar says which column it starts in,
 * how many days it spans within this week, and which lane (row) it sits in
 * so that bars never overlap.
 */
export function weekBars(week, entries) {
  const first = week[0].iso;
  const last = week[6].iso;
  const lanes = [];
  const bars = [];

  for (const entry of entries) {
    if (entry.end < first || entry.start > last) continue;
    const from = entry.start < first ? first : entry.start;
    const to = entry.end > last ? last : entry.end;
    const column = week.findIndex((day) => day.iso === from);
    const span = week.findIndex((day) => day.iso === to) - column + 1;

    let lane = lanes.findIndex((busyUntil) => busyUntil < column);
    if (lane === -1) lane = lanes.length;
    lanes[lane] = column + span - 1;

    bars.push({ entry, column, span, lane, startsHere: entry.start >= first, endsHere: entry.end <= last });
  }

  return { bars, lanes: lanes.length };
}

/** Months ('YYYY-MM') that have something on the calendar, oldest first. */
export function monthsWithEntries({ entries, monthly }) {
  const months = new Set();
  for (const entry of entries) {
    months.add(entry.start.slice(0, 7));
    months.add(entry.end.slice(0, 7));
  }
  for (const item of monthly) item.months.forEach((month) => months.add(month));
  return [...months].sort();
}

/** What falls in a month: dated entries, then the month-only past events. */
export function monthAgenda({ entries, monthly }, month) {
  return {
    dated: entries.filter(
      (entry) => entry.kind !== 'window' && entry.start.slice(0, 7) <= month && entry.end.slice(0, 7) >= month,
    ),
    windows: entries.filter(
      (entry) => entry.kind === 'window' && entry.start.slice(0, 7) <= month && entry.end.slice(0, 7) >= month,
    ),
    undated: monthly.filter((item) => item.months.includes(month)),
  };
}
