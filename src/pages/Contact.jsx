import { ExternalLink } from '../components/Button';
import ContactForm from '../components/ContactForm';
import Icon from '../components/Icon';
import { ReachButtons } from '../components/Reach';
import { getSocialLinks, site } from '../data/site';
import { usePageTitle } from '../lib/hooks';

export default function Contact() {
  usePageTitle('Contact');
  const socials = getSocialLinks();

  return (
    <>
      <header className="container page-head">
        <h1 className="h1">Contact</h1>
        <p className="lead">
          Questions about an event, an idea for a session, or a collaboration: send a query and it goes straight
          to the chapter’s inbox.
        </p>
      </header>

      <section className="container contact">
        <div className="contact__info">
          <dl className="contact__list">
            <div className="contact__item">
              <dt>
                <Icon name="mail" />
                Email
              </dt>
              <dd>
                <a className="text-link" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </dd>
            </div>

            {socials.length ? (
              <div className="contact__item">
                <dt>
                  <Icon name="link" />
                  Follow and join
                </dt>
                <dd>
                  <ReachButtons size="sm" className="contact__reach" />
                </dd>
              </div>
            ) : null}

            <div className="contact__item">
              <dt>
                <Icon name="pin" />
                Find us
              </dt>
              <dd>
                {site.location.block}, {site.location.campus}
                <br />
                {site.location.city}
                <br />
                <ExternalLink href={site.location.mapsUrl}>Open in Google Maps</ExternalLink>
              </dd>
            </div>

            {site.otherLinks.length ? (
              <div className="contact__item">
                <dt>
                  <Icon name="out" />
                  Official links
                </dt>
                <dd className="contact__links contact__links--stack">
                  {site.otherLinks.map((link) => (
                    <ExternalLink key={link.url} href={link.url}>
                      {link.label}
                    </ExternalLink>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="contact__form">
          <h2 className="visually-hidden">Send a query</h2>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
