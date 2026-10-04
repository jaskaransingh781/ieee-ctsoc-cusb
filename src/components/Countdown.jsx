import { useCountdown } from '../lib/countdown';
import './Countdown.css';

/**
 * Countdown tiles: days, hours, minutes, seconds.
 *   size="lg"       larger numerals (the registration timer)
 *   hideZeroDays    drops the Days tile once less than a day is left
 */
export function CountdownTiles({ target, doneLabel = 'Under way now', size, hideZeroDays = false }) {
  const left = useCountdown(target);
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
          <span className="ctiles__num">{value}</span>
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
