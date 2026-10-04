import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRegistrationState, hasDetails } from '../data/events';
import Button from './Button';
import { EventMeta, StatusChip, TypeChip } from './EventBits';
import EventVisual from './EventVisual';
import Icon from './Icon';
import './EventCard.css';

const ease = [0.22, 1, 0.36, 1];

/**
 * A single event in a grid. When the event has a details page, the whole
 * card links to /events/<slug>; otherwise it is a plain, unlinked card.
 * `wide` lays the card out across the full row and is used for the
 * featured event, whose banner artwork is 3:1.
 */
const EventCard = forwardRef(function EventCard({ event, wide = false, animated = true }, ref) {
  const href = `/events/${event.slug}`;
  const linked = hasDetails(event);
  const canRegister = wide && getRegistrationState(event) === 'open';
  const Tag = animated ? motion.article : 'article';
  const motionProps = animated
    ? {
        layout: true,
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.98 },
        transition: { duration: 0.38, ease },
      }
    : {};

  return (
    <Tag
      ref={ref}
      className={`ecard ${wide ? 'ecard--wide' : ''} ${linked ? 'ecard--linked' : ''}`}
      {...motionProps}
    >
      <div className="ecard__media">
        <EventVisual event={event} sizes={wide ? undefined : '(max-width: 700px) 100vw, 400px'} />
      </div>

      <div className="ecard__body">
        <div className="ecard__chips">
          <TypeChip event={event} />
          <StatusChip event={event} />
        </div>

        <h3 className="ecard__title">{event.title}</h3>
        <p className="ecard__desc">{event.shortDescription}</p>

        <EventMeta event={event} />

        {linked || canRegister ? (
          <div className="ecard__foot">
            {linked ? (
              <Link to={href} className="more-link ecard__link" aria-label={`View details: ${event.title}`}>
                View details
                <Icon name="arrow" />
              </Link>
            ) : null}
            {canRegister ? (
              <Button href={event.registrationUrl} size="sm" icon="out" className="ecard__register">
                {event.registrationLabel ?? 'Register'}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Tag>
  );
});

export default EventCard;
