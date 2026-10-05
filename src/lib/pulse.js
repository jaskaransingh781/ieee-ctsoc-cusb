// ---------------------------------------------------------------------------
// What the pop-up at the corner of the screen should be saying right now.
// Plain functions, no React, so they can be tested on their own (npm test).
//
//   'live'      an event is happening now
//   'soon'      an event starts within COUNTDOWN_DAYS: "get ready"
//   'deadline'  registration closes within COUNTDOWN_DAYS
// ---------------------------------------------------------------------------

const DAY = 86_400_000;

function spanOf(event) {
  if (!event?.date) return null;
  const start = new Date(event.startsAt ?? `${event.date}T00:00:00+05:30`).getTime();
  const end = new Date(event.endsAt ?? `${event.endDate ?? event.date}T23:59:59+05:30`).getTime();
  return Number.isFinite(start) && Number.isFinite(end) ? { start, end } : null;
}

/**
 * The notices for this moment, most pressing first:
 * things happening now, then whatever is closest.
 */
export function getPulseItems(events, now = Date.now(), days = 3) {
  const within = days * DAY;
  const items = [];

  for (const event of events) {
    const to = `/events/${event.slug}`;
    const span = spanOf(event);
    const localStart = event.localCelebration?.startsAt ?? event.teaserAt;
    const teaserAt = localStart ? new Date(localStart).getTime() : NaN;

    if (Number.isFinite(teaserAt) && now < teaserAt) {
      items.push({
        id: `${event.slug}:teaser`,
        kind: 'teaser',
        title: event.title,
        target: teaserAt,
        to: '/#ieee-day-teaser',
        event,
      });
    } else if (span && now >= span.start && now <= span.end) {
      items.push({ id: `${event.slug}:live`, kind: 'live', title: event.title, until: span.end, to, event });
    } else if (span && now < span.start && span.start - now <= within) {
      items.push({ id: `${event.slug}:soon`, kind: 'soon', title: event.title, target: span.start, to, event });
    }

    if (event.registrationUrl && event.registrationCloses && span && now < span.start) {
      const closes = new Date(event.registrationCloses).getTime();
      if (Number.isFinite(closes) && now < closes && closes - now <= within) {
        items.push({
          id: `${event.slug}:deadline`,
          kind: 'deadline',
          title: event.title,
          target: closes,
          to,
          href: event.registrationUrl,
          hrefLabel: event.registrationLabel ?? 'Register',
          event,
        });
      }
    }
  }

  const rank = { live: 0, teaser: 1, deadline: 2, soon: 2 };
  return items.sort((a, b) => rank[a.kind] - rank[b.kind] || (a.target ?? a.until) - (b.target ?? b.until));
}

/** The pieces of a countdown: { days, hh, mm, ss }. */
export function countdownParts(target, now = Date.now()) {
  const left = Math.max(0, target - now);
  const pad = (value) => String(value).padStart(2, '0');
  return {
    days: Math.floor(left / DAY),
    hh: pad(Math.floor(left / 3_600_000) % 24),
    mm: pad(Math.floor(left / 60_000) % 60),
    ss: pad(Math.floor(left / 1000) % 60),
  };
}
