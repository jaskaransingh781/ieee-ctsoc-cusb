import Button, { ExternalLink } from '../components/Button';
import Icon from '../components/Icon';
import { newsletters } from '../data/newsletter';
import { site } from '../data/site';

export function ResourcesContent() {
  const officialLinks = site.otherLinks;

  return (
    <>
      <header className="container page-head">
        <p className="eyebrow">LEARN WITH CTSOC</p>
        <h1 className="h1">Resources</h1>
        <p className="lead">A short list of official society publications and links already shared by the chapter.</p>
      </header>

      <section className="container resources-page" aria-labelledby="resources-reading-title">
        <div className="section-head">
          <div className="section-head__text">
            <h2 className="h2" id="resources-reading-title">From IEEE CTSoc</h2>
            <p className="muted">Read the society’s publications on consumer technology and its community.</p>
          </div>
        </div>
        <div className="resources-grid">
          {newsletters.map((item) => (
            <article className="resource-card" key={item.id}>
              <p className="resource-card__eyebrow">{item.kind}</p>
              <h3 className="h3">{item.name}</h3>
              <p className="muted">{item.text}</p>
              <ExternalLink href={item.url} className="more-link resource-card__link">
                {item.linkLabel}<Icon name="out" />
              </ExternalLink>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tint">
        <div className="container resources-page">
          <div className="section-head">
            <div className="section-head__text">
              <h2 className="h2">Official links</h2>
              <p className="muted">Society, campus and hackathon information from their own sites.</p>
            </div>
          </div>
          <ul className="resource-links">
            {officialLinks.map((item) => (
              <li key={item.url}>
                <ExternalLink href={item.url} className="resource-links__item">
                  <span>{item.label}</span><Icon name="out" />
                </ExternalLink>
              </li>
            ))}
          </ul>
          <p className="resources-note">Chapter workshop notes and downloadable materials will be added here when they are published.</p>
          <Button to="/signup#contact" variant="secondary" icon="arrow">Ask the chapter</Button>
        </div>
      </section>
    </>
  );
}
