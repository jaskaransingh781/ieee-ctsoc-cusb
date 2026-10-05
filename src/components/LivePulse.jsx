import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { COUNTDOWN_DAYS, events } from '../data/events';
import { useNow } from '../lib/countdown';
import { formatDeadline } from '../lib/format';
import { useLiveEvents } from '../lib/hooks';
import { countdownParts, getPulseItems } from '../lib/pulse';
import { ExternalLink } from './Button';
import Icon from './Icon';
import './LivePulse.css';

const STORE = 'ctsoc-pulse-dismissed';
const ROTATE_EVERY = 7000;
const ease = [0.22, 1, 0.36, 1];

const untilDay = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });
const teaserDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
const sameIndiaDay = (a, b) => untilDay.format(new Date(a)) === untilDay.format(new Date(b));

const words = {
  live: { state: 'Happening now', lead: 'On now' },
  soon: { state: 'Get ready', lead: 'Starts in' },
  deadline: { state: 'Registration closing', lead: 'Closes in' },
  teaser: { state: 'Get ready', lead: 'Coming in' },
};

function readDismissed() {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORE) ?? '[]');
  } catch {
    return [];
  }
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
          <AnimatePresence mode="wait" initial={false}>
            <motion.strong
              key={value}
              initial={{ opacity: 0, y: 4, filter: 'blur(2px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -4, filter: 'blur(2px)' }}
              transition={{ duration: 0.18, ease }}
            >
              {value}
            </motion.strong>
          </AnimatePresence>
          <small>{label}</small>
        </span>
      ))}
    </div>
  );
}

/** "2d 14:41:08", or "14:41:08" on the last day. */
function shortCountdown(target, now) {
  const left = countdownParts(target, now);
  return `${left.days ? `${left.days}d ` : ''}${left.hh}:${left.mm}:${left.ss}`;
}

/**
 * The Dynamic Island stays compact at the top center and expands on click
 * when there is an active notice. Scrolling down tucks it to the right.
 * Notices are selected when
 *   - an event is happening now,
 *   - an event starts within COUNTDOWN_DAYS days ("Get ready"), or
 *   - registration for an event closes within COUNTDOWN_DAYS days,
 * and counts down live. Everything comes from src/data/events.js and the clock.
 * Dismissing it hides those notices until the browser tab is closed.
 */
export default function LivePulse() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduce = useReducedMotion();
  const now = useNow(1000);
  useLiveEvents();
  const [dismissed, setDismissed] = useState(readDismissed);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avoidContent, setAvoidContent] = useState(false);
  const [hideForContent, setHideForContent] = useState(false);

  const items = getPulseItems(events, now, COUNTDOWN_DAYS).filter((item) => !dismissed.includes(item.id));
  const count = items.length;
  const item = items[Math.min(index, count - 1)] ?? null;

  // Let the page settle before the compact island appears.
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  // Measure the real header stack. The announcement scrolls away while the
  // navbar sticks, so its visible bottom is the island's safe top in either state.
  useEffect(() => {
    const announcement = document.querySelector('.announcement');
    const navbar = document.querySelector('.nav');
    let frame = 0;
    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const announcementBottom = announcement?.getBoundingClientRect().bottom ?? 0;
        const navbarBottom = navbar?.getBoundingClientRect().bottom ?? 0;
        const bottom = Math.max(0, announcementBottom, navbarBottom);
        document.documentElement.style.setProperty('--pulse-header-bottom', `${Math.ceil(bottom)}px`);
      });
    };

    const observer = new ResizeObserver(measure);
    if (announcement) observer.observe(announcement);
    if (navbar) observer.observe(navbar);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    measure();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      document.documentElement.style.removeProperty('--pulse-header-bottom');
    };
  }, []);

  // Center the compact island at the top; tuck it to the right while
  // scrolling down and return it to center when the visitor scrolls up.
  useEffect(() => {
    let previous = window.scrollY;
    setScrolled(previous >= 24);
    const onScroll = () => {
      const current = window.scrollY;
      if (current < 24) {
        setScrolled(false);
      } else if (current > previous + 2) {
        setScrolled(true);
      } else if (current < previous - 2) {
        setScrolled(false);
      }
      previous = current;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Collapse on an intentional scroll gesture. DOM changes inside the island
  // can adjust scroll anchoring, so the scroll position alone is not intent.
  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    window.addEventListener('wheel', close, { passive: true });
    window.addEventListener('touchmove', close, { passive: true });
    return () => {
      window.removeEventListener('wheel', close);
      window.removeEventListener('touchmove', close);
    };
  }, [open]);

  // With more than one notice, show each in turn.
  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const timer = setInterval(() => setIndex((value) => (value + 1) % count), ROTATE_EVERY);
    return () => clearInterval(timer);
  }, [count, paused]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [index, count]);


  const dismiss = () => {
    const next = [...new Set([...dismissed, ...items.map((entry) => entry.id)])];
    setDismissed(next);
    try {
      window.sessionStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      // Private windows may refuse storage; the pop-up still closes.
    }
  };

  const show = ready && Boolean(item);
  const text = item ? words[item.kind] : null;
  const deadline = item?.kind === 'deadline' ? formatDeadline(item.target, now) : null;

  const viewTeaser = (event) => {
    event.preventDefault();
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
      window.setTimeout(revealTeaser, 520);
    } else {
      window.history.replaceState(window.history.state, '', '/#ieee-day-teaser');
      revealTeaser();
    }
  };

  // Prefer the right-side position while scrolling, but tuck the island to
  // the lower edge if it would sit over a page heading, lead, or hero control.
  useEffect(() => {
    const targets = [
      '.hero__badge', '.hero__title', '.hero__lead', '.hero__actions',
      '.signup-page__head', '.signup-page__form', '.signup-contact',
      '.section-head', '.previous__head', '.flagship', '.ieee-teaser', '.cjoin',
    ];
    let frame = 0;
    const measureCollision = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const island = document.querySelector('.pulse');
        if (!show || !scrolled || open || !island) {
          setAvoidContent(false);
          setHideForContent(false);
          return;
        }

        const current = island.getBoundingClientRect();
        const top = Math.max(
          document.querySelector('.nav')?.getBoundingClientRect().bottom ?? 0,
          Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pulse-header-bottom')) || 0,
        ) + 12;
        const right = window.innerWidth - Math.max(12, Number.parseFloat(getComputedStyle(island).right) || 12);
        const candidate = { left: right - current.width, right, top, bottom: top + current.height };
        const bottomCandidate = {
          ...candidate,
          top: window.innerHeight - current.height - Math.max(16, window.visualViewport?.offsetTop ?? 0),
          bottom: window.innerHeight - Math.max(16, window.visualViewport?.offsetTop ?? 0),
        };
        const intersects = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        const overlapsImportant = (box) => targets.some((selector) =>
          [...document.querySelectorAll(selector)].some((target) => {
            const rect = target.getBoundingClientRect();
            return intersects(box, { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });
          }),
        );
        const topCollision = overlapsImportant(candidate);
        const bottomCollision = overlapsImportant(bottomCandidate);
        setAvoidContent(topCollision && !bottomCollision);
        setHideForContent(topCollision && bottomCollision);
      });
    };

    const observer = new ResizeObserver(measureCollision);
    const main = document.querySelector('#main');
    if (main) observer.observe(main);
    window.addEventListener('scroll', measureCollision, { passive: true });
    window.addEventListener('resize', measureCollision);
    measureCollision();
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', measureCollision);
      window.removeEventListener('resize', measureCollision);
    };
  }, [show, scrolled, open, item?.id]);

  const safeSlot = item ? (
    <div className={`pulse-slot ${open && !scrolled ? 'pulse-slot--expanded' : ''}`} aria-hidden="true" />
  ) : null;

  return (
    <>
      {safeSlot}
      <AnimatePresence>
        {show ? (
          <motion.aside
            layout
            key="island"
            className={`pulse pulse--${item.kind} ${open ? 'pulse--open' : 'pulse--pill'} ${scrolled ? 'pulse--scrolled' : 'pulse--top'} ${avoidContent ? 'pulse--avoids' : ''} ${hideForContent ? 'pulse--obscured' : ''}`}
            aria-label="Happening now and coming up"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
            transition={reduce ? { duration: 0.16 } : { type: 'spring', stiffness: 280, damping: 27, mass: 0.8 }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {open ? (
              <motion.div
                key="island-expanded-content"
                className="pulse__expanded"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 5 }}
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
                {text.state}
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
                initial={{ opacity: 0, x: reduce ? 0 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduce ? 0 : -12 }}
                transition={{ duration: 0.24, ease }}
              >
                <p className="pulse__title">{item.title}</p>

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
              </motion.div>
            </AnimatePresence>
          </div>
              </motion.div>
            ) : (
              <motion.button
                key="island-compact-content"
                type="button"
                className="pulse__pill"
                onClick={() => setOpen(true)}
                aria-expanded="false"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.1 : 0.18, ease }}
              >
                <span className="pulse__dot" aria-hidden="true" />
                <span className="pulse__pill-state">{item.kind === 'teaser' ? 'Get ready' : text.state}</span>
                <span className="pulse__pill-title">{item.title}</span>
                {item.kind === 'live' || item.kind === 'teaser' ? null : (
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
    </>
  );
}
