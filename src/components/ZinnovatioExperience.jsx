import { useReducedMotion } from 'framer-motion';
import { getRegistrationState } from '../data/events';
import { resolveImage } from '../lib/assets';
import { useNow } from '../lib/countdown';
import Button from './Button';
import Icon from './Icon';
import Rangoli from './Rangoli';
import Reveal from './Reveal';
import './ZinnovatioExperience.css';

const IST = 'Asia/Kolkata';
const clockUnits = [
  ['days', 'DAYS'],
  ['hours', 'HOURS'],
  ['minutes', 'MINUTES'],
  ['seconds', 'SECONDS'],
];
const stages = [
  ['01', 'THE IDEA', 'Explore the problem and shape a solution.'],
  ['02', 'THE CODE SPRINT', 'Turn ideas into functioning code.'],
  ['03', 'BUILD & PROTOTYPE', 'Develop, test and improve the working solution.'],
  ['04', 'DEBUG & ITERATE', 'Resolve issues and refine the implementation.'],
  ['05', 'OVERNIGHT BUILD', 'Collaborate, experiment and keep building through the night.'],
  ['06', 'DEMO & PRESENT', 'Prepare the solution for evaluation and showcase.'],
  ['07', 'FINAL EVALUATION', 'Present the work for judging and recognition.'],
];
const stageThemes = ['idea', 'code', 'build', 'debug', 'overnight', 'demo', 'evaluation'];
const experienceHighlights = [
  ['cpu', 'CODING SPRINTS'],
  ['nodes', 'TEAM CHALLENGES'],
  ['layers', 'BUILD & PROTOTYPE'],
  ['clock', 'OVERNIGHT EXPERIENCE'],
  ['spark', 'MUSIC & CELEBRATION'],
];

const registrationDate = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: IST,
});

function remainingTime(milliseconds) {
  const left = Math.max(0, milliseconds);
  return {
    days: Math.floor(left / 86_400_000),
    hours: Math.floor(left / 3_600_000) % 24,
    minutes: Math.floor(left / 60_000) % 60,
    seconds: Math.floor(left / 1000) % 60,
  };
}

function getBuildStart(event, configuredStart) {
  const item = event.timeline
    ?.flatMap((group) => group.items ?? [])
    .find((entry) => /hacking begins/i.test(entry.title));
  if (!item || !/^\d{2}:\d{2}$/.test(item.when)) return configuredStart;
  return new Date(`${event.date}T${item.when}:00+05:30`).getTime();
}

function Countdown({ event, now }) {
  const dateStart = new Date(`${event.date}T00:00:00+05:30`).getTime();
  const configuredStart = event.startsAt ? new Date(event.startsAt).getTime() : dateStart;
  const end = event.endsAt ? new Date(event.endsAt).getTime() : null;
  const buildStart = getBuildStart(event, configuredStart);
  const beforeStart = now < configuredStart;
  const checkInOpen = Boolean(end && now >= configuredStart && now < buildStart);
  const eventLive = Boolean(end && now >= buildStart && now < end);
  const completed = Boolean(end && now >= end);
  const values = remainingTime(configuredStart - now);
  const phase = completed
    ? 'ARCHIVE'
    : eventLive
      ? 'HACKATHON LIVE'
      : checkInOpen
        ? 'CHECK-IN OPEN'
      : beforeStart
        ? 'THE CLOCK IS TICKING'
      : 'EVENT DAY';
  const startTimeLabel = event.startsAt
    ? new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: IST,
    }).format(new Date(configuredStart))
    : null;

  return (
    <div className="zexp__countdown-wrap">
      <section className="zexp__panel zexp__countdown" aria-labelledby="zexp-countdown-title">
        <div className="zexp__countdown-copy">
          <p className="zexp__overline">{phase}</p>
          <h3 id="zexp-countdown-title">
            {completed
              ? 'A build worth remembering.'
              : eventLive
                ? 'The 36-hour build is underway.'
                : checkInOpen
                  ? 'Teams are checking in.'
                  : 'YOUR NEXT 36-HOUR BUILD BEGINS SOON.'}
          </h3>
          {checkInOpen ? (
            <p className="zexp__phase-note">Check-in is open. The configured schedule lists hacking beginning at 12:00 PM IST.</p>
          ) : null}
          {eventLive ? <p className="zexp__phase-note">The configured schedule confirms the hackathon build is live.</p> : null}
          {completed ? <p className="zexp__phase-note">This edition has concluded. Explore the event details and archive.</p> : null}
          <p className="zexp__fineprint">
            {startTimeLabel
              ? `Countdown to the configured event/check-in start at ${startTimeLabel} IST.`
              : 'Date-based countdown to the start of 30 October in IST.'}
          </p>
        </div>
        {beforeStart ? (
          <div className="zexp__clock" aria-label={`Countdown to 30 October 2026${startTimeLabel ? ` at ${startTimeLabel}` : ''} in India Standard Time`}>
            {clockUnits.map(([key, label]) => (
              <div className="zexp__clock-unit" key={key}>
                <span className="zexp__digit" key={values[key]}>{String(values[key]).padStart(2, '0')}</span>
                <span className="zexp__unit-label">{label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function SelectionPanel({ event }) {
  const status = event.selection?.status ?? 'coming-soon';
  const comingSoon = status === 'coming-soon';
  const label = comingSoon ? 'COMING SOON' : status.replaceAll('-', ' ').toUpperCase();

  return (
    <section className="zexp__panel zexp__shortlist" aria-labelledby="zexp-shortlist-title">
      <div className="zexp__scan" aria-hidden="true" />
      <p className="zexp__overline">SELECTION RESULTS</p>
      <h3 id="zexp-shortlist-title">{comingSoon ? <>THE SHORTLIST<br />IS COMING</> : 'SELECTION UPDATE'}</h3>
      <p className="zexp__coming">{label}</p>
      <p>{event.selection?.message ?? 'Shortlisted teams will be announced soon. Keep an eye on official CTSoc updates.'}</p>
      <div className="zexp__redacted" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}

function FeePanel({ event, now }) {
  const registration = getRegistrationState(event, now);

  return (
    <section className="zexp__panel zexp__fee" aria-labelledby="zexp-fee-title">
      <p className="zexp__overline">SHORTLISTED TEAMS</p>
      <h3 id="zexp-fee-title">{event.shortlistedTeamFee?.amount ?? '₹500'} <span>{event.shortlistedTeamFee?.appliesTo ?? 'PER SHORTLISTED TEAM'}</span></h3>
      <p>{event.shortlistedTeamFee?.message ?? 'Participation fee applies only to selected/shortlisted teams. Payment instructions will be shared with the selected teams.'}</p>
      <div className={`zexp__registration zexp__registration--${registration}`}>
        <span>REGISTRATION</span>
        <strong>{registration === 'closed' ? 'CLOSED' : registration.toUpperCase()}</strong>
        {event.registrationCloses ? (
          <small>Deadline: {registrationDate.format(new Date(event.registrationCloses))}</small>
        ) : null}
      </div>
    </section>
  );
}

export default function ZinnovatioExperience({ event }) {
  const now = useNow(1000);
  const reduceMotion = useReducedMotion();
  if (!event) return null;

  const poster = resolveImage(event.banner ?? event.posterSmall ?? event.poster);
  const teamSize = event.facts?.find((fact) => /team size/i.test(fact.label))?.value ?? '3 to 5 members';

  return (
    <section className="section zexp-section" aria-labelledby="zexp-title">
      <div className="container">
        <header className="zexp__intro">
          <p className="zexp__eyebrow">FEATURED EVENT · ZINNOVATIO 4.0</p>
          <h2 id="zexp-title" className="h2">A national-level hackathon.</h2>
          <p className="muted">36-hour hackathon · 30–31 October 2026</p>
        </header>

        <div className="zexp__hero">
          <svg className="zexp__border-lights" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <rect className="zexp__border-track" x="1" y="1" width="998" height="698" rx="34" pathLength="100" />
            <rect className="zexp__border-sweep" x="1" y="1" width="998" height="698" rx="34" pathLength="100" />
            <rect className="zexp__border-point" x="1" y="1" width="998" height="698" rx="34" pathLength="100" />
            <rect className="zexp__border-point zexp__border-point--second" x="1" y="1" width="998" height="698" rx="34" pathLength="100" />
          </svg>
          <div className="zexp__hero-grid" aria-hidden="true" />
          <div className="zexp__glow zexp__glow--blue" aria-hidden="true" />
          <div className="zexp__glow zexp__glow--violet" aria-hidden="true" />
          <Rangoli className="rangoli--showcase" />
          <div className="zexp__hero-copy">
            <p className="zexp__kicker"><span /> NATIONAL-LEVEL HACKATHON</p>
            <p className="zexp__date">30—31 <span>OCTOBER 2026</span></p>
            <h3 className="zexp__headline">36 HOURS.<br />ONE NIGHT.<br /><span>BUILD WHAT&apos;S NEXT.</span></h3>
            <p className="zexp__subhead">A NIGHT OF JOY. CODE. CREATE. ENJOY.</p>
            <p className="zexp__description">
              36 hours of coding, creativity, collaboration, rapid prototyping and an unforgettable hackathon experience.
            </p>
            <div className="zexp__actions">
              <Button to={`/events/${event.slug}`} icon="arrow" className="zexp__cta">
                Explore the event
              </Button>
              <a className="zexp__build-link" href="#zexp-build">
                EXPLORE THE 36-HOUR BUILD <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className="zexp__visual">
            <span className="zexp__visual-label">BUILD // TEST // PRESENT</span>
            {poster ? (
              <img src={poster} alt={event.banner ? event.bannerAlt : event.posterAlt ?? 'Zinnovatio 4.0 hackathon artwork'} loading="lazy" />
            ) : (
              <div className="zexp__visual-fallback" aria-hidden="true">
                <span>ZN / 04</span>
                <strong>BUILD<br />WHAT’S<br />NEXT.</strong>
              </div>
            )}
            <div className="zexp__visual-journey" aria-hidden="true">
              {['IDEA', 'CODE', 'BUILD', 'DEMO'].map((step) => <span key={step}>{step}</span>)}
            </div>
            <div className="zexp__visual-experience">
              <h4>36 HOURS OF BUILDING. ONE UNFORGETTABLE EXPERIENCE.</h4>
              <p>Code through challenges, collaborate through the night and turn ideas into working solutions.</p>
              <ul className="zexp__highlights" aria-label="Hackathon highlights">
                {experienceHighlights.map(([icon, label]) => (
                  <li key={label}><Icon name={icon} /><span>{label}</span></li>
                ))}
              </ul>
            </div>
            <span className="zexp__visual-caption">OVERNIGHT BUILD EXPERIENCE</span>
          </div>
          <div className="zexp__facts" aria-label="Hackathon facts">
            <div><span>DATES</span><strong>30–31 October 2026</strong></div>
            <div><span>FORMAT</span><strong>36-hour hackathon</strong></div>
            <div><span>TEAM SIZE</span><strong>{teamSize}</strong></div>
            <div><span>PRIZE POOL</span><strong>{event.prizes?.pool ?? '₹1,00,000+'}</strong></div>
          </div>
        </div>

        <Countdown event={event} now={now} />

        <section className="zexp__build" id="zexp-build" aria-labelledby="zexp-build-title">
          <div className="zexp__section-heading">
            <p className="zexp__eyebrow">IDEA TO WORKING PROTOTYPE</p>
            <h3 id="zexp-build-title">THE 36-HOUR BUILD</h3>
            <p>Seven stages of the build journey. This is an experience overview, not a timed event agenda.</p>
          </div>
          <ol className="zexp__timeline">
            {stages.map(([number, title, description], index) => (
              reduceMotion ? (
                <li key={number} className={`zexp__stage zexp__stage--${stageThemes[index]}`} style={{ '--stage-index': index }}>
                  <span className="zexp__stage-number">{number}</span>
                  <h4>{title}</h4>
                  <p>{description}</p>
                </li>
              ) : (
                <Reveal as="li" key={number} delay={index * 0.045} className={`zexp__stage zexp__stage--${stageThemes[index]}`} style={{ '--stage-index': index }}>
                  <span className="zexp__stage-number">{number}</span>
                  <h4>{title}</h4>
                  <p>{description}</p>
                </Reveal>
              )
            ))}
          </ol>
        </section>

        <div className="zexp__status-grid">
          <SelectionPanel event={event} />
          <FeePanel event={event} now={now} />
        </div>
      </div>
    </section>
  );
}
