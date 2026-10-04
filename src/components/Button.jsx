import { Link } from 'react-router-dom';
import Icon from './Icon';

const isExternal = (href = '') => /^https?:\/\//.test(href);

/**
 * One button for the whole site.
 *   <Button to="/events">            internal route
 *   <Button href="https://...">      external link (opens in a new tab)
 *   <Button onClick={...}>           plain button
 */
export default function Button({
  to,
  href,
  variant = 'primary',
  size,
  block = false,
  icon,
  children,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    variant === 'secondary' && 'btn--secondary',
    size === 'sm' && 'btn--sm',
    block && 'btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span>{children}</span>
      {icon ? <Icon name={icon} /> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    const external = isExternal(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {content}
        {external ? <span className="visually-hidden"> (opens in a new tab)</span> : null}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}

/** Inline external link that always opens safely in a new tab. */
export function ExternalLink({ href, children, className = 'text-link', ...rest }) {
  if (!href) return null;
  const external = isExternal(href);
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
      {external ? <span className="visually-hidden"> (opens in a new tab)</span> : null}
    </a>
  );
}
