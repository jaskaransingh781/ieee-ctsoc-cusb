import { useCountdown } from '../lib/countdown';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import './Countdown.css';

/**
 * Countdown tiles: days, hours, minutes, seconds.
 *   size="lg"       larger numerals (the registration timer)
 *   hideZeroDays    drops the Days tile once less than a day is left
 */
export function CountdownTiles({ target, doneLabel = 'Under way now', size, hideZeroDays = false }) {
  const left = useCountdown(target);
  const reduce = useReducedMotion();
  if (!left) return null;
  if (left.done) return <p className="ctiles__done">{doneLabel}</p>;

  const parts = [
    ['Days', String(left.days).padStart(2, '0')],
    ['Hours', left.hh],
    ['Minutes', left.mm],
    ['Seconds', left.ss],
  ].filter(([label]) => !(hideZeroDays && label === 'Days' && left.days === 0));

  const spoken =
    left.days > 0
      ? `${left.days} days, ${left.hours} hours and ${left.minutes} minutes to go`
      : `${left.hours} hours and ${left.minutes} minutes to go`;

  return (
    <div
      className={`ctiles ${size === 'lg' ? 'ctiles--lg' : ''}`}
      style={{ '--tiles': parts.length }}
      role="timer"
      aria-label={spoken}
    >
      {parts.map(([label, value]) => (
        <div className="ctiles__tile" key={label} aria-hidden="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={value}
              className="ctiles__num"
              initial={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
              transition={{ duration: reduce ? 0.08 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
          <span className="ctiles__label">{label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Compact one-line countdown for the event sidebar: "2d : 19h : 51m", and
 * "19h : 51m : 07s" once less than a day is left.
 */
export function CountdownInline({ target, doneLabel = 'Closed' }) {
  const left = useCountdown(target);
  if (!left) return null;
  if (left.done) return <span className="cinline cinline--done">{doneLabel}</span>;

  const lastDay = left.days === 0;

  return (
    <span
      className="cinline"
      role="timer"
      aria-label={
        lastDay
          ? `${left.hours} hours and ${left.minutes} minutes left`
          : `${left.days} days, ${left.hours} hours and ${left.minutes} minutes left`
      }
    >
      {lastDay ? (
        <span aria-hidden="true">
          {left.hh}h<i>:</i>
          {left.mm}m<i>:</i>
          {left.ss}s
        </span>
      ) : (
        <span aria-hidden="true">
          {left.days}d<i>:</i>
          {left.hh}h<i>:</i>
          {left.mm}m
        </span>
      )}
    </span>
  );
}
