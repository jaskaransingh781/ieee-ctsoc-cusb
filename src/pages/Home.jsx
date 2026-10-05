import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import EventCalendar from '../components/EventCalendar';
import EventCarousel from '../components/EventCarousel';
import Flagship from '../components/Flagship';
import HeroField from '../components/HeroField';
import Icon from '../components/Icon';
import ImpactCard from '../components/ImpactCard';
import IeeeDayTeaser from '../components/IeeeDayTeaser';
import Newsletter from '../components/Newsletter';
import { ReachButtons } from '../components/Reach';
import Reveal from '../components/Reveal';
import Spotlight from '../components/Spotlight';
import { TeamFeature, TeamMini } from '../components/TeamCard';
import Ticker from '../components/Ticker';
import {
  eventTypes,
  getCurrentEvents,
  getEvent,
  getFeaturedEvent,
  getPastEvents,
  getSpotlightEvents,
  hasDetails,
} from '../data/events';
import { getSocialLinks, site } from '../data/site';
import { getFeaturedTeam, getTeamLeads, hasNamedTeam, team } from '../data/team';
import { formatEventDate } from '../lib/format';
import { useLiveEvents, usePageTitle } from '../lib/hooks';

const ease = [0.22, 1, 0.36, 1];

const line = {
  hidden: { y: '105%' },
  shown: (index) => ({ y: 0, transition: { duration: 0.9, ease, delay: 0.12 + index * 0.09 } }),
};

const fade = {
  hidden: { opacity: 0, y: 12 },
  shown: (delay) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay } }),
};

function Hero() {
  return (
    <section className="hero">
      <HeroField />
      <div className="container hero__inner">
        <motion.p className="hero__badge" variants={fade} custom={0} initial="hidden" animate="shown">
          <span className="hero__badge-dot" aria-hidden="true" />
          {site.branch}
          <span className="hero__badge-state">Active</span>
        </motion.p>

        <h1 className="display hero__title">
          {['Consumer technology,', 'built by students.'].map((text, index) => (
            <span className="hero__line" key={text}>
              <motion.span variants={line} custom={index} initial="hidden" animate="shown">
                {text}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p className="lead hero__lead" variants={fade} custom={0.42} initial="hidden" animate="shown">
          {site.name} is the {site.society} chapter at {site.university}. We put on workshops and events, and
          co-organise Zinnovatio, the university’s national hackathon.
        </motion.p>

        <motion.div className="hero__actions" variants={fade} custom={0.54} initial="hidden" animate="shown">
          <Button to="/events" icon="arrow">
            Browse events
          </Button>
          <Button to="/team" variant="secondary" icon="arrow">
            Meet the team
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Upcoming featured events, with the nearest date receiving emphasis.
 */
function Upcoming() {
  const live = useLiveEvents();
  const current = useMemo(() => getCurrentEvents()
    .filter((event) => event.featured || event.spotlight)
    .map((event) => ({
      ...event,
      homeDate: event.localCelebration?.startsAt
        ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(event.localCelebration.startsAt))
        : formatEventDate(event),
      homeVenue: event.localCelebration?.venue ?? event.venueShort ?? event.venue,
      homeStart: new Date(event.localCelebration?.startsAt ?? event.startsAt ?? `${event.date}T00:00:00+05:30`).getTime(),
    }))
    .sort((a, b) => a.homeStart - b.homeStart), [live]);

  if (!current.length) return null;

  return (
    <section className="section" aria-labelledby="upcoming-title">
      <div className="container">
        <div className="section-head">
          <div className="section-head__text">
            <h2 id="upcoming-title" className="h2">
              Upcoming events
            </h2>
            <p className="muted">What the chapter has on its calendar.</p>
          </div>
          <Link to="/events" className="more-link">
            View all events
            <Icon name="arrow" />
          </Link>
        </div>

        <motion.div layout className="home-upcoming-grid">
          {current.map((event, index) => (
            <Link
              key={event.slug}
              to={`/events/${event.slug}`}
              className={`home-upcoming-card ${index === 0 ? 'home-upcoming-card--next' : ''}`}
            >
              <span className="home-upcoming-card__status">
                {event.localCelebration ? 'Local chapter celebration' : index === 0 ? 'Next up' : 'Upcoming'}
              </span>
              <h3>{event.title.replace('4.O', '4.0')}</h3>
              <p>{event.homeDate}</p>
              <p className="home-upcoming-card__venue">{event.homeVenue}</p>
              <span className="home-upcoming-card__link">Event details <Icon name="arrow" /></span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function PreviousEvents() {
  // Events with a write-up and photographs lead; the rest follow in the
  // order they are listed in events.js.
  const live = useLiveEvents();
  const past = useMemo(() => {
    const list = getPastEvents().slice().reverse();
    return [...list.filter(hasDetails), ...list.filter((event) => !hasDetails(event))];
  }, [live]);
  if (!past.length) return null;

  return (
    <section className="previous" aria-labelledby="previous-title">
      <div className="previous__glow" aria-hidden="true" />
      <div className="container previous__inner">
        <div className="previous__head">
          <div>
            <p className="previous__eyebrow">Our events</p>
            <h2 id="previous-title" className="h2 previous__title">
              Previous events
            </h2>
          </div>
          <div className="previous__side">
            <p className="previous__text">
              Hackathons, workshops and chapter events the team has run and been part of so far.
            </p>
            <Link to="/journey" className="more-link previous__more">
              See the full journey
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
        <EventCarousel events={past} label="Previous events" />
      </div>
    </section>
  );
}

function OurCalendar() {
  return (
    <section className="section section--tight" aria-labelledby="calendar-title">
      <div className="container">
        <div className="section-head">
          <div className="section-head__text">
            <h2 id="calendar-title" className="h2">
              Our calendar
            </h2>
            <p className="muted">Every dated event, by month. It keeps itself up to date.</p>
          </div>
          <Link to="/events" className="more-link">
            View all events
            <Icon name="arrow" />
          </Link>
        </div>
        <Reveal>
          <EventCalendar />
        </Reveal>
      </div>
    </section>
  );
}

function TeamPreview() {
  // The large cards are the people marked `featured` in team.js. If nobody
  // is marked, the first two people listed take that place.
  const marked = getFeaturedTeam();
  const leadership = marked.length ? marked : team.slice(0, 2);
  const others = marked.length ? getTeamLeads() : team.slice(2);
  if (!team.length) return null;

  return (
    <section className="section" aria-labelledby="team-title">
      <div className="container">
        <div className="section-head">
          <div className="section-head__text">
            <h2 id="team-title" className="h2">
              The team
            </h2>
            <p className="muted">
              {hasNamedTeam
                ? 'The students who plan, build and run everything the chapter does.'
                : 'Names and photographs for the current team are being added.'}
            </p>
          </div>
          <Link to="/team" className="more-link">
            Meet the team
            <Icon name="arrow" />
          </Link>
        </div>
        <Reveal className="tfeatures">
          {leadership.map((member) => (
            <TeamFeature key={member.id} member={member} />
          ))}
        </Reveal>

        {others.length ? (
          <Reveal as="ul" className="troster" aria-label="Team leads" delay={0.08}>
            {others.map((member) => (
              <TeamMini key={member.id} member={member} />
            ))}
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

function CallToAction() {
  const hasWhatsapp = getSocialLinks().some((link) => link.key === 'whatsapp');
  return (
    <section className="section" aria-labelledby="cta-title">
      <div className="container">
        <Reveal className="cta">
          <svg className="cta__trace" viewBox="0 0 520 260" aria-hidden="true" focusable="false">
            <path d="M520 60H400l-36 36H250" />
            <path d="M520 130h-70l-30 30h-90" />
            <path d="M520 210H420l-34-34h-60" />
            <circle cx="244" cy="96" r="6" />
            <circle cx="324" cy="160" r="6" />
            <circle className="cta__dot" cx="320" cy="176" r="5" />
          </svg>
          <h2 id="cta-title" className="h2 cta__title">
            Want to take part, speak or collaborate?
          </h2>
          <p className="lead cta__lead">
            Write to us about joining an event, running a session with the chapter or partnering on something new.
            {hasWhatsapp ? ' For announcements as they happen, join the WhatsApp community.' : ''}
          </p>
          <div className="cta__actions">
            <Button to="/signup#contact" icon="arrow">
              Contact the chapter
            </Button>
            <ReachButtons />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  usePageTitle(null);

  // Upcoming events first, then the archive, so the strip always has variety.
  const now = Date.now();
  const campusEvent = getEvent('ieee-day-2026')?.localCelebration;
  const localDayStart = Date.parse(campusEvent?.startsAt ?? '');
  const localDayEnd = localDayStart + 86_399_000;
  const localDayStatus = now < localDayStart ? 'upcoming' : now <= localDayEnd ? 'ongoing' : 'past';
  const tickerItems = [...getCurrentEvents().filter((event) => event.slug !== 'ieee-day-2026'), { slug: 'ieee-day-campus', title: 'IEEE Day 2026', date: null, localCelebration: campusEvent, status: localDayStatus }, ...getPastEvents().slice().reverse()].map((event) => ({
    key: event.slug,
    title: event.title,
    detail:
      event.slug === 'ieee-day-campus'
        ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(event.localCelebration.startsAt))
        : event.date || event.dateLabel
          ? formatEventDate(event)
          : eventTypes[event.type]?.label,
    status: event.status,
  }));

  return (
    <>
      <Hero />
      <Ticker items={tickerItems} label="Events" />
      <ImpactCard />
      {getSpotlightEvents().map((event) => (
        <Spotlight key={event.slug} event={event} />
      ))}
      <IeeeDayTeaser />
      <Flagship event={getFeaturedEvent()} />
      <Upcoming />
      <PreviousEvents />
      <OurCalendar />
      <TeamPreview />
      <Newsletter />
      <CallToAction />
    </>
  );
}
