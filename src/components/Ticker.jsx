import './Ticker.css';

const tags = { upcoming: 'Upcoming', ongoing: 'Live now' };

/**
 * The events bar: a slow strip that loops sideways. Upcoming events are
 * burgundy, events happening now are green with a pulsing dot, and past
 * events stay plain. It pauses on hover and stands still for visitors who
 * prefer reduced motion.
 *   items: [{ key, title, detail, status }]
 */
export default function Ticker({ items = [], label }) {
  if (!items.length) return null;

  // Repeat the list so the strip is always wider than the screen, then
  // duplicate that once more so the loop has no visible seam.
  const repeats = Math.max(2, Math.ceil(12 / items.length));
  const run = Array.from({ length: repeats }, () => items).flat();

  return (
    <div className="ticker" role="region" aria-label={label}>
      <ul className="visually-hidden">
        {items.map((item) => (
          <li key={item.key}>
            {tags[item.status] ? `${tags[item.status]}: ` : ''}
            {item.detail ? `${item.title}, ${item.detail}` : item.title}
          </li>
        ))}
      </ul>
      <div className="ticker__track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <div className="ticker__run" key={copy}>
            {run.map((item, index) => (
              <span
                className={`ticker__item ${tags[item.status] ? `ticker__item--${item.status}` : ''}`}
                key={`${copy}-${index}`}
              >
                <span className="ticker__node" />
                {tags[item.status] ? <span className="ticker__tag">{tags[item.status]}</span> : null}
                <span className="ticker__title">{item.title}</span>
                {item.detail ? <span className="ticker__detail">{item.detail}</span> : null}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
