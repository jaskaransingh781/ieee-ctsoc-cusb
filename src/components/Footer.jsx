import { Link } from 'react-router-dom';
import { getSocialLinks, site } from '../data/site';
import { resolveImage } from '../lib/assets';
import Button, { ExternalLink } from './Button';
import Icon from './Icon';
import './Footer.css';

export default function Footer() {
  const logo = resolveImage(site.logoOnDark ?? site.logo);
  const socials = getSocialLinks();
  const year = new Date().getFullYear();

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer__line" aria-hidden="true" />
      <svg className="footer__trace" viewBox="0 0 520 300" aria-hidden="true" focusable="false">
        <path d="M520 70H396l-38 38H238" />
        <path d="M520 150h-74l-32 32h-96" />
        <path d="M520 236H424l-36-36h-64" />
        <circle cx="232" cy="108" r="6" />
        <circle cx="312" cy="182" r="6" />
        <circle className="footer__spark" cx="318" cy="200" r="5" />
      </svg>

      <div className="container">
        <div className="footer__lead">
          <div className="footer__brand">
            <Link to="/" aria-label={`${site.name}, home`} className="footer__logo">
              {logo ? (
                <img src={logo} alt={`${site.society}, ${site.branch}`} width="560" height="258" loading="lazy" />
              ) : (
                <span>{site.name}</span>
              )}
            </Link>
            <p className="footer__statement">Consumer technology, built by students.</p>
            <p className="footer__about">{site.tagline}</p>
          </div>

          <div className="footer__actions">
            <Button to="/contact" icon="arrow" className="btn--light">
              Contact the chapter
            </Button>
            {site.navCta ? (
              <Button to={site.navCta.to} className="btn--on-dark">
                {site.navCta.label}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="footer__grid">
          <div>
            <h2 className="footer__title">Find us</h2>
            <ul className="footer__list">
              <li>
                <ExternalLink href={site.location.mapsUrl} className="footer__link footer__link--place">
                  <Icon name="pin" />
                  <span>
                    {site.location.block}, {site.location.campus}
                    <br />
                    {site.location.city}
                  </span>
                </ExternalLink>
              </li>
              <li>
                <a className="footer__link footer__link--place" href={`mailto:${site.email}`}>
                  <Icon name="mail" />
                  <span>{site.email}</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="footer__title">Follow</h2>
            <ul className="footer__pills">
              {socials.map((link) => (
                <li key={link.key}>
                  <ExternalLink href={link.url} className="footer__pill">
                    {link.label}
                    <Icon name="out" />
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="footer__title">Navigate</h2>
            <ul className="footer__list footer__list--cols">
              {site.nav.map((item) => (
                <li key={item.to}>
                  <Link className="footer__link" to={item.to}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="footer__title">Official links</h2>
            <ul className="footer__list">
              {site.otherLinks.map((link) => (
                <li key={link.url}>
                  <ExternalLink href={link.url} className="footer__link footer__link--out">
                    {link.label}
                    <Icon name="out" />
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="footer__wordmark" aria-hidden="true">
        {site.name}
      </p>

      <div className="container">
        <div className="footer__base">
          <p>
            © {year} {site.name}, {site.university}.
          </p>
          <p>
            {site.society}, {site.branch}
          </p>
          <button type="button" className="footer__top" onClick={toTop}>
            Back to top
            <Icon name="arrow" />
          </button>
        </div>
      </div>
    </footer>
  );
}
