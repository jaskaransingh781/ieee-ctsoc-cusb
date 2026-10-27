import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { COUNTDOWN_DAYS, events } from '../data/events';
import { useNow } from '../lib/countdown';
import { formatDeadline } from '../lib/format';
import { useLiveEvents } from '../lib/hooks';
import { countdownParts, getPulseItems } from '../lib/pulse';
import { getFestivalTheme } from '../lib/festival';
import { ExternalLink } from './Button';
import Icon from './Icon';
import './LivePulse.css';

const STORE = 'ctsoc-pulse-dismissed';
const ROTATE_EVERY = 7000;
const TUCK_AWAY_AFTER = 8000;
const ease = [0.22, 1, 0.36, 1];

const ZINNOVATIO_START = new Date('2026-10-30T09:00:00+05:30').getTime();
const ZINNOVATIO_END = new Date('2026-10-31T21:00:00+05:30').getTime();

const untilDay = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });
const teaserDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
const sameIndiaDay = (a, b) => untilDay.format(new Date(a)) === untilDay.format(new Date(b));

const words = {
  live: { state: 'Happening now', lead: 'On now' },
  soon: { state: 'Get ready', lead: 'Starts in' },
  deadline: { state: 'Registration closing', lead: 'Closes in' },
  teaser: { state: 'Get ready', lead: 'Coming in' },
  zinnovatio: { state: 'National Hackathon', lead: 'Build Begins In' },
};

function readDismissed() {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORE) ?? '[]');
  } catch {
    return [];
  }
}

function ZinnovatioCountdownBoxes({ target, now }) {
  const left = countdownParts(target, now);
  const units = [
    { label: 'DAYS', val: String(left.days).padStart(2, '0') },
    { label: 'HOURS', val: left.hh },
    { label: 'MINUTES', val: left.mm },
    { label: 'SECONDS', val: left.ss },
  ];

  return (
    <div className="pulse__zinnovatio-clock" role="timer" aria-label={`${left.days} days, ${left.hh} hours, ${left.mm} minutes, ${left.ss} seconds remaining`}>
      {units.map((u) => (
        <div className="pulse__zinnovatio-unit" key={u.label}>
          <span className="pulse__zinnovatio-digit">{u.val}</span>
          <span className="pulse__zinnovatio-label">{u.label}</span>
        </div>
      ))}
    </div>
  );
}

function Countdown({ target, now }) {
  const left = countdownParts(target, now);
  const parts = [
    left.days > 0 && ['days', String(left.days).padStart(2, '0')],
    ['hrs', left.hh],
    ['min', left.mm],
    ['sec', left.ss],
  ].filter(Boolean);

  return (
    <div
      className="pulse__count"
      role="timer"
      aria-label={`${left.days ? `${left.days} days, ` : ''}${Number(left.hh)} hours, ${Number(left.mm)} minutes and ${Number(left.ss)} seconds`}
    >
      {parts.map(([label, value]) => (
        <span className="pulse__tile" key={label} aria-hidden="true">
          <strong>{value}</strong>
          <small>{label}</small>
        </span>
      ))}
    </div>
  );
}

/** "2d 14h 22m", or "14h 22m 10s" on the last day. */
function shortCountdown(target, now) {
  const left = countdownParts(target, now);
  if (left.days > 0) {
    return `${left.days}d ${left.hh}h ${left.mm}m`;
  }
  return `${left.hh}h ${left.mm}m ${left.ss}s`;
}

export default function LivePulse() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduce = useReducedMotion();
  const now = useNow(1000);
  const festival = getFestivalTheme(new Date(now));
  useLiveEvents();
  const [dismissed, setDismissed] = useState(readDismissed);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false); // start compact for an unobtrusive experience
  const [headerBottom, setHeaderBottom] = useState(null);

  // Position dynamic island elegantly relative to header
  useEffect(() => {
    const updateHeader = () => {
      const nav = document.querySelector('.nav');
      if (nav) {
        setHeaderBottom(Math.max(0, nav.getBoundingClientRect().bottom));
      }
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', updateHeader);
    return () => {
      window.removeEventListener('scroll', updateHeader);
      window.removeEventListener('resize', updateHeader);
    };
  }, []);

  // On scroll, smoothly collapse into compact pill state without hiding important content
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (paused) return; // Keep open if visitor is actively interacting
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (Math.abs(currentY - lastY) > 20 && open) {
            setOpen(false);
          }
          lastY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [paused, open]);

  // Construct items with Zinnovatio 4.O countdown guaranteed
  const rawItems = getPulseItems(events, now, COUNTDOWN_DAYS).filter((item) => !dismissed.includes(item.id));
  const zinnovatioEvent = events.find((e) => e.slug === 'zinnovatio-4o');

  const items = [...rawItems];
  if (zinnovatioEvent && !items.some((it) => it.event?.slug === 'zinnovatio-4o')) {
    items.unshift({
      id: 'zinnovatio-4o:featured',
      kind: 'zinnovatio',
      title: 'Zinnovatio 4.0',
      target: ZINNOVATIO_START,
      event: zinnovatioEvent,
      to: '/events/zinnovatio-4o',
    });
  }

  const count = items.length;
  const item = items[Math.min(index, count - 1)] ?? null;

  // Let the page settle before the island appears
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(timer);
  }, []);

  // Auto-collapse after expansion unless visitor is hovering
  useEffect(() => {
    if (!ready || !open || paused) return undefined;
    const timer = setTimeout(() => setOpen(false), TUCK_AWAY_AFTER);
    return () => clearTimeout(timer);
  }, [ready, open, paused]);

  // Rotate through notices if multiple exist
  useEffect(() => {
    if (count < 2 || paused || open) return undefined;
    const timer = setInterval(() => setIndex((value) => (value + 1) % count), ROTATE_EVERY);
    return () => clearInterval(timer);
  }, [count, paused, open]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [index, count]);

  const dismiss = () => {
    if (!item) return;
    const next = [...new Set([...dismissed, item.id])];
    setDismissed(next);
    try {
      window.sessionStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      // storage exception safe
    }
    setOpen(false);
  };

  const show = ready && Boolean(item);
  const isZinnovatio = item?.kind === 'zinnovatio' || item?.event?.slug === 'zinnovatio-4o';
  const text = item ? (words[item.kind] ?? { state: 'Upcoming Event', lead: 'Starts in' }) : null;
  const deadline = item?.kind === 'deadline' ? formatDeadline(item.target, now) : null;

  // Zinnovatio live and end state checks
  const isZinnLive = Boolean(now >= ZINNOVATIO_START && now < ZINNOVATIO_END);
  const isZinnEnded = Boolean(now >= ZINNOVATIO_END);

  const viewTeaser = (e) => {
    e.preventDefault();
    setOpen(false);
    const revealTeaser = () => {
      const section = document.getElementById('ieee-day-teaser');
      if (!section) return;
      section.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'center' });
      section.classList.add('is-highlighted');
      window.setTimeout(() => section.classList.remove('is-highlighted'), 2200);
    };
    if (location.pathname !== '/') {
      navigate('/#ieee-day-teaser');
      window.setTimeout(revealTeaser, reduce ? 0 : 360);
    } else {
      window.history.replaceState(window.history.state, '', '/#ieee-day-teaser');
      window.setTimeout(revealTeaser, reduce ? 0 : 220);
    }
  };

  return (
    <AnimatePresence>
      {show ? (
        <motion.aside
          style={
            headerBottom !== null && typeof window !== 'undefined' && window.innerWidth > 640
              ? { top: `calc(${headerBottom}px + max(0.65rem, env(safe-area-inset-top, 0px)))` }
              : undefined
          }
          key={open ? 'card' : 'pill'}
          className={`pulse pulse--${item.kind}${festival ? ' pulse--festive' : ''} ${isZinnovatio ? 'pulse--zinnovatio' : ''} ${open ? '' : 'pulse--pill'}`}
          aria-label="Event countdown and notices"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: open ? -15 : -8, scale: open ? 0.94 : 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.94 }}
          transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 280, damping: 24 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {open ? (
            <motion.div
              key="island-expanded-content"
              className="pulse__expanded"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.12 : 0.2, ease }}
            >
              <span className="pulse__bloom" key={`bloom-${item.id}`} aria-hidden="true" />
              <span className="pulse__ring" key={`ring-${item.id}`} aria-hidden="true" />
              <div className="pulse__glass">
                <div className="pulse__top">
                  <p className="pulse__state">
                    <span className="pulse__dot" aria-hidden="true" />
                    {isZinnovatio
                      ? isZinnEnded
                        ? 'EVENT CONCLUDED'
                        : isZinnLive
                          ? 'HACKATHON LIVE'
                          : 'NATIONAL HACKATHON'
                      : text.state}
                  </p>
                  {count > 1 ? (
                    <div className="pulse__pager" role="group" aria-label="Notices">
                      {items.map((entry, position) => (
                        <button
                          key={entry.id}
                          type="button"
                          className={`pulse__pip ${entry.id === item.id ? 'is-on' : ''}`}
                          aria-label={`Notice ${position + 1} of ${count}: ${entry.title}`}
                          aria-pressed={entry.id === item.id}
                          onClick={() => setIndex(position)}
                        />
                      ))}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="pulse__close"
                    onClick={() => setOpen(false)}
                    aria-label="Minimise this notice"
                  >
                    <Icon name="minus" />
                  </button>
                  <button type="button" className="pulse__close" onClick={dismiss} aria-label="Dismiss this notice">
                    <Icon name="close" />
                  </button>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={item.id}
                    className="pulse__body"
                    initial={{ opacity: 0, x: reduce ? 0 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduce ? 0 : -10 }}
                    transition={{ duration: 0.22, ease }}
                  >
                    {isZinnovatio ? (
                      <div className="pulse__zinnovatio-body">
                        <div className="pulse__zinnovatio-title-row">
                          <p className="pulse__title">Zinnovatio 4.0</p>
                          <span className="pulse__zinnovatio-dates">30–31 October 2026</span>
                        </div>
                        <p className="pulse__zinnovatio-message">The wait is over. Are you ready?</p>

                        {isZinnEnded ? (
                          <div className="pulse__zinnovatio-status-banner">
                            <strong>HACKATHON CONCLUDED</strong>
                            <p>This edition has wrapped up. Explore the build highlights and winners.</p>
                          </div>
                        ) : isZinnLive ? (
                          <>
                            <div className="pulse__zinnovatio-live-badge">
                              <span className="pulse__dot pulse__dot--live" aria-hidden="true" />
                              <span>HACKATHON IN PROGRESS · 36H SPRINT LIVE</span>
                            </div>
                            <p className="pulse__lead">Sprint Ends In</p>
                            <ZinnovatioCountdownBoxes target={ZINNOVATIO_END} now={now} />
                          </>
                        ) : (
                          <>
                            <p className="pulse__lead">36-Hour Build Begins In</p>
                            <ZinnovatioCountdownBoxes target={ZINNOVATIO_START} now={now} />
                          </>
                        )}

                        <div className="pulse__zinnovatio-confirmed">
                          <Icon name="check" size={13} />
                          <span>✓ Selection &amp; Payments Completed</span>
                        </div>

                        <div className="pulse__actions">
                          <Link
                            to="/events/zinnovatio-4o"
                            className="pulse__btn pulse__btn--main"
                            onClick={() => setOpen(false)}
                          >
                            Explore Event
                            <Icon name="arrow" />
                          </Link>
                          <Link
                            to="/events/zinnovatio-4o#getting-here"
                            className="pulse__btn"
                            onClick={() => setOpen(false)}
                          >
                            Roadmap
                            <Icon name="pin" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <>
                        {festival ? (
                          <>
                            <div className="pulse__festival-special">
                              <p className="pulse__festival-kicker">Festive special</p>
                              <p className="pulse__festival-heading">
                                {festival === 'vijayadashami' ? 'HAPPY VIJAYADASHAMI' : 'SHUBH NAVRATRI'}
                              </p>
                              <p className="pulse__festival-copy">
                                Celebrating nine nights of devotion, strength, creativity and new beginnings.
                              </p>
                            </div>
                            {item.title === 'IEEE Day 2026' ? (
                              <p className="pulse__announcement">
                                {item.title}<span> · {text.state}</span>
                              </p>
                            ) : null}
                          </>
                        ) : null}
                        {festival && item.title === 'IEEE Day 2026' ? null : (
                          <p className="pulse__title">{item.title}</p>
                        )}

                        {item.kind === 'live' ? (
                          <p className="pulse__line">
                            {sameIndiaDay(item.until, now)
                              ? 'On today.'
                              : `On until ${untilDay.format(new Date(item.until))}.`}
                          </p>
                        ) : (
                          <>
                            <p className="pulse__lead">{text.lead}</p>
                            <Countdown target={item.target} now={now} />
                            {item.kind === 'teaser' ? (
                              <p className="pulse__line">
                                <strong>{teaserDate.format(new Date(item.target))}</strong> · Something is waiting on campus.
                              </p>
                            ) : deadline ? (
                              <p className="pulse__line">
                                <strong>{deadline.day}</strong>, {deadline.time}
                              </p>
                            ) : null}
                          </>
                        )}

                        <div className="pulse__actions">
                          {item.href ? (
                            <ExternalLink href={item.href} className="pulse__btn pulse__btn--main">
                              {item.hrefLabel}
                              <Icon name="out" />
                            </ExternalLink>
                          ) : null}
                          <Link
                            to={item.to}
                            onClick={item.kind === 'teaser' ? viewTeaser : undefined}
                            className={`pulse__btn ${item.href ? '' : 'pulse__btn--main'}`}
                          >
                            {item.kind === 'live'
                              ? 'See what is on'
                              : item.kind === 'teaser'
                                ? 'View Teaser'
                                : 'View details'}
                            <Icon name="arrow" />
                          </Link>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="island-compact-content"
              type="button"
              className={`pulse__pill ${isZinnovatio ? 'pulse__pill--zinnovatio' : ''}`}
              onClick={() => setOpen(true)}
              aria-expanded={open}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.1 : 0.18, ease }}
            >
              <span className={`pulse__dot ${isZinnovatio ? 'pulse__dot--red' : ''}`} aria-hidden="true" />
              {item.kind === 'teaser' ? <span className="pulse__pill-star" aria-hidden="true">✦</span> : null}
              <span className="pulse__pill-title">
                {isZinnovatio ? 'ZINNOVATIO 4.0' : item.kind === 'teaser' ? 'IEEE DAY 2026' : item.title}
              </span>
              {festival && !isZinnovatio ? (
                <span className="pulse__festival" aria-label={festival === 'vijayadashami' ? 'Happy Vijayadashami' : 'Shubh Navratri'}>
                  <svg viewBox="0 0 20 16" aria-hidden="true" focusable="false">
                    <path d="M10 1C7.5 4 9 6 10 7c1.2-1 2.5-3 0-6Z" />
                    <path d="M4 8c1.2 4.5 3.2 6.5 6 6.5s4.8-2 6-6.5c-3 1.5-9 1.5-12 0Z" />
                  </svg>
                  <span>{festival === 'vijayadashami' ? 'HAPPY VIJAYADASHAMI' : 'SHUBH NAVRATRI'}</span>
                </span>
              ) : null}
              <span className="pulse__pill-state">
                {isZinnovatio
                  ? isZinnEnded
                    ? 'CONCLUDED'
                    : isZinnLive
                      ? 'LIVE'
                      : 'STARTS IN'
                  : item.kind === 'teaser'
                    ? 'Upcoming'
                    : text.state}
              </span>
              {isZinnovatio ? (
                <span className="pulse__pill-time" aria-hidden="true">
                  {isZinnEnded
                    ? '30-31 OCT'
                    : isZinnLive
                      ? shortCountdown(ZINNOVATIO_END, now)
                      : shortCountdown(ZINNOVATIO_START, now)}
                </span>
              ) : item.kind === 'teaser' ? (
                <span className="pulse__pill-date">09 OCT</span>
              ) : item.kind === 'live' ? null : (
                <span className="pulse__pill-time" aria-hidden="true">
                  {shortCountdown(item.target, now)}
                </span>
              )}
              <span className="visually-hidden">Show details</span>
            </motion.button>
          )}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
