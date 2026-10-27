import { useReducedMotion } from 'framer-motion';
import { getRegistrationState } from '../data/events';
import { resolveImage } from '../lib/assets';
import { useNow } from '../lib/countdown';
import Button from './Button';
import Icon from './Icon';
import Reveal from './Reveal';
import './ZinnovatioExperience.css';

const IST = 'Asia/Kolkata';
const clockUnits = [
  ['days', 'DAYS'],
  ['hours', 'HOURS'],
  ['minutes', 'MINUTES'],
  ['seconds', 'SECONDS'],
];

const phases = [
  {
    number: '01',
    name: 'IDEATE',
    summary: 'Define the challenge, shape your idea, and establish a clear solution.',
    icon: 'spark',
    tag: 'CONCEPT & STRATEGY',
  },
  {
    number: '02',
    name: 'BUILD',
    summary: 'Design, develop, test, and refine a working prototype with your team.',
    icon: 'cpu',
    tag: '36-HOUR OVERNIGHT SPRINT',
    isOvernight: true,
  },
  {
    number: '03',
    name: 'PRESENT',
    summary: 'Polish your solution, demonstrate your prototype, and present your work to the jury.',
    icon: 'trophy',
    tag: 'DEMO & JURY EVALUATION',
  },
];

const experienceHighlights = [
  ['cpu', 'CODING SPRINTS'],
  ['nodes', 'TEAM CHALLENGES'],
  ['layers', 'BUILD & PROTOTYPE'],
  ['clock', 'OVERNIGHT EXPERIENCE'],
  ['spark', 'MUSIC & CELEBRATION'],
];

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
              ? `Countdown to the configured event start at ${startTimeLabel} IST on 30 October 2026.`
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

function ConfirmationPanel() {
  return (
    <section className="zexp__panel zexp__confirmation" aria-labelledby="zexp-confirmation-title">
      <div className="zexp__confirmation-header">
        <div className="zexp__confirmation-badge">
          <span className="zexp__confirmation-check" aria-hidden="true">✓</span>
          <span>PARTICIPATION CONFIRMED</span>
        </div>
        <div className="zexp__confirmation-pulse" aria-hidden="true" />
      </div>

      <p className="zexp__overline">PARTICIPATION STATUS</p>
      <h3 id="zexp-confirmation-title" className="zexp__confirmation-heading">YOU&apos;RE IN.</h3>
      <p className="zexp__confirmation-copy">
        Your selection is confirmed and payment has been received. Welcome to Zinnovatio 4.0. Get ready to collaborate, build, and turn your ideas into working solutions.
      </p>

      <dl className="zexp__confirmation-meta">
        <div className="zexp__confirmation-meta-item">
          <dt>Selection</dt>
          <dd><Icon name="check" size={14} /> Completed.</dd>
        </div>
        <div className="zexp__confirmation-meta-item">
          <dt>Payment</dt>
          <dd><Icon name="check" size={14} /> Completed.</dd>
        </div>
        <div className="zexp__confirmation-meta-item">
          <dt>Event</dt>
          <dd>30–31 October 2026</dd>
        </div>
      </dl>
    </section>
  );
}

function AccommodationPanel({ event }) {
  return (
    <section className="zexp__panel zexp__fee" aria-labelledby="zexp-fee-title">
      <div className="zexp__fee-header">
        <p className="zexp__overline">HOSPITALITY &amp; ACCOMMODATION</p>
        <span className="zexp__stay-pill">29 OCTOBER ONLY</span>
      </div>

      <h3 id="zexp-fee-title" className="zexp__fee-price">
        ₹500 <span>PER PERSON</span>
      </h3>

      <p className="zexp__fee-summary">
        Accommodation is available exclusively to participants arriving on <strong>29 October 2026</strong>. The package covers one night only.
      </p>

      <div className="zexp__inclusions">
        <p className="zexp__inclusions-title">PACKAGE INCLUDES</p>
        <ul className="zexp__inclusions-list">
          <li>
            <Icon name="check" size={16} />
            <span>Accommodation for the night of <strong>29 October 2026</strong>.</span>
          </li>
          <li>
            <Icon name="check" size={16} />
            <span>Three meal servings.</span>
          </li>
          <li>
            <Icon name="check" size={16} />
            <span>Two tea servings.</span>
          </li>
        </ul>
      </div>

      <div className="zexp__fee-restriction" role="note">
        <div className="zexp__fee-restriction-tag">
          <Icon name="alert" size={15} />
          <strong>IMPORTANT ARRIVAL RESTRICTION</strong>
        </div>
        <p>
          No accommodation is available before 29 October 2026. The ₹500 package covers the night of 29 October only. Additional nights are not included.
        </p>
      </div>
    </section>
  );
}

function FoodNoticePanel() {
  return (
    <aside className="zexp__panel zexp__food-notice" aria-labelledby="zexp-food-title">
      <div className="zexp__food-notice-header">
        <div className="zexp__food-badge">
          <Icon name="info" size={15} />
          <span>VENUE DINING</span>
        </div>
        <h4 id="zexp-food-title" className="zexp__food-title">FOOD DURING THE HACKATHON</h4>
      </div>
      <div className="zexp__food-content">
        <p>
          Food stalls will be available at the venue on <strong>30–31 October 2026</strong>. Participants can purchase food directly from the vendors.
        </p>
        <div className="zexp__food-alert">
          <Icon name="spark" size={15} />
          <span>Food purchases must be paid directly to the respective vendors and are not included in the ₹500 accommodation package.</span>
        </div>
      </div>
    </aside>
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
          <div className="zexp__glow zexp__glow--red" aria-hidden="true" />
          <div className="zexp__hero-copy">
            <p className="zexp__kicker"><span /> NATIONAL-LEVEL HACKATHON</p>
            <p className="zexp__date">30—31 <span>OCTOBER 2026</span></p>
            <h3 className="zexp__headline">THE WAIT IS OVER.<br /><span>ZINNOVATIO 4.0 ARRIVES THIS WEEKEND.</span></h3>
            <p className="zexp__subhead">36 hours. Limitless possibilities. One unforgettable build.</p>
            <p className="zexp__description">
              Two days. One relentless build. Endless possibilities. Get ready to turn ideas into working solutions.
            </p>
            <div className="zexp__actions">
              <Button to={`/events/${event.slug}`} icon="arrow" className="zexp__cta">
                Explore the event
              </Button>
              <a className="zexp__build-link" href="#zexp-build">
                EXPLORE THE 3-PHASE JOURNEY <span aria-hidden="true">↓</span>
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
              {['IDEATE', 'BUILD', 'PROTOTYPE', 'PRESENT'].map((step) => <span key={step}>{step}</span>)}
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
            <p className="zexp__eyebrow">THE 36-HOUR BUILD</p>
            <h3 id="zexp-build-title">A 3-PHASE JOURNEY</h3>
            <p className="zexp__build-lead">
              A relentless 36-hour sprint from initial concept to live prototype. Mentors, review checkpoints, and technical support run continuously throughout the hackathon.
            </p>
          </div>

          <div className="zexp__journey">
            {/* The desktop connecting line: runs precisely through the visual center of milestone markers, behind the markers */}
            <div className="zexp__journey-track" aria-hidden="true">
              <div className="zexp__journey-line" />
              <div className="zexp__journey-beam" />
            </div>

            <ol className="zexp__journey-phases">
              {phases.map((phase, index) => {
                const phaseContent = (
                  <div className={`zexp__phase-card ${phase.isOvernight ? 'zexp__phase-card--overnight' : ''}`}>
                    <div className="zexp__phase-marker-slot">
                      <div className="zexp__phase-marker">
                        <span className="zexp__phase-number">{phase.number}</span>
                        <span className="zexp__phase-icon" aria-hidden="true">
                          <Icon name={phase.icon} size={18} />
                        </span>
                      </div>
                    </div>

                    <div className="zexp__phase-body">
                      <div className="zexp__phase-top">
                        <span className="zexp__phase-tag">
                          {phase.isOvernight ? <Icon name="moon" size={12} /> : null}
                          {phase.tag}
                        </span>
                      </div>
                      <h4 className="zexp__phase-heading">{phase.number} — {phase.name}</h4>
                      <p className="zexp__phase-summary">{phase.summary}</p>
                    </div>
                  </div>
                );

                return reduceMotion ? (
                  <li key={phase.number} className="zexp__phase-item">
                    {phaseContent}
                  </li>
                ) : (
                  <Reveal as="li" key={phase.number} delay={index * 0.08} className="zexp__phase-item">
                    {phaseContent}
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </section>

        <div className="zexp__status-grid">
          <ConfirmationPanel />
          <AccommodationPanel event={event} />
        </div>

        <FoodNoticePanel />
      </div>
    </section>
  );
}
