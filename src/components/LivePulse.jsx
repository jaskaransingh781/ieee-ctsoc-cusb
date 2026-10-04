import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
const TUCK_AWAY_AFTER = 10_000; // the card shrinks to a small pill after this long
const ease = [0.22, 1, 0.36, 1];

const untilDay = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' });
const sameIndiaDay = (a, b) => untilDay.format(new Date(a)) === untilDay.format(new Date(b));

const words = {
  live: { state: 'Happening now', lead: 'On now' },
  soon: { state: 'Get ready', lead: 'Starts in' },
  deadline: { state: 'Registration closing', lead: 'Closes in' },
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
      aria-label={`${left.days ? `${left.days} days, ` : ''}${Number(left.hh)} hours and ${Number(left.mm)} minutes`}
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

/** "2d 14:41:08", or "14:41:08" on the last day. */
function shortCountdown(target, now) {
  const left = countdownParts(target, now);
  return `${left.days ? `${left.days}d ` : ''}${left.hh}:${left.mm}:${left.ss}`;
}

/**
 * The pop-up at the corner of the screen. It appears by itself, with a
 * bloom of light, when
 *   - an event is happening now,
 *   - an event starts within COUNTDOWN_DAYS days ("Get ready"), or
 *   - registration for an event closes within COUNTDOWN_DAYS days,
 * and counts down live. After a few seconds it tucks itself away into a
 * small pill so it never sits on top of what someone is reading; a click
 * opens it again. Everything comes from src/data/events.js and the clock.
 * Closing it hides those notices until the browser tab is closed.
 */
export default function LivePulse() {
  const reduce = useReducedMotion();
  const now = useNow(1000);
  useLiveEvents();
  const [dismissed, setDismissed] = useState(readDismissed);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(true);

  const items = getPulseItems(events, now, COUNTDOWN_DAYS).filter((item) => !dismissed.includes(item.id));
  const count = items.length;
  const item = items[Math.min(index, count - 1)] ?? null;

  // Let the page settle before the pop-up arrives.
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  // With more than one notice, show each in turn.
  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const timer = setInterval(() => setIndex((value) => (value + 1) % count), ROTATE_EVERY);
    return () => clearInterval(timer);
  }, [count, paused]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [index, count]);

  // Open (and bloom) whenever there is something new to say, then tuck away.
  const signature = items.map((entry) => entry.id).join('|');
  useEffect(() => {
    if (signature) setOpen(true);
  }, [signature]);

  useEffect(() => {
    if (!ready || !open || paused || !signature) return undefined;
    const timer = setTimeout(() => setOpen(false), TUCK_AWAY_AFTER);
    return () => clearTimeout(timer);
  }, [ready, open, paused, signature]);

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

  if (show && !open) {
    return (
      <AnimatePresence>
        <motion.aside
          key="pill"
          className={`pulse pulse--${item.kind} pulse--pill`}
          aria-label="Happening now and coming up"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduce ? { duration: 0.2 } : { type: 'spring', stiffness: 320, damping: 26 }}
        >
          <button type="button" className="pulse__pill" onClick={() => setOpen(true)} aria-expanded="false">
            <span className="pulse__dot" aria-hidden="true" />
            <span className="pulse__pill-state">{text.state}</span>
            <span className="pulse__pill-title">{item.title}</span>
            {item.kind === 'live' ? null : (
              <span className="pulse__pill-time" aria-hidden="true">
                {shortCountdown(item.target, now)}
              </span>
            )}
            <span className="visually-hidden">Show details</span>
          </button>
        </motion.aside>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {show ? (
        <motion.aside
          key="card"
          className={`pulse pulse--${item.kind}`}
          aria-label="Happening now and coming up"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.86 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.94 }}
          transition={reduce ? { duration: 0.2 } : { type: 'spring', stiffness: 260, damping: 22 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {/* The bloom: light opening out behind the card, replayed for each notice. */}
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
                    {deadline ? (
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
                  <Link to={item.to} className={`pulse__btn ${item.href ? '' : 'pulse__btn--main'}`}>
                    {item.kind === 'live' ? 'See what is on' : 'View details'}
                    <Icon name="arrow" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
