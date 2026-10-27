import { Link } from 'react-router-dom';
import { getFeaturedEvent, getRegistrationState } from '../data/events';
import { useNow } from '../lib/countdown';
import Icon from './Icon';
import './AnnouncementBar.css';

export default function AnnouncementBar() {
  const event = getFeaturedEvent();
  const now = useNow(1000);
  if (!event || event.slug !== 'zinnovatio-4o') return null;

  const start = new Date(event.startsAt ?? `${event.date}T00:00:00+05:30`).getTime();
  const end = event.endsAt ? new Date(event.endsAt).getTime() : start + 36 * 60 * 60 * 1000;
  const registration = getRegistrationState(event, now);
  const remaining = Math.max(0, start - now);
  const countdown = [
    `${Math.floor(remaining / 86_400_000)}d`,
    `${String(Math.floor(remaining / 3_600_000) % 24).padStart(2, '0')}h`,
    `${String(Math.floor(remaining / 60_000) % 60).padStart(2, '0')}m`,
    `${String(Math.floor(remaining / 1000) % 60).padStart(2, '0')}s`,
  ].join(' ');
  const message = now < start
    ? 'ZINNOVATIO 4.0 ARRIVES THIS WEEKEND'
    : now < end
      ? 'ZINNOVATIO 4.0 · CHECK-IN / EVENT LIVE'
      : 'ZINNOVATIO 4.0 · EVENT COMPLETE';
  const announcementLabel = now < start
    ? `Zinnovatio 4.0 begins in ${countdown}. 30 to 31 October 2026.`
    : message;

  return (
    <Link className="announcement" to={`/events/${event.slug}`} aria-label={announcementLabel}>
      <span className="announcement__category">UPCOMING EVENT</span>
      <span className="announcement__message">
        <strong className="announcement__extended">{message}</strong>
        <span className="announcement__details">30–31 OCTOBER 2026 <i aria-hidden="true">|</i> 36-HOUR NATIONAL-LEVEL HACKATHON</span>
      </span>
      {now < start ? (
        <span className="announcement__countdown" aria-live="off" aria-label={`Time remaining: ${countdown}`}>
          {countdown}
        </span>
      ) : null}
      <span className="announcement__cta">
        {registration === 'open' ? 'Event details & registration' : 'Explore event'}
        <Icon name="arrow" />
      </span>
      <span className="announcement__light" aria-hidden="true" />
    </Link>
  );
}
