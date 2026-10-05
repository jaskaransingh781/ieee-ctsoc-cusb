import { getSocialLinks, site } from '../data/site';
import Button from './Button';
import './Reach.css';

// What each button says. The links themselves come from src/data/site.js;
// a link that is set to null there simply drops out everywhere.
const wording = {
  instagram: 'Follow on Instagram',
  linkedin: 'Follow on LinkedIn',
  whatsapp: 'Join the WhatsApp community',
  youtube: 'Watch on YouTube',
  github: 'See us on GitHub',
  website: 'Visit the website',
};

/**
 * The chapter's channels as a row of buttons: Instagram, LinkedIn and the
 * WhatsApp community. Used wherever the site says "follow", "contact" or
 * "join", so every page offers the same ways to reach the chapter.
 *   size="sm"   smaller buttons, for tight spots
 */
export function ReachButtons({ size, className = '' }) {
  const links = getSocialLinks();
  if (!links.length) return null;

  return (
    <div className={`reach-buttons ${className}`.trim()}>
      {links.map((link) => (
        <Button key={link.key} href={link.url} variant="secondary" size={size} icon="out">
          {wording[link.key] ?? link.label}
        </Button>
      ))}
    </div>
  );
}

/** A slim band for the end of a page: a line of text, then the buttons. */
export default function ReachStrip({ title = 'Stay connected', text }) {
  if (!getSocialLinks().length) return null;

  return (
    <section className="container reach" aria-label="Follow and join the chapter">
      <div className="reach__inner">
        <div className="reach__text">
          <h2 className="reach__title">{title}</h2>
          <p className="muted">{text ?? `News, announcements and event updates from ${site.name}.`}</p>
        </div>
        <div className="reach__actions">
          <ReachButtons size="sm" />
          <Button to="/signup#contact" size="sm" icon="arrow">
            Contact the chapter
          </Button>
        </div>
      </div>
    </section>
  );
}
