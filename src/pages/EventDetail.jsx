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

function ZinnovatioPrizeCard({ pool }) {
  return (
    <div className="zinn-prize-card-wrap">
      <div className="zinn-prize-card__fireworks" aria-hidden="true">
        <span className="zinn-prize-card__burst zinn-prize-card__burst--one" />
        <span className="zinn-prize-card__burst zinn-prize-card__burst--two" />
        <span className="zinn-prize-card__burst zinn-prize-card__burst--three" />
        <span className="zinn-prize-card__spark zinn-prize-card__spark--one" />
        <span className="zinn-prize-card__spark zinn-prize-card__spark--two" />
        <span className="zinn-prize-card__spark zinn-prize-card__spark--three" />
        <span className="zinn-prize-card__spark zinn-prize-card__spark--four" />
      </div>
      <section className="zinn-prize-card" aria-labelledby="zinn-prize-title">
        <span className="zinn-prize-card__corner zinn-prize-card__corner--top" aria-hidden="true" />
        <span className="zinn-prize-card__corner zinn-prize-card__corner--bottom" aria-hidden="true" />
        <span className="zinn-prize-card__trophy" aria-hidden="true"><Icon name="trophy" /></span>
        <p className="zinn-prize-card__label">TOTAL PRIZE POOL</p>
        <h2 id="zinn-prize-title">{pool}</h2>
        <p className="zinn-prize-card__copy">Exciting prizes and recognition for innovative solutions.</p>
      </section>
    </div>
  );
}

function ZinnovatioHospitality({ event }) {
  const hospitality = event.hospitality;

  return (
    <section className="zinn-hospitality" aria-labelledby="zinn-hospitality-title">
      <div className="zinn-hospitality__heading">
        <p className="zinn-hospitality__eyebrow">A WELCOME FOR VISITING TEAMS</p>
        <h2 id="zinn-hospitality-title">HOSPITALITY &amp; ACCOMMODATION</h2>
        <p className="zinn-hospitality__lead">Travelling from another university? Everything you need for a smooth arrival and stay.</p>
      </div>

      <div className="zinn-hospitality__grid">
        <article className="zinn-hospitality__card zinn-hospitality__card--stay">
          <div className="zinn-hospitality__card-top">
            <span className="zinn-hospitality__icon"><Icon name="bed" /></span>
            <span className="zinn-hospitality__stay-badge">29 OCTOBER ONLY</span>
          </div>
          <p className="zinn-hospitality__label">HOSPITALITY &amp; ACCOMMODATION</p>
          <h3 className="zinn-hospitality__price">₹500 <span>PER PERSON</span></h3>
          
          <p className="zinn-hospitality__copy">
            Accommodation is available exclusively to participants arriving on <strong>29 October 2026</strong>. The package covers one night only.
          </p>

          <div className="zinn-hospitality__inclusions">
            <p className="zinn-hospitality__inclusions-title">PACKAGE INCLUDES</p>
            <ul>
              <li><Icon name="check" size={15} /> <span>Accommodation for the night of 29 October 2026.</span></li>
              <li><Icon name="check" size={15} /> <span>Three meal servings.</span></li>
              <li><Icon name="check" size={15} /> <span>Two tea servings.</span></li>
            </ul>
          </div>

          <div className="zinn-hospitality__restriction">
            <div className="zinn-hospitality__restriction-tag">
              <Icon name="alert" size={15} />
              <strong>IMPORTANT ARRIVAL RESTRICTION</strong>
            </div>
            <p>No accommodation is available before 29 October 2026. The ₹500 package covers the night of 29 October only. Additional nights are not included.</p>
          </div>
        </article>

        <article className="zinn-hospitality__card zinn-hospitality__card--food">
          <span className="zinn-hospitality__icon"><Icon name="spark" /></span>
          <p className="zinn-hospitality__label">FOOD DURING THE HACKATHON</p>
          <p className="zinn-hospitality__copy">
            Food stalls will be available at the venue on <strong>30–31 October 2026</strong>. Participants can purchase food directly from the vendors.
          </p>
          <div className="zinn-hospitality__food-alert">
            <Icon name="info" size={15} />
            <span>Food purchases must be paid directly to the respective vendors and are not included in the ₹500 accommodation package.</span>
          </div>
        </article>

        <article className="zinn-hospitality__card zinn-hospitality__card--payment" id="zinnovatio-payment">
          <div className="zinn-hospitality__confirmation-badge">
            <Icon name="check" size={14} />
            <span>PARTICIPATION CONFIRMED</span>
          </div>
          <h3 className="zinn-hospitality__confirmed-heading">YOU&apos;RE IN.</h3>
          <p className="zinn-hospitality__copy">
            Your selection is confirmed and payment has been received. Welcome to Zinnovatio 4.0. Get ready to collaborate, build, and turn your ideas into working solutions.
          </p>
          <dl className="zinn-hospitality__confirmed-meta">
            <div>
              <dt>Selection</dt>
              <dd><Icon name="check" size={13} /> Completed.</dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd><Icon name="check" size={13} /> Completed.</dd>
            </div>
            <div>
              <dt>Event</dt>
              <dd>30–31 October 2026</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}

const roadmapStops = [
  { id: '01', label: '01 — Railway Station, Chandigarh', shortName: 'Railway Station, Chandigarh' },
  { id: '02', label: '02 — SAS Nagar', shortName: 'SAS Nagar' },
  { id: '03', label: '03 — Balongi', shortName: 'Balongi' },
  { id: '04', label: '04 — Kharar Bus Stand', shortName: 'Kharar Bus Stand' },
  { id: '05', label: '05 — Ludhiana–Chandigarh National Highway', shortName: 'Ludhiana–Chandigarh National Highway' },
  { id: 'DEST', label: 'DESTINATION — Chandigarh University', shortName: 'Chandigarh University', isDestination: true },
];

function ZinnovatioRoadmap() {
  return (
    <Section id="getting-here" title="HOW TO REACH CHANDIGARH UNIVERSITY">
      <p className="zinn-roadmap__subtitle">Your route to Zinnovatio 4.O starts here.</p>
      <figure className="zinn-roadmap">
        <svg className="zinn-roadmap__route" viewBox="0 0 1000 250" role="img" aria-labelledby="zinn-route-title zinn-route-desc">
          <title id="zinn-route-title">Schematic route to Chandigarh University</title>
          <desc id="zinn-route-desc">A winding route with six stops, from Railway Station, Chandigarh to Chandigarh University, via SAS Nagar, Balongi, Kharar Bus Stand, and Ludhiana–Chandigarh National Highway.</desc>
          <path id="zinn-route-path" className="zinn-roadmap__road-edge" d="M82 154 C155 154 156 80 250 80 S345 154 418 154 S511 80 584 80 S678 154 750 154 S843 80 918 80" />
          <path className="zinn-roadmap__road" d="M82 154 C155 154 156 80 250 80 S345 154 418 154 S511 80 584 80 S678 154 750 154 S843 80 918 80" />
          <path className="zinn-roadmap__road-centre" d="M82 154 C155 154 156 80 250 80 S345 154 418 154 S511 80 584 80 S678 154 750 154 S843 80 918 80" />
          <g className="zinn-roadmap__vehicle" aria-hidden="true">
            <circle r="12" />
            <path d="M-6 2v-5l3-4h6l3 4v5h-12Zm2-5h8M-3 5h1m5 0h1" />
            <animateMotion dur="18s" repeatCount="indefinite" rotate="auto">
              <mpath href="#zinn-route-path" />
            </animateMotion>
          </g>
          {[
            [82, 154], [250, 80], [418, 154], [584, 80], [750, 154], [918, 80],
          ].map(([cx, cy], index) => {
            const stop = roadmapStops[index];
            return (
              <g className={`zinn-roadmap__marker${stop.isDestination ? ' zinn-roadmap__marker--destination' : ''}`} key={stop.id} transform={`translate(${cx} ${cy})`}>
                <circle className="zinn-roadmap__marker-ring" r={stop.isDestination ? 27 : 22} />
                <circle className="zinn-roadmap__marker-core" r={stop.isDestination ? 20 : 16} />
                {stop.isDestination ? (
                  <path className="zinn-roadmap__building" d="M-11 9V-2L0-10 11-2V9H4V2H-4V9h-7Zm-3 3h28" />
                ) : (
                  <text className="zinn-roadmap__number" textAnchor="middle" dominantBaseline="central" y="1">{index + 1}</text>
                )}
              </g>
            );
          })}
        </svg>

        <ol className="zinn-roadmap__stops">
          {roadmapStops.map((stop, index) => (
            <li className={stop.isDestination ? 'zinn-roadmap__stop zinn-roadmap__stop--destination' : 'zinn-roadmap__stop'} key={stop.id}>
              <span className="zinn-roadmap__stop-number">{stop.isDestination ? <Icon name="pin" /> : stop.id}</span>
              <div className="zinn-roadmap__stop-content">
                <span className="zinn-roadmap__stop-name">{stop.shortName}</span>
                {stop.isDestination ? <span className="zinn-roadmap__destination-tag">DESTINATION</span> : null}
              </div>
            </li>
          ))}
        </ol>

        <ol className="zinn-roadmap__mobile-stops">
          {roadmapStops.map((stop, index) => (
            <li className={stop.isDestination ? 'zinn-roadmap__mobile-stop zinn-roadmap__mobile-stop--destination' : 'zinn-roadmap__mobile-stop'} key={stop.id}>
              <span aria-hidden="true">{stop.isDestination ? <Icon name="pin" /> : stop.id}</span>
              <div className="zinn-roadmap__mobile-stop-info">
                <strong>{stop.label}</strong>
                {stop.isDestination ? <small>OFFICIAL VENUE</small> : null}
              </div>
            </li>
          ))}
        </ol>

        <figcaption className="zinn-roadmap__caption">
          MODE OF TRANSPORT: LOCAL BUSES / TAXIS / BIKES / AUTO
        </figcaption>
      </figure>
    </Section>
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
        {event.localCelebration ? (
          <div>
            <dt className="infocard__label">Local chapter celebration</dt>
            <dd>
              {new Intl.DateTimeFormat('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
              }).format(new Date(event.localCelebration.startsAt))} at {event.localCelebration.venue}
            </dd>
          </div>
        ) : null}
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
      <article className={`container edetail${event.slug === 'zinnovatio-4o' ? ' edetail--zinnovatio' : ''}`}>
        <nav aria-label="Breadcrumb" className="edetail__crumb">
          <Link to="/events" className="more-link more-link--back">
            <Icon name="back" />
            All events
          </Link>
        </nav>

        <div className={`edetail__masthead${event.slug === 'zinnovatio-4o' ? ' edetail__masthead--zinnovatio' : ''}`}>
          <header className="edetail__head">
            <div className="edetail__chips">
              <TypeChip event={event} />
              <StatusChip event={event} />
            </div>
            <h1 className="h1">{event.title}</h1>
            {event.slug === 'zinnovatio-4o' ? (
              <>
                <p className="zinn-masthead__summary">A 36-hour national-level hackathon for teams building working prototypes.</p>
                <p className="zinn-masthead__facts">
                  <span>{formatEventDate(event)}</span>
                  <span>{event.facts?.find((fact) => /team size/i.test(fact.label))?.value ?? '3 to 5 members'} per team</span>
                </p>
              </>
            ) : null}
          </header>
          {event.slug === 'zinnovatio-4o' && event.prizes?.pool ? (
            <ZinnovatioPrizeCard pool={event.prizes.pool} />
          ) : null}
        </div>

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
                  {event.slug === 'zinnovatio-4o'
                    ? 'IDEAS ARE JUST THE BEGINNING.'
                    : event.tagline ?? 'About this event'}
                </h2>
                {event.slug === 'zinnovatio-4o' ? (
                  <p className="dcard__lead">
                    Choose a problem space. Build a working solution. Collaborate through challenges and turn your team&apos;s ideas into something tangible.
                  </p>
                ) : null}
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
                      <Link className="text-link" to="/signup#contact">
                        send us a query
                      </Link>
                      .
                    </p>
                  </div>
                )}
              </section>
            ) : null}

            {event.slug === 'zinnovatio-4o' ? <ZinnovatioHospitality event={event} /> : null}
            {event.slug === 'zinnovatio-4o' ? <ZinnovatioRoadmap /> : null}

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

            {show('prizes') && hasPrizes && event.slug !== 'zinnovatio-4o' ? (
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
                {event.slug === 'zinnovatio-4o' ? (
                  <p className="zinn-prize__support">
                    Bring your team&apos;s ideas to the build floor and compete to turn them into practical solutions.
                  </p>
                ) : null}
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
