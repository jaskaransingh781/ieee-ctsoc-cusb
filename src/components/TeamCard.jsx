import { useState } from 'react';
import { team } from '../data/team';
import { resolveImage } from '../lib/assets';
import { ExternalLink } from './Button';
import Icon from './Icon';
import './TeamCard.css';

// Band colours for the lead cards, in rotation.
const TONES = ['blue', 'cyan', 'navy'];

/** "01", "02", ... from the person's place in src/data/team.js. */
function numberOf(member) {
  const place = team.findIndex((person) => person.id === member.id);
  return place < 0 ? null : String(place + 1).padStart(2, '0');
}

/** First and last initials; a single name uses its first two letters. */
function lettersOf(name) {
  const words = name.trim().split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0].slice(0, 2)).toUpperCase();
}

/**
 * The person's photograph, or their initials until one is added.
 * No generated face or avatar character is ever substituted.
 */
function Portrait({ member, className }) {
  const [failed, setFailed] = useState(false);
  const photo = resolveImage(member.image);

  if (photo && !failed) {
    return (
      <span className={`${className} ${className}--photo`}>
        <img
          src={photo}
          alt={`Portrait of ${member.name}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className={className} aria-hidden="true">
      <span className="tinitials">{member.name ? lettersOf(member.name) : ''}</span>
    </span>
  );
}

/** LinkedIn and Instagram buttons. Renders nothing when neither is set. */
function ProfileLinks({ member, className }) {
  const links = [
    member.linkedin && { label: 'LinkedIn', url: member.linkedin },
    member.instagram && { label: 'Instagram', url: member.instagram },
  ].filter(Boolean);

  if (!links.length) return null;

  return (
    <p className={`tlinks ${className ?? ''}`.trim()}>
      {links.map((link) => (
        <ExternalLink
          key={link.label}
          href={link.url}
          className="tlink"
          aria-label={`${member.name} on ${link.label} (opens in a new tab)`}
        >
          {link.label}
          <Icon name="out" />
        </ExternalLink>
      ))}
    </p>
  );
}

/** Large card for the people marked `featured: true` in team.js. */
export function TeamFeature({ member }) {
  return (
    <article className="tfeature">
      <div className="tfeature__art">
        <svg viewBox="0 0 200 250" preserveAspectRatio="xMaxYMin slice" aria-hidden="true" focusable="false">
          <path d="M200 40h-50l-18 18H86" />
          <path d="M200 82h-32l-16 16h-40" />
          <path d="M200 132h-20l-12-12" />
          <circle cx="80" cy="58" r="4.500" />
          <circle cx="106" cy="98" r="4.500" />
        </svg>
        <Portrait member={member} className="tfeature__portrait" />
      </div>

      <div className="tfeature__body">
        <span className="tfeature__number" aria-hidden="true">
          {numberOf(member)}
        </span>
        {member.role ? (
          <p className="tfeature__role">
            <span className="tfeature__dot" aria-hidden="true" />
            {member.role}
          </p>
        ) : null}
        <h3 className="tfeature__name">{member.name}</h3>
        {member.bio ? <p className="tfeature__bio">{member.bio}</p> : null}
        <ProfileLinks member={member} className="tlinks--solid" />
      </div>
    </article>
  );
}

/** Profile card for a team lead. */
export default function TeamCard({ member }) {
  const place = team.findIndex((person) => person.id === member.id);
  const tone = TONES[Math.max(place, 0) % TONES.length];

  return (
    <article className={`tcard tcard--${tone}`}>
      <div className="tcard__band">
        <svg viewBox="0 0 240 80" preserveAspectRatio="xMaxYMin slice" aria-hidden="true" focusable="false">
          <path d="M240 46h-40l-11 11h-52" />
          <path d="M240 69h-68" />
          <circle cx="133" cy="57" r="3.500" />
          <circle cx="168" cy="69" r="3.500" />
        </svg>
        <span className="tcard__number" aria-hidden="true">
          {numberOf(member)}
        </span>
        <ProfileLinks member={member} className="tcard__links" />
      </div>

      <Portrait member={member} className="tcard__avatar" />

      <div className="tcard__body">
        <h3 className="tcard__name">{member.name ?? 'To be announced'}</h3>
        {member.role ? <p className="tcard__role">{member.role}</p> : null}
        {member.bio ? <p className="tcard__bio">{member.bio}</p> : null}
      </div>
    </article>
  );
}

/** Compact name-and-role row, used for the roster on the home page. */
export function TeamMini({ member }) {
  return (
    <li className="tmini">
      <Portrait member={member} className="tmini__avatar" />
      <span className="tmini__text">
        <span className="tmini__name">{member.name}</span>
        {member.role ? <span className="tmini__role">{member.role}</span> : null}
      </span>
    </li>
  );
}
