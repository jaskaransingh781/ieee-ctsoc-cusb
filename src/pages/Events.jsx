import ReachStrip from '../components/Reach';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../components/Button';
import EventCard from '../components/EventCard';
import FilterBar from '../components/FilterBar';
import {
  eventTypes,
  getPastEvents,
  getUsedStatuses,
  getUsedTypes,
  hasDetails,
  listedEvents as events,
  statusLabels,
} from '../data/events';
import { site } from '../data/site';
import { useLiveEvents, usePageTitle } from '../lib/hooks';

// Current events first (featured, then dated, then undated), then the
// archive: events with a details page lead, the rest follow, each group
// newest first.
function sortForListing(list) {
  const rank = { ongoing: 0, upcoming: 1, past: 2 };
  const archive = getPastEvents().reverse();
  const pastOrder = new Map(
    [...archive.filter(hasDetails), ...archive.filter((event) => !hasDetails(event))].map((event, index) => [
      event.slug,
      index,
    ]),
  );
  return list.slice().sort((a, b) => {
    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
    if (a.status === 'past') return pastOrder.get(a.slug) - pastOrder.get(b.slug);
    if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date || b.date) return a.date ? -1 : 1;
    return 0;
  });
}

export default function Events() {
  usePageTitle('Events');
  const [params, setParams] = useSearchParams();

  const live = useLiveEvents();
  const usedStatuses = useMemo(() => getUsedStatuses(), [live]);
  const usedTypes = useMemo(() => getUsedTypes(), [live]);

  // Filters live in the URL (?status=past&type=workshop) so a filtered view
  // can be linked to and survives the back button.
  const status = usedStatuses.includes(params.get('status')) ? params.get('status') : 'all';
  const type = usedTypes.includes(params.get('type')) ? params.get('type') : 'all';

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const sorted = useMemo(() => sortForListing(events), [live]);
  const byStatus = sorted.filter((event) => status === 'all' || event.status === status);
  const visible = byStatus.filter((event) => type === 'all' || event.type === type);

  const statusOptions = [
    { value: 'all', label: 'All', count: events.length },
    ...usedStatuses.map((value) => ({
      value,
      label: statusLabels[value],
      count: events.filter((event) => event.status === value).length,
    })),
  ];

  // Category counts follow the chosen time filter, so they always match
  // what clicking the chip will show.
  const typeOptions = [
    { value: 'all', label: 'All categories' },
    ...usedTypes.map((value) => ({
      value,
      label: eventTypes[value].plural,
      count: byStatus.filter((event) => event.type === value).length,
    })),
  ];

  return (
    <>
      <header className="container page-head">
        <h1 className="h1">Events</h1>
        <p className="lead">
          Hackathons, workshops and chapter events from {site.name}, upcoming and past.
        </p>
      </header>

      <section className="container events-page" aria-label="Event list">
        <FilterBar
          status={status}
          type={type}
          onStatus={(value) => setFilter('status', value)}
          onType={(value) => setFilter('type', value)}
          statusOptions={statusOptions}
          typeOptions={typeOptions}
        />

        <p className="events-page__count small muted" role="status" aria-live="polite">
          {visible.length === events.length
            ? `${events.length} events`
            : `Showing ${visible.length} of ${events.length} events`}
        </p>

        <motion.div layout className="event-grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((event) => (
              <EventCard key={event.slug} event={event} wide={Boolean(event.featured)} />
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 ? (
          <div className="empty">
            <h2 className="h3">No events match these filters</h2>
            <p className="muted">Try a different category, or clear the filters to see everything.</p>
            <Button variant="secondary" size="sm" onClick={() => setParams({}, { replace: true })}>
              Clear filters
            </Button>
          </div>
        ) : null}
      </section>

      <ReachStrip />
    </>
  );
}
