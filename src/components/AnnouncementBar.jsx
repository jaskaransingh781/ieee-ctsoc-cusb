import { getFeaturedEvent } from '../data/events';
import Icon from './Icon';
import './AnnouncementBar.css';

export default function AnnouncementBar() {
  const event = getFeaturedEvent();
  if (!event?.registrationUrl) return null;
  const deadlineDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
  }).format(new Date(event.registrationCloses));

  return (
    <a className="announcement" href={event.registrationUrl}>
      <span className="announcement__message">
        <span className="announcement__rocket" aria-hidden="true">&#x1F680;</span>
        <span>Zinnovatio 4.0</span>
        <strong className="announcement__extended">REGISTRATION DEADLINE EXTENDED BY 2 DAYS</strong>
        <span className="announcement__deadline">{'\u2014'} New deadline: <strong>{deadlineDate}</strong>, 11:59 PM IST</span>
      </span>
      <span className="announcement__cta">Register now <Icon name="arrow" /></span>
    </a>
  );
}
