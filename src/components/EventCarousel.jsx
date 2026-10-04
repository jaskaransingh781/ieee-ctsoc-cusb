import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { eventTypes, hasDetails } from '../data/events';
import { resolveImage } from '../lib/assets';
import { formatEventDate, initials } from '../lib/format';
import Icon from './Icon';
import './EventCarousel.css';

const ROTATE_EVERY = 4200; // milliseconds each card stays in front

const pad = (value) => String(value).padStart(2, '0');

/** Shortest signed distance from `index` to `active` on a ring of `count`. */
function ringOffset(index, active, count) {
  let offset = (index - active) % count;
  if (offset > count / 2) offset -= count;
  if (offset < -count / 2) offset += count;
  return offset;
}

/**
 * The picture that fills a card: the event's photograph when it loads,
 * otherwise a drawn panel built from the event's initials and its category
 * colour. No stock or generated imagery is ever substituted.
 */
function CardArt({ event }) {
  const [failed, setFailed] = useState(false);
  // `posterTall` is an optional 4:5 version made for these upright cards.
  const src = resolveImage(event.posterTall ?? event.poster);
  const tone = event.visualTheme ?? eventTypes[event.type]?.tone ?? 'blue';

  if (src && !failed) {
    return (
      <div className="pcard__art pcard__art--photo">
        <img
          src={src}
          alt={event.posterAlt ?? `${event.title} photograph`}
          loading="lazy"
          decoding="async"
          draggable="false"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`pcard__art pcard__art--drawn pcard__art--${tone}`} aria-hidden="true">
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMaxYMin slice">
        <path d="M400 70H316l-30 30H206" />
        <path d="M400 128h-58l-26 26h-66" />
        <path d="M400 196h-36l-22-22" />
        <circle cx="200" cy="100" r="6" />
        <circle cx="244" cy="154" r="6" />
        <circle className="pcard__spark" cx="338" cy="170" r="4.500" />
      </svg>
      <span className="pcard__initials">{initials(event.title)}</span>
    </div>
  );
}

/**
 * Rotating showcase of previous events. The front card faces forward and
 * its neighbours turn away on either side. It advances on its own and the
 * bar under the cards shows how long the front card has left. Rotation
 * pauses while hovered or focused, off-screen, in a background tab, with
 * the pause button, or when the visitor prefers reduced motion.
 */
export default function EventCarousel({ events = [], label = 'Previous events' }) {
  const count = events.length;
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const rootRef = useRef(null);
  const dragStart = useRef(null);
  const inView = useInView(rootRef, { margin: '-10% 0px -10% 0px' });
  const reduce = useReducedMotion();

  const go = useCallback((step) => setActive((current) => (current + step + count) % count), [count]);

  if (!count) return null;

  const autoplay = count > 1 && !reduce;
  const running = autoplay && !userPaused && !engaged && inView;
  const reach = count >= 5 ? 2 : 1; // neighbours visible on each side
  const current = events[active];

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    }
  };

  const onPointerUp = (event) => {
    if (dragStart.current === null) return;
    const moved = event.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(moved) > 48) go(moved < 0 ? 1 : -1);
  };

  return (
    <div
      ref={rootRef}
      className="carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      style={{ '--rotate-every': `${ROTATE_EVERY}ms` }}
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false);
      }}
      onKeyDown={onKeyDown}
    >
      <ul
        className="carousel__stage"
        onPointerDown={(event) => {
          dragStart.current = event.clientX;
        }}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          dragStart.current = null;
        }}
      >
        {events.map((event, index) => {
          const offset = ringOffset(index, active, count);
          const distance = Math.abs(offset);
          const visible = distance <= reach;
          const isActive = offset === 0;
          const linked = hasDetails(event);
          const meta = formatEventDate(event, event.shortDescription ?? '');

          return (
            <motion.li
              key={event.slug}
              className={`carousel__slide ${isActive ? 'is-active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}: ${event.title}`}
              aria-hidden={!isActive}
              initial={false}
              animate={{
                x: `${offset * 68}%`,
                scale: 1 - distance * 0.12,
                rotateY: offset * -28,
                opacity: visible ? 1 : 0,
              }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 190, damping: 30, mass: 0.9 }}
              style={{
                zIndex: 20 - distance,
                pointerEvents: visible ? 'auto' : 'none',
                // Cards further from the front are darkened so they recede
                // without becoming see-through.
                '--veil': Math.min(distance * 0.46, 0.86),
              }}
              onClick={isActive ? undefined : () => setActive(index)}
            >
              <article className="pcard">
                <CardArt event={event} />
                <div className="pcard__shade" />
                <span className="pcard__number" aria-hidden="true">
                  {pad(index + 1)}
                </span>
                <div className="pcard__body">
                  <span className="pcard__chip">{eventTypes[event.type]?.label ?? 'Event'}</span>
                  <h3 className="pcard__title">{event.title}</h3>
                  {meta ? <p className="pcard__meta">{meta}</p> : null}
                  {linked ? (
                    <Link
                      to={`/events/${event.slug}`}
                      className="pcard__link"
                      tabIndex={isActive ? 0 : -1}
                      aria-label={`View details: ${event.title}`}
                    >
                      View details
                      <Icon name="arrow" />
                    </Link>
                  ) : null}
                </div>
              </article>
            </motion.li>
          );
        })}
      </ul>

      <div className="carousel__controls">
        <p className="carousel__counter" aria-hidden="true">
          <strong>{pad(active + 1)}</strong>
          <span>/ {pad(count)}</span>
        </p>

        <div className="carousel__bars">
          {events.map((event, index) => (
            <button
              key={event.slug}
              type="button"
              className={`carousel__bar ${index === active ? 'is-active' : ''} ${index < active ? 'is-done' : ''}`}
              aria-label={`Show ${event.title}`}
              aria-current={index === active ? 'true' : undefined}
              onClick={() => setActive(index)}
            >
              <span className="carousel__bar-track">
                {index === active && autoplay ? (
                  // The fill's animation is the timer: when it finishes, the
                  // carousel turns. Pausing the animation pauses the timer.
                  <span
                    key={active}
                    className="carousel__bar-fill"
                    style={{ animationPlayState: running ? 'running' : 'paused' }}
                    onAnimationEnd={() => go(1)}
                  />
                ) : null}
              </span>
            </button>
          ))}
        </div>

        <div className="carousel__buttons">
          <button type="button" className="carousel__btn" onClick={() => go(-1)} aria-label="Previous event">
            <Icon name="chevronLeft" />
          </button>
          <button type="button" className="carousel__btn" onClick={() => go(1)} aria-label="Next event">
            <Icon name="chevronRight" />
          </button>
          {autoplay ? (
            <button
              type="button"
              className="carousel__btn carousel__btn--quiet"
              onClick={() => setUserPaused((value) => !value)}
              aria-label={userPaused ? 'Start rotating' : 'Pause rotating'}
              aria-pressed={userPaused}
            >
              <Icon name={userPaused ? 'play' : 'pause'} />
            </button>
          ) : null}
        </div>
      </div>

      <p className="visually-hidden" aria-live="polite">
        {engaged || userPaused ? `Showing ${current.title}, ${active + 1} of ${count}` : ''}
      </p>
    </div>
  );
}
