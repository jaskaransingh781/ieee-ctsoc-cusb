import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Button, { ExternalLink } from '../components/Button';
import { CountdownInline } from '../components/Countdown';
import { StatusChip, TypeChip } from '../components/EventBits';
import EventVisual from '../components/EventVisual';
import Faq from '../components/Faq';
import Gallery, { Lightbox } from '../components/Gallery';
import Icon from '../components/Icon';
import ReachStrip from '../components/Reach';
import { detailSections, getEvent, getRegistrationState } from '../data/events';
import { getGallery } from '../data/gallery';
import { getSocialLinks } from '../data/site';
import { resolveImage } from '../lib/assets';
import { useCountdown } from '../lib/countdown';
import { formatDate, formatDeadline, formatEventDate, isStillOpen } from '../lib/format';
import { usePageTitle } from '../lib/hooks';

// The page shows only the blocks listed in `detailSections` (events.js).
const show = (id) => detailSections.includes(id);

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

function EventNotFound({ slug }) {
  return (
    <section className="container notfound">
      <p className="notfound__code">404</p>
      <h1 className="h1">Event not found</h1>
      <p className="lead">
        There is no event at <code>/events/{slug}</code>. It may have been renamed or removed.
      </p>
      <div className="notfound__actions">
        <Button to="/events" icon="arrow">
          Return to events
        </Button>
      </div>
    </section>
  );
}

function Section({ id, title, children }) {
  return (
    <section className="esection" id={id} aria-labelledby={`${id}-title`}>
      <h2 className="esection__title" id={`${id}-title`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** "Registration closes in 0d : 19h : 51m", switching to "Closed" at the deadline. */
function ClosingTimer({ target }) {
  const left = useCountdown(target);
  if (!left) return null;
  const deadline = formatDeadline(target);
  return (
    <div className="infocard__timer">
      <p className="infocard__label">{left.done ? 'Registration' : 'Registration closes in'}</p>
      <CountdownInline target={target} doneLabel="Closed" />
      {deadline && !left.done ? (
        <p className="infocard__closes">
          {deadline.day}, {deadline.time}
        </p>
      ) : null}
    </div>
  );
}

function InfoCard({ event }) {
  const past = event.status === 'past';
  const registration = getRegistrationState(event);
  const registerHost = hostOf(event.registrationUrl);
  const siteHost = hostOf(event.websiteUrl);
  // An event with no registration of its own (IEEE Day) points at its
  // official website instead.
  const siteIsMainAction = !past && !event.registrationUrl && Boolean(event.websiteUrl);
  // `info` rows from events.js replace the standard date and venue rows.
  const rows = event.info ?? [
    { label: past ? 'Held' : 'Runs from', value: formatEventDate(event, 'To be announced') },
    { label: past ? 'Venue' : 'Happening at', value: event.venueShort ?? event.venue ?? 'To be announced' },
  ];

  return (
    <div className="infocard">
      <h2 className="infocard__title">{event.title}</h2>

      <dl className="infocard__facts">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="infocard__label">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
        {event.organisedBy ? (
          <div>
            <dt className="infocard__label">Organised by</dt>
            <dd>{event.organisedBy}</dd>
          </div>
        ) : null}
      </dl>

      {!past && event.registrationUrl && event.registrationCloses ? (
        <ClosingTimer target={event.registrationCloses} />
      ) : null}

      <div className="infocard__actions">
        {registration === 'open' ? (
          <>
            <Button href={event.registrationUrl} block icon="out">
              {event.registrationLabel ?? 'Register'}
            </Button>
            {registerHost ? (
              <p className="infocard__hint">Registration is handled on {registerHost}.</p>
            ) : null}
          </>
        ) : null}

        {registration === 'closed' ? (
          <>
            <Button href={event.registrationUrl} variant="secondary" block icon="out">
              View the listing{registerHost ? ` on ${registerHost}` : ''}
            </Button>
            <p className="infocard__hint">Registration for this event has closed.</p>
          </>
        ) : null}

        {siteIsMainAction ? (
          <>
            <Button href={event.websiteUrl} block icon="out">
              {event.websiteLabel ?? 'Official website'}
            </Button>
            {event.registrationNote ? <p className="infocard__hint">{event.registrationNote}</p> : null}
          </>
        ) : null}

        {registration === 'none' && !past && !siteIsMainAction ? (
          <p className="infocard__pending">
            {event.registrationNote ?? 'Registration details will be posted here when they open.'}
          </p>
        ) : null}

        {past && event.websiteUrl ? (
          <Button href={event.websiteUrl} variant="secondary" block icon="out">
            {event.websiteLabel ?? 'Official website'}
          </Button>
        ) : null}
      </div>

      {!past && event.submission?.url ? (
        <div className="infocard__submit">
          <p className="infocard__label">{event.submission.label}</p>
          {isStillOpen(event.submission.deadline) ? (
            <>
              <p className="infocard__deadline">Deadline: {formatDate(event.submission.deadline)}</p>
              <Button href={event.submission.url} variant="secondary" block icon="out">
                Open the submission form
              </Button>
            </>
          ) : (
            <p className="infocard__deadline">Submissions closed on {formatDate(event.submission.deadline)}.</p>
          )}
        </div>
      ) : null}

      {!past && !siteIsMainAction && event.websiteUrl && siteHost ? (
        <p className="infocard__site">
          Official site: <ExternalLink href={event.websiteUrl}>{siteHost}</ExternalLink>
        </p>
      ) : null}
    </div>
  );
}

/** The event poster. Click or press Enter to see it full size. */
function PosterButton({ event, src }) {
  const [open, setOpen] = useState(false);
  const alt = event.detailPosterAlt ?? `${event.title} poster`;
  const items = [{ id: 'poster', url: src, fullUrl: src, alt, caption: `${event.title} poster` }];

  return (
    <>
      <button
        type="button"
        className="edetail__poster edetail__poster--button"
        onClick={() => setOpen(true)}
        aria-label={`Enlarge the ${event.title} poster`}
      >
        <img src={src} alt={alt} decoding="async" />
        <span className="edetail__poster-hint" aria-hidden="true">
          <Icon name="expand" />
          View full poster
        </span>
      </button>
      <AnimatePresence>
        {open ? <Lightbox items={items} index={0} onIndex={() => {}} onClose={() => setOpen(false)} /> : null}
      </AnimatePresence>
    </>
  );
}

/** Quick-fact tiles, a search box and the questions themselves. */
function FaqBlock({ event }) {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const matches = (...parts) => !needle || parts.some((part) => part?.toLowerCase().includes(needle));

  const tiles = (event.quickFacts ?? []).filter((fact) => matches(fact.label, fact.value));
  const questions = (event.faqs ?? []).filter((item) => matches(item.q, item.a));
  const nothing = tiles.length === 0 && questions.length === 0;

  return (
    <>
      <div className="faqsearch">
        <Icon name="search" />
        <label htmlFor="faq-search" className="visually-hidden">
          Search questions
        </label>
        <input
          id="faq-search"
          type="search"
          placeholder="Search questions"
          value={query}
          onChange={(inputEvent) => setQuery(inputEvent.target.value)}
          autoComplete="off"
        />
      </div>

      {tiles.length ? (
        <dl className="qfacts">
          {tiles.map((fact) => (
            <div className="qfacts__item" key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <Faq items={questions} variant="cards" defaultOpen={-1} />

      {nothing ? (
        <p className="faqsearch__empty muted" role="status">
          No questions match “{query.trim()}”. Try a different word.
        </p>
      ) : null}
    </>
  );
}

/** Register bar pinned to the bottom of the screen on phones. */
function MobileRegisterBar({ event }) {
  const visible = getRegistrationState(event) === 'open';

  // Lets the footer make room so the bar never covers its last line.
  useEffect(() => {
    if (!visible) return undefined;
    document.body.classList.add('has-registerbar');
    return () => document.body.classList.remove('has-registerbar');
  }, [visible]);

  if (!visible) return null;

  return createPortal(
    <div className="registerbar">
      <div className="registerbar__text">
        <strong>{event.title}</strong>
        <span>{formatEventDate(event)}</span>
      </div>
      <Button href={event.registrationUrl} size="sm" icon="out">
        Register
      </Button>
    </div>,
    document.body,
  );
}

export default function EventDetail() {
  const { slug } = useParams();
  const event = getEvent(slug);
  usePageTitle(event ? event.title : 'Event not found');

  if (!event) return <EventNotFound slug={slug} />;

  // A portrait poster, when supplied, goes in the sidebar. Otherwise a wide
  // banner runs across the top, and anything else sits in the sidebar.
  const detailPoster = resolveImage(event.detailPoster);
  const wide = !detailPoster && event.posterShape === 'wide';
  const hasDescription = event.description?.length > 0;
  const socials = getSocialLinks();
  const photos = show('gallery') ? getGallery(event.galleryFrom ?? [event.slug]) : [];
  const hasPrizes = Boolean(event.prizes?.pool || event.prizes?.items?.length);
  const hasFaqs = Boolean(event.faqs?.length || event.quickFacts?.length);

  return (
    <>
      <article className="container edetail">
        <nav aria-label="Breadcrumb" className="edetail__crumb">
          <Link to="/events" className="more-link more-link--back">
            <Icon name="back" />
            All events
          </Link>
        </nav>

        <header className="edetail__head">
          <div className="edetail__chips">
            <TypeChip event={event} />
            <StatusChip event={event} />
          </div>
          <h1 className="h1">{event.title}</h1>
        </header>

        {wide ? (
          <div className="edetail__art">
            <EventVisual event={event} variant="hero" eager />
          </div>
        ) : null}

        <div className="edetail__layout">
          <aside className="edetail__aside" aria-label="Event information">
            {detailPoster ? (
              <PosterButton event={event} src={detailPoster} />
            ) : !wide ? (
              <div className="edetail__poster">
                <EventVisual event={event} variant="poster" eager sizes="(max-width: 900px) 100vw, 400px" />
              </div>
            ) : null}
            <InfoCard event={event} />
          </aside>

          <div className="edetail__main">
            {show('about') ? (
              <section className="dcard" aria-labelledby="about-title">
                <h2 className="dcard__title" id="about-title">
                  {event.tagline ?? 'About this event'}
                </h2>
                {hasDescription ? (
                  <div className="prose">
                    {event.description.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <div className="prose">
                    <p>
                      {event.status === 'past'
                        ? 'A write-up of this event has not been added to the archive yet.'
                        : 'The full details for this event have not been published yet. The date, venue and how to take part will appear on this page.'}
                    </p>
                    <p>
                      For news in the meantime,{' '}
                      {socials.length ? (
                        <>
                          follow the chapter on{' '}
                          {socials.map((link, index) => (
                            <span key={link.key}>
                              {index > 0 ? (index === socials.length - 1 ? ' or ' : ', ') : ''}
                              <ExternalLink href={link.url}>{link.label}</ExternalLink>
                            </span>
                          ))}
                          , or{' '}
                        </>
                      ) : null}
                      <Link className="text-link" to="/contact">
                        send us a query
                      </Link>
                      .
                    </p>
                  </div>
                )}
              </section>
            ) : null}

            {show('numbers') && event.status === 'past' && event.facts?.length ? (
              <Section id="numbers" title="In numbers">
                <dl className="figures">
                  {event.facts.map((fact) => (
                    <div key={fact.label} className="figures__item">
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </Section>
            ) : null}

            {show('highlights') && event.highlights?.length ? (
              <Section id="highlights" title="What to expect">
                <ul className="highlights">
                  {event.highlights.map((item) => (
                    <li key={item.title}>
                      <h3 className="h3">{item.title}</h3>
                      <p className="muted">{item.text}</p>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            {show('tracks') && event.tracks?.length ? (
              <Section id="tracks" title={event.tracksTitle ?? 'Focus areas'}>
                {event.tracksIntro ? <p className="muted esection__intro">{event.tracksIntro}</p> : null}
                <ul className="tracks">
                  {event.tracks.map((track) => (
                    <li key={track.title} className={`track track--${track.tone ?? 'blue'}`}>
                      <span className="track__icon">
                        <Icon name={track.icon} />
                      </span>
                      <span className="track__title">{track.title}</span>
                    </li>
                  ))}
                </ul>
                {event.tracksNote ? <p className="small muted esection__note">{event.tracksNote}</p> : null}
              </Section>
            ) : null}

            {show('prizes') && hasPrizes ? (
              <Section id="prizes" title="Prizes">
                <ul className="prizes">
                  {event.prizes.pool ? (
                    <li className="prizes__tile">
                      <span className="prizes__icon">
                        <Icon name="trophy" />
                      </span>
                      <span>
                        <strong>{event.prizes.pool}</strong>
                        <span className="prizes__label">Total prize pool</span>
                      </span>
                    </li>
                  ) : null}
                  {(event.prizes.items ?? []).map((item) => (
                    <li className="prizes__tile" key={item.label}>
                      <span className="prizes__icon">
                        <Icon name="flag" />
                      </span>
                      <span>
                        <strong>{item.value}</strong>
                        <span className="prizes__label">{item.label}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                {event.prizes.note ? <p className="muted esection__note">{event.prizes.note}</p> : null}
              </Section>
            ) : null}

            {show('schedule') && event.timeline?.length ? (
              <Section id="schedule" title="Schedule and deadlines">
                <div className="schedule">
                  {event.timeline.map((group) => (
                    <div className="schedule__group" key={group.group}>
                      <h3 className="schedule__heading">{group.group}</h3>
                      <ol className="schedule__list">
                        {group.items.map((item) => (
                          <li key={`${item.when}-${item.title}`} className="schedule__item">
                            <span className="schedule__when">{item.when}</span>
                            <div>
                              <p className="schedule__title">{item.title}</p>
                              <p className="muted">{item.text}</p>
                              {item.link ? (
                                <p className="schedule__link">
                                  <ExternalLink href={item.link.url}>{item.link.label}</ExternalLink>
                                </p>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}

            {show('judging') && event.judging?.length ? (
              <Section id="judging" title="What the jury looks at">
                <ul className="checks">
                  {event.judging.map((item) => (
                    <li key={item}>
                      <Icon name="check" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            {show('faqs') && hasFaqs ? (
              <Section id="faqs" title="FAQs">
                <FaqBlock event={event} />
              </Section>
            ) : null}

            {show('gallery') ? (
              <Gallery photos={photos} title={event.galleryTitle ?? 'Photographs'} headingLevel={2} />
            ) : null}
          </div>
        </div>
      </article>

      <ReachStrip text={`Updates on ${event.title} and everything else the chapter runs.`} />

      <MobileRegisterBar event={event} />
    </>
  );
}
