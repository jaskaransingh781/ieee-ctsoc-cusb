import { useState } from 'react';
import { eventTypes } from '../data/events';
import { resolveImage } from '../lib/assets';
import { initials } from '../lib/format';
import './EventVisual.css';

/**
 * The picture for an event.
 *  - If the event has a poster that loads, it is shown.
 *  - If there is no poster (or it fails to load), a typographic visual is
 *    drawn from the event's own name and category colour. No stock or
 *    generated imagery is ever substituted.
 */
export default function EventVisual({ event, variant = 'card', eager = false, sizes }) {
  const [failed, setFailed] = useState(false);
  const src = resolveImage(event.poster);
  const small = resolveImage(event.posterSmall);
  const wide = event.posterShape === 'wide';
  const tone = event.visualTheme ?? eventTypes[event.type]?.tone ?? 'blue';

  if (src && !failed) {
    return (
      <div className={`visual visual--image visual--${variant} ${wide ? 'visual--wide' : ''}`}>
        <img
          src={src}
          srcSet={small ? `${small} 1200w, ${src} 2400w` : undefined}
          sizes={small ? (sizes ?? '(max-width: 1240px) 100vw, 1200px') : undefined}
          alt={event.posterAlt ?? `${event.title} poster`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`visual visual--type visual--${variant} visual--tone-${tone}`} aria-hidden="true">
      <svg className="visual__trace" viewBox="0 0 400 250" preserveAspectRatio="xMaxYMin slice">
        <path d="M400 46H318l-26 26H214" />
        <path d="M400 92h-52l-22 22h-58" />
        <path d="M400 150h-34l-18-18" />
        <circle cx="208" cy="72" r="6" />
        <circle cx="262" cy="114" r="6" />
        <circle className="visual__dot" cx="344" cy="128" r="4" />
      </svg>
      <span className="visual__initials">{initials(event.title)}</span>
    </div>
  );
}
