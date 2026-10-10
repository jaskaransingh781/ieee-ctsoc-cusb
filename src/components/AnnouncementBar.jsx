import { getFeaturedEvent, getRegistrationState } from '../data/events';
import { useNow } from '../lib/countdown';
import Icon from './Icon';
import './AnnouncementBar.css';

export default function AnnouncementBar() {
  const event = getFeaturedEvent();
  const now = useNow(60_000);
  if (!event?.registrationUrl || getRegistrationState(event, now) !== 'open') return null;
  const deadlineDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
  }).format(new Date(event.registrationCloses));

  return (
    <a className="announcement" href={event.registrationUrl} aria-label={`${event.title} event update: registration closes ${deadlineDate} at 11:59 PM India time. Register now.`}>
      <span className="announcement__category">EVENT UPDATE</span>
      <span className="announcement__message">
        <strong className="announcement__extended">Registration deadline extended</strong>
        <span className="announcement__deadline">{event.title.replace('4.O', '4.0')} · Closes <time dateTime={event.registrationCloses}>{deadlineDate}, 11:59 PM IST</time></span>
      </span>
      <span className="announcement__cta">Register now <Icon name="arrow" /></span>
    </a>
  );
}
