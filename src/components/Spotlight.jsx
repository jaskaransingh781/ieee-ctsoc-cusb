import { resolveImage } from '../lib/assets';
import { daysUntil } from '../lib/format';
import Button from './Button';
import Icon from './Icon';
import Reveal from './Reveal';
import './Spotlight.css';

/** "3 days to go", then "Today", then how long the celebrations have left. */
function timing(event) {
  const days = daysUntil(event.date);
  if (days === null) return null;
  if (days > 1) return { value: String(days), label: 'days to go' };
  if (days === 1) return { value: '1', label: 'day to go' };
  if (days === 0) return { value: 'Today', label: `is ${event.title.replace(/\s*\d{4}$/, '')}` };

  const left = daysUntil(event.endDate ?? event.date);
  if (left === null || left < 0) return null;
  return {
    value: 'Now',
    label: left > 0 ? `Celebrations on for ${left} more ${left === 1 ? 'day' : 'days'}` : 'Final day of celebrations',
  };
}

/**
 * A blue band for an occasion the chapter wants to point at (IEEE Day).
 * Shown for any upcoming or ongoing event marked `spotlight: true` in
 * src/data/events.js, and removed by itself once the event is over.
 */
export default function Spotlight({ event }) {
  if (!event) return null;

  const emblem = resolveImage(event.emblem);
  const when = timing(event);
  const titleId = `spotlight-${event.slug}`;

  return (
    <section className="section section--tight" aria-labelledby={titleId}>
      <div className="container">
        <Reveal className="spot">
          <span className="spot__rings" aria-hidden="true" />

          <div className="spot__main">
            <div className="spot__brand">
              {emblem ? (
                <img className="spot__emblem" src={emblem} alt="" width="236" height="236" loading="lazy" />
              ) : null}
              <div>
                <h2 className="spot__name" id={titleId}>
                  {event.title}
                </h2>
                <p className="spot__date">
                  <Icon name="calendar" />
                  {event.dateLabel}
                </p>
              </div>
            </div>

            {event.theme ? (
              <p className="spot__theme">
                <span className="spot__label">This year’s theme</span>
                {event.theme}
              </p>
            ) : null}

            <p className="spot__text">{event.bandText ?? event.shortDescription}</p>

            <div className="spot__actions">
              <Button to={`/events/${event.slug}`} icon="arrow" className="btn--light">
                About {event.title}
              </Button>
              {event.websiteUrl ? (
                <Button href={event.websiteUrl} icon="out" className="btn--on-dark">
                  {event.websiteLabel ?? 'Official website'}
                </Button>
              ) : null}
            </div>
          </div>

          <aside className="spot__side" aria-label={`${event.title} dates`}>
            {when ? (
              <p className="spot__count">
                <strong>{when.value}</strong> <span>{when.label}</span>
              </p>
            ) : null}
            {event.celebrationsLabel ? (
              <dl className="spot__facts">
                <div>
                  <dt>Celebrations run</dt>
                  <dd>{event.celebrationsLabel}</dd>
                </div>
                <div>
                  <dt>Celebrated by</dt>
                  <dd>{event.venue}</dd>
                </div>
              </dl>
            ) : null}
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
