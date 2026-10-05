import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ChapterForm from '../components/ChapterForm';
import { ExternalLink } from '../components/Button';
import Icon from '../components/Icon';
import { ReachButtons } from '../components/Reach';
import { getSocialLinks, site } from '../data/site';
import { usePageTitle } from '../lib/hooks';
import './Signup.css';

export default function Signup() {
  const location = useLocation();
  const socials = getSocialLinks();
  usePageTitle('Sign up');

  useEffect(() => {
    if (location.hash !== '#contact') return undefined;

    let firstFrame = 0;
    let secondFrame = 0;
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const section = document.getElementById('contact');
        if (!section) return;
        section.focus({ preventScroll: true });
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        section.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [location.pathname, location.hash]);

  return (
    <section className="container signup-page" aria-labelledby="signup-title">
      <div className="signup-page__layout">
        <aside className="signup-page__aside">
          <header className="signup-page__head">
            <p className="signup-page__eyebrow">IEEE CTSoc CUSB Chapter</p>
            <h1 className="h1" id="signup-title">Get involved with our chapter</h1>
            <p className="lead">
              Share your student details and interests. Our team will reach out with the next steps.
            </p>
          </header>

          <section className="signup-contact" id="contact" tabIndex={-1} aria-labelledby="signup-contact-title">
            <h2 className="signup-contact__title" id="signup-contact-title">Contact the chapter</h2>
            <dl className="contact__list">
              <div className="contact__item">
                <dt><Icon name="mail" />Email</dt>
                <dd><a className="text-link" href={`mailto:${site.email}`}>{site.email}</a></dd>
              </div>

              {socials.length ? (
                <div className="contact__item">
                  <dt><Icon name="link" />Follow and join</dt>
                  <dd><ReachButtons size="sm" className="contact__reach" /></dd>
                </div>
              ) : null}

              <div className="contact__item">
                <dt><Icon name="pin" />Find us</dt>
                <dd>
                  {site.location.block}, {site.location.campus}<br />
                  {site.location.city}<br />
                  <ExternalLink href={site.location.mapsUrl}>Open in Google Maps</ExternalLink>
                </dd>
              </div>

              {site.otherLinks.length ? (
                <div className="contact__item">
                  <dt><Icon name="out" />Official links</dt>
                  <dd className="contact__links contact__links--stack">
                    {site.otherLinks.map((link) => (
                      <ExternalLink key={link.url} href={link.url}>{link.label}</ExternalLink>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        </aside>

        <div className="signup-page__form">
          <h2 className="visually-hidden">IEEE CTSoc CUSB Chapter interest form</h2>
          <ChapterForm />
        </div>
      </div>

      <p className="signup-page__membership-note muted small">
        Looking for IEEE membership itself?{' '}
        <Link to="/membership" className="text-link">See IEEE membership information</Link>.
      </p>
    </section>
  );
}
