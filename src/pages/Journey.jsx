import ReachStrip from '../components/Reach';
import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import Button from '../components/Button';
import { TypeChip } from '../components/EventBits';
import EventVisual from '../components/EventVisual';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import { getFeaturedEvent, getPastEvents, getRegistrationState, hasDetails } from '../data/events';
import { site } from '../data/site';
import { formatEventDate } from '../lib/format';
import { usePageTitle } from '../lib/hooks';
import { GalleryArchive } from './Gallery';

export default function Journey() {
  usePageTitle('Journey');
  const location = useLocation();
  const past = getPastEvents();
  const next = getFeaturedEvent();
  const lineRef = useRef(null);

  // The blue line fills as the timeline is scrolled through.
  const { scrollYProgress } = useScroll({ target: lineRef, offset: ['start 65%', 'end 65%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  useEffect(() => {
    if (location.hash !== '#gallery') return;
    window.requestAnimationFrame(() => document.getElementById('gallery')?.scrollIntoView());
  }, [location.hash]);

  return (
    <>
      <header className="container page-head">
        <h1 className="h1">Our journey</h1>
        <p className="lead">
          The events behind {site.name} so far{next ? ', and the one we are building towards now' : ''}.
        </p>
      </header>

      <section className="container journey" aria-label="Timeline of past events">
        <div className="jline-wrap" ref={lineRef}>
          <span className="jline__track" aria-hidden="true">
            <motion.span className="jline__fill" style={{ scaleY: progress }} />
          </span>
          <ol className="jline">

          {past.map((event) => (
            <li className="jline__item" key={event.slug}>
              <span className="jline__node" aria-hidden="true" />
              <p className="jline__when">{event.dateLabel ?? (event.date ? formatEventDate(event) : '')}</p>
              <Reveal className="jline__card">
                {hasDetails(event) ? (
                  <Link to={`/events/${event.slug}`} className="jline__art" tabIndex={-1} aria-hidden="true">
                    <EventVisual event={event} variant="journey" sizes="(max-width: 760px) 100vw, 360px" />
                  </Link>
                ) : (
                  <div className="jline__art">
                    <EventVisual event={event} variant="journey" sizes="(max-width: 760px) 100vw, 360px" />
                  </div>
                )}
                <div className="jline__body">
                  <TypeChip event={event} />
                  <h2 className="jline__title">{event.title}</h2>
                  <p className="muted">{event.shortDescription}</p>
                  {event.facts?.length ? (
                    <dl className="jline__facts">
                      {event.facts.map((fact) => (
                        <div key={fact.label}>
                          <dt>{fact.label}</dt>
                          <dd>{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {hasDetails(event) ? (
                    <Link
                      to={`/events/${event.slug}`}
                      className="more-link"
                      aria-label={`View details: ${event.title}`}
                    >
                      View details
                      <Icon name="arrow" />
                    </Link>
                  ) : null}
                </div>
              </Reveal>
            </li>
          ))}

          {next ? (
            <li className="jline__item jline__item--next">
              <span className="jline__node jline__node--next" aria-hidden="true" />
              <p className="jline__when">Next, {formatEventDate(next)}</p>
              <Reveal className="jline__next">
                <Link to={`/events/${next.slug}`} className="jline__next-art" aria-label={`${next.title}: view details`}>
                  <EventVisual event={next} variant="hero" />
                </Link>
                <div className="jline__next-body">
                  <div>
                    <h2 className="jline__title">{next.title}</h2>
                    <p className="muted">{next.shortDescription}</p>
                  </div>
                  <div className="jline__next-actions">
                    {getRegistrationState(next) === 'open' ? (
                      <Button href={next.registrationUrl} icon="out">
                        {next.registrationLabel ?? 'Register'}
                      </Button>
                    ) : null}
                    <Button to={`/events/${next.slug}`} variant="secondary">
                      View details
                    </Button>
                  </div>
                </div>
              </Reveal>
            </li>
          ) : null}
          </ol>
        </div>
      </section>

      <section id="gallery" className="journey-gallery" aria-label="Photo archive">
        <GalleryArchive />
      </section>

      <section className="container journey-note">
        <p className="muted">
          Zinnovatio is hosted by {site.university} and organised by the Department of CSE, Nalanda. IEEE CTSoc is a
          co-organiser of the fourth edition. Edition figures and photographs come from zinnovatio.in.
        </p>
      </section>

      <ReachStrip />
    </>
  );
}
