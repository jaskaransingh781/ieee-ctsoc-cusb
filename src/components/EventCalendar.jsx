import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { events } from '../data/events';
import {
  buildCalendar,
  entryStatus,
  istDay,
  monthAgenda,
  monthMatrix,
  monthsWithEntries,
  weekBars,
} from '../lib/calendar';
import { useNow } from '../lib/countdown';
import Icon from './Icon';
import './EventCalendar.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const IST = 'Asia/Kolkata';
const ease = [0.22, 1, 0.36, 1];

const monthTitle = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const monthShort = new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const monthOnly = new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'UTC' });
const weekdayLong = new Intl.DateTimeFormat('en-IN', { weekday: 'long', timeZone: 'UTC' });
const todayWeekday = new Intl.DateTimeFormat('en-IN', { weekday: 'long', timeZone: IST });
const todayDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', timeZone: IST });
const yearOnly = new Intl.DateTimeFormat('en-IN', { year: 'numeric', timeZone: IST });
const clock = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: IST,
});

const asDate = (day) => new Date(`${day}T00:00:00Z`);
const monthDate = (month) => asDate(`${month}-01`);
const shift = (month, by) => {
  const [year, index] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, index - 1 + by, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};
const daysBetween = (from, to) => Math.round((asDate(to) - asDate(from)) / 86_400_000);

const statusWords = { upcoming: 'Upcoming', ongoing: 'Ongoing', past: 'Previous' };

/** "in 2 days", "tomorrow", "today", "on now", or nothing once it is over. */
function whenText(entry, status, today) {
  if (status === 'ongoing') return entry.kind === 'deadline' ? 'closes today' : 'on now';
  if (status === 'past') return null;
  const days = daysBetween(today, entry.start);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

/**
 * "Our calendar": a month grid with every dated event drawn on it.
 * Upcoming is burgundy, ongoing is green, previous is slate, and deadlines
 * are coral. Everything is worked out from src/data/events.js and the
 * clock, so it never needs updating by hand.
 */
export default function EventCalendar() {
  const calendar = useMemo(() => buildCalendar(events), []);
  const months = useMemo(() => monthsWithEntries(calendar), [calendar]);
  const now = useNow(1000);
  const today = istDay(now);
  const thisMonth = today.slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [direction, setDirection] = useState(0);

  const [year, monthIndex] = month.split('-').map(Number);
  const weeks = useMemo(() => monthMatrix(year, monthIndex), [year, monthIndex]);
  const agenda = monthAgenda(calendar, month);
  const hasAnything = agenda.dated.length + agenda.undated.length > 0;

  const go = (next) => {
    if (next === month) return;
    setDirection(next > month ? 1 : -1);
    setMonth(next);
  };

  // The strongest thing happening on each day, to tint its cell.
  const dayTone = (day) => {
    let tone = null;
    for (const entry of calendar.entries) {
      if (entry.kind === 'deadline' || day < entry.start || day > entry.end) continue;
      const status = entryStatus(entry, now);
      const value = entry.kind === 'window' ? `${status}-soft` : status;
      if (!tone || !value.endsWith('-soft')) tone = value;
    }
    return tone;
  };

  return (
    <div className="cal">
      <span className="cal__light cal__light--a" aria-hidden="true" />
      <span className="cal__light cal__light--b" aria-hidden="true" />

      {/* ------------------------------------------------ The month grid */}
      <div className="cal__card cal__main">
        <div className="cal__bar-top">
          <h3 className="cal__month" aria-live="polite">
            {monthTitle.format(monthDate(month))}
          </h3>
          <div className="cal__nav">
            {month !== thisMonth ? (
              <button type="button" className="cal__today-btn" onClick={() => go(thisMonth)}>
                Today
              </button>
            ) : null}
            <button
              type="button"
              className="cal__arrow"
              onClick={() => go(shift(month, -1))}
              aria-label={`Previous month, ${monthTitle.format(monthDate(shift(month, -1)))}`}
            >
              <Icon name="chevronLeft" />
            </button>
            <button
              type="button"
              className="cal__arrow"
              onClick={() => go(shift(month, 1))}
              aria-label={`Next month, ${monthTitle.format(monthDate(shift(month, 1)))}`}
            >
              <Icon name="chevronRight" />
            </button>
          </div>
        </div>

        <div className="cal__weekdays" aria-hidden="true">
          {WEEKDAYS.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>

        <div className="cal__viewport">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={month}
              className="cal__weeks"
              custom={direction}
              initial={{ opacity: 0, x: direction * 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -28 }}
              transition={{ duration: 0.3, ease }}
            >
              {weeks.map((week) => {
                const { bars, lanes } = weekBars(week, calendar.entries);
                return (
                  <div className="cal__week" key={week[0].iso} style={{ '--rows': Math.max(lanes, 2) + 1 }}>
                    {week.map((day, column) => {
                      const tone = day.inMonth ? dayTone(day.iso) : null;
                      return (
                        <div
                          key={day.iso}
                          style={{ gridColumn: column + 1 }}
                          className={[
                            'cal__day',
                            day.inMonth ? '' : 'is-outside',
                            day.iso === today ? 'is-today' : '',
                            column > 4 ? 'is-weekend' : '',
                            tone ? `cal__day--${tone}` : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <time dateTime={day.iso} className="cal__num">
                            {day.day}
                          </time>
                          {day.iso === today ? <span className="visually-hidden"> (today)</span> : null}
                        </div>
                      );
                    })}

                    {bars.map((bar) => {
                      const status = entryStatus(bar.entry, now);
                      const kind = bar.entry.kind;
                      return (
                        <Link
                          key={bar.entry.id}
                          to={bar.entry.to}
                          className={[
                            'cal__bar',
                            `cal__bar--${kind}`,
                            `cal__bar--${status}`,
                            bar.startsHere ? 'starts' : '',
                            bar.endsHere ? 'ends' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          style={{ gridColumn: `${bar.column + 1} / span ${bar.span}`, gridRow: bar.lane + 2 }}
                          title={bar.entry.title}
                          aria-label={`${bar.entry.title}, ${kind === 'deadline' ? 'deadline' : statusWords[status].toLowerCase()}`}
                        >
                          {status === 'ongoing' && kind === 'event' ? <span className="cal__pulse" /> : null}
                          <span className="cal__bar-text">{bar.entry.short}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <ul className="cal__legend" aria-label="What the colours mean">
          <li>
            <span className="cal__key cal__key--upcoming" />
            Upcoming
          </li>
          <li>
            <span className="cal__key cal__key--ongoing" />
            Ongoing
          </li>
          <li>
            <span className="cal__key cal__key--past" />
            Previous
          </li>
          <li>
            <span className="cal__key cal__key--deadline" />
            Deadline
          </li>
          <li>
            <span className="cal__key cal__key--today" />
            Today
          </li>
        </ul>
      </div>

      {/* ------------------------------------------------- Clock and list */}
      <div className="cal__side">
        <div className="cal__card cal__clock" aria-label="Current date and time in India">
          <p className="cal__clock-label">
            <span className="cal__clock-dot" aria-hidden="true" />
            Today
          </p>
          <p className="cal__clock-day">
            {todayWeekday.format(new Date(now))}, {todayDate.format(new Date(now))}
          </p>
          <p className="cal__clock-time">
            <span>{clock.format(new Date(now))}</span> IST · {yearOnly.format(new Date(now))}
          </p>
        </div>

        <div className="cal__card cal__agenda">
          <h3 className="cal__agenda-title">In {monthTitle.format(monthDate(month))}</h3>

          {hasAnything ? (
            <ul className="cal__list">
              {agenda.dated.map((entry) => {
                const status = entryStatus(entry, now);
                const when = whenText(entry, status, today);
                const windowEntry = agenda.windows.find((item) => item.id === `${entry.id}-window`);
                const lastDay = windowEntry ? windowEntry.end : entry.end;
                const tone = entry.kind === 'deadline' ? (status === 'past' ? 'past' : 'deadline') : status;
                return (
                  <li key={entry.id}>
                    <Link to={entry.to} className={`cal__item cal__item--${tone}`}>
                      <span className="cal__date">
                        <strong>{Number(entry.start.slice(8))}</strong>
                        <span>{monthOnly.format(asDate(entry.start))}</span>
                      </span>
                      <span className="cal__item-text">
                        <span className="cal__item-title">{entry.title}</span>
                        <span className="cal__item-meta">
                          {weekdayLong.format(asDate(entry.start))}
                          {lastDay !== entry.start
                            ? ` to ${Number(lastDay.slice(8))} ${monthOnly.format(asDate(lastDay))}`
                            : ''}
                          {when ? ` · ${when}` : ''}
                        </span>
                      </span>
                      <span className={`cal__tag cal__tag--${tone}`}>
                        {status === 'ongoing' && entry.kind !== 'deadline' ? <span className="cal__pulse" /> : null}
                        {entry.kind === 'deadline' ? (status === 'past' ? 'Closed' : 'Deadline') : statusWords[status]}
                      </span>
                    </Link>
                  </li>
                );
              })}

              {agenda.undated.map((item) => (
                <li key={item.id}>
                  <Link to={item.to} className="cal__item cal__item--past">
                    <span className="cal__date cal__date--month">
                      <Icon name="calendar" />
                    </span>
                    <span className="cal__item-text">
                      <span className="cal__item-title">{item.title}</span>
                      <span className="cal__item-meta">{item.dateLabel} · exact days not recorded</span>
                    </span>
                    <span className="cal__tag cal__tag--past">Previous</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cal__empty">Nothing on the calendar this month.</p>
          )}

          {months.length ? (
            <div className="cal__jump">
              <p>Months with events</p>
              <div className="cal__chips">
                {months
                  .slice()
                  .reverse()
                  .map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`cal__chip ${value === month ? 'is-on' : ''}`}
                      aria-pressed={value === month}
                      onClick={() => go(value)}
                    >
                      {monthShort.format(monthDate(value))}
                    </button>
                  ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
