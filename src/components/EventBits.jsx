import { eventTypes, getRegistrationState, statusLabels } from '../data/events';
import { formatEventDate } from '../lib/format';
import Icon from './Icon';

export function TypeChip({ event }) {
  const type = eventTypes[event.type];
  if (!type) return null;
  return <span className={`chip chip--${type.tone}`}>{type.label}</span>;
}

export function StatusChip({ event }) {
  if (event.status === 'ongoing') {
    return (
      <span className="chip chip--live">
        <span className="chip__dot" />
        {statusLabels.ongoing}
      </span>
    );
  }
  if (event.status === 'upcoming' && event.registrationOpen) {
    const registration = getRegistrationState(event);
    if (registration === 'open') {
      return (
        <span className="chip chip--live">
          <span className="chip__dot" />
          Registration open
        </span>
      );
    }
    if (registration === 'closed') return <span className="chip">Registration closed</span>;
  }
  return (
    <span className={`chip ${event.status === 'upcoming' ? 'chip--upcoming' : ''}`}>
      {statusLabels[event.status] ?? event.status}
    </span>
  );
}

/**
 * Date and venue lines used on cards. Upcoming events say "to be announced"
 * for anything missing; past events simply leave the line out.
 */
export function EventMeta({ event, className = '' }) {
  const past = event.status === 'past';
  const hasDate = Boolean(event.date || event.dateLabel);
  const rows = [
    (hasDate || !past) && { icon: 'calendar', label: 'Date', value: formatEventDate(event) },
    (event.venue || !past) && { icon: 'pin', label: 'Venue', value: event.venue ?? 'Venue to be announced' },
  ].filter(Boolean);

  if (!rows.length) return null;

  return (
    <dl className={`emeta ${className}`.trim()}>
      {rows.map((row) => (
        <div className="emeta__row" key={row.label}>
          <dt>
            <Icon name={row.icon} />
            <span className="visually-hidden">{row.label}</span>
          </dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
