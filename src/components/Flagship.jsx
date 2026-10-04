import { useRef } from 'react';
import { getRegistrationState } from '../data/events';
import { useCountdown } from '../lib/countdown';
import { formatDate, formatDay, formatDeadline, formatEventDate, isStillOpen } from '../lib/format';
import Button, { ExternalLink } from './Button';
import { CountdownTiles } from './Countdown';
import Icon from './Icon';
import Reveal from './Reveal';
import './Flagship.css';

/**
 * The light on each pane of glass follows the pointer. Positions are written
 * straight to CSS variables, so moving the mouse never re-renders React.
 */
function useGlassLight() {
  const frame = useRef(0);
  return (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const stage = event.currentTarget;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      stage.querySelectorAll('.glass').forEach((pane) => {
        const box = pane.getBoundingClientRect();
        pane.style.setProperty('--mx', `${clientX - box.left}px`);
        pane.style.setProperty('--my', `${clientY - box.top}px`);
      });
    });
  };
}

function FlagshipStage({ event }) {
  const onPointerMove = useGlassLight();
  // Ticks once a second, so the cards switch to "closed" at the deadline
  // without a page reload.
  const untilClose = useCountdown(event.registrationCloses);

  const now = Date.now();
  const registration = getRegistrationState(event, now);
  const ended = event.endsAt ? new Date(event.endsAt).getTime() < now : event.status === 'past';
  const type = event.type === 'hackathon' ? 'Hackathon' : 'Event';
  const submissionOpen = Boolean(event.submission?.url) && isStillOpen(event.submission.deadline, now);
  const deadline = event.registrationCloses ? formatDeadline(event.registrationCloses, now) : null;
  const hasDeadline = Boolean(event.registrationUrl && untilClose && deadline);

  const facts = [
    { icon: 'calendar', text: formatEventDate(event) },
    { icon: 'pin', text: event.venueShort ?? event.venue },
    event.prizes?.pool && { icon: 'trophy', text: `${event.prizes.pool} prize pool` },
    event.duration && { icon: 'clock', text: event.duration },
  ].filter((fact) => fact && fact.text);

  return (
    <Reveal className="fstage" onPointerMove={onPointerMove}>
      <span className="fstage__orb fstage__orb--coral" aria-hidden="true" />
      <span className="fstage__orb fstage__orb--blue" aria-hidden="true" />
      <span className="fstage__orb fstage__orb--cyan" aria-hidden="true" />
      <span className="fstage__grid" aria-hidden="true" />

      <article className="glass flagship__card flagship__card--main">
        <p className="flagship__chip">
          <span className="flagship__chip-dot" />
          Flagship {type}
        </p>
        <h3 className="flagship__title">{event.title}</h3>
        <p className="flagship__tagline">{event.tagline ?? event.shortDescription}</p>

        <ul className="flagship__facts">
          {facts.map((fact) => (
            <li key={fact.icon}>
              <span className="flagship__fact-icon">
                <Icon name={fact.icon} />
              </span>
              {fact.text}
            </li>
          ))}
        </ul>

        {event.organisedBy ? (
          <p className="flagship__organiser">
            <span>Organised by</span> {event.organisedBy}
          </p>
        ) : null}

        <div className="flagship__actions">
          {registration === 'open' ? (
            <Button href={event.registrationUrl} icon="out" className="btn--accent">
              {event.registrationLabel ?? 'Register now'}
            </Button>
          ) : null}
          <Button to={`/events/${event.slug}`} className="btn--glass">
            View details
          </Button>
        </div>

        {submissionOpen ? (
          <p className="flagship__submit">
            <ExternalLink href={event.submission.url} className="flagship__submit-link">
              {event.submission.label}
              <Icon name="out" />
            </ExternalLink>
            <span>Deadline: {formatDate(event.submission.deadline)}</span>
          </p>
        ) : null}
      </article>

      <div className="flagship__side">
        {hasDeadline ? (
          <aside
            className={`glass flagship__card flagship__card--reg ${untilClose.done ? 'is-closed' : ''}`}
            aria-label={`Registration deadline for ${event.title}`}
          >
            {untilClose.done ? (
              <>
                <p className="flagship__chip flagship__chip--plain">Registration</p>
                <p className="flagship__closed-title">Closed</p>
                <p className="flagship__when">
                  Registration closed on {formatDay(event.registrationCloses)}, {deadline.time}.
                </p>
              </>
            ) : (
              <>
                <p className="flagship__chip flagship__chip--live">
                  <span className="flagship__chip-dot flagship__chip-dot--pulse" />
                  Registration closes in
                </p>
                <div className="flagship__timer">
                  <CountdownTiles target={event.registrationCloses} size="lg" hideZeroDays />
                </div>
                <p className="flagship__when">
                  <Icon name="clock" />
                  <span>
                    <strong>{deadline.day}</strong>, {deadline.time}
                  </span>
                </p>
              </>
            )}
          </aside>
        ) : null}

        <aside className="glass flagship__card flagship__card--timer" aria-label={`Countdown to ${event.title}`}>
          <div className="flagship__row">
            <p className="flagship__chip flagship__chip--plain">{ended ? 'This edition' : 'Event starts in'}</p>
            {event.prizes?.pool ? (
              <p className="flagship__prize">
                <span>Prize pool</span>
                {event.prizes.pool}
              </p>
            ) : null}
          </div>
          <div className="flagship__timer">
            {ended ? (
              <p className="ctiles__done">Has finished</p>
            ) : (
              <CountdownTiles target={event.startsAt} doneLabel="Under way now" />
            )}
          </div>

          {event.summaryLine ? <p className="flagship__note">{event.summaryLine}</p> : null}
        </aside>
      </div>
    </Reveal>
  );
}

/**
 * The flagship event on the home page, as panes of glass over a lit
 * backdrop: details and actions on the left; on the right, a live countdown
 * to the registration deadline and another to the event itself.
 * Everything shown comes from the featured event in src/data/events.js.
 */
export default function Flagship({ event }) {
  if (!event) return null;

  return (
    <section className="section" aria-labelledby="flagship-title">
      <div className="container">
        <p className="flagship__eyebrow">Flagship event</p>
        <h2 id="flagship-title" className="h2 flagship__heading">
          {event.headline ?? event.title}
        </h2>
        <FlagshipStage event={event} />
      </div>
    </section>
  );
}
