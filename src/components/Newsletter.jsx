import { newsletterCopy as copy, newsletters } from '../data/newsletter';
import { useLiveNewsletter } from '../lib/newsletter';
import { ExternalLink } from './Button';
import Icon from './Icon';
import Reveal from './Reveal';
import './Newsletter.css';

/**
 * "From IEEE CTSoc": the society's newsletters. The latest monthly issues
 * are found by the site's server and listed here without anyone updating
 * the site. If they cannot be checked, the two official pages are shown on
 * their own and nothing is made up.
 */
export default function Newsletter() {
  const { state, latest, earlier, checked } = useLiveNewsletter();

  return (
    <section className="section" aria-labelledby="news-title">
      <div className="container">
        <div className="section-head">
          <div className="section-head__text">
            <h2 id="news-title" className="h2">
              {copy.title}
            </h2>
            <p className="muted">{copy.text}</p>
          </div>
          <p className={`news__status news__status--${state}`} role="status">
            <span className="news__status-dot" aria-hidden="true" />
            {state === 'live' ? `Checked ${checked}` : null}
            {state === 'loading' ? 'Looking for the latest issues' : null}
            {state === 'offline' ? 'Latest issues could not be checked just now' : null}
          </p>
        </div>

        <Reveal className={`news ${latest ? 'news--live' : ''}`}>
          {latest ? (
            <div className="news__latest">
              <span className="news__glow" aria-hidden="true" />
              <p className="news__tag">
                <span className="news__tag-dot" aria-hidden="true" />
                Latest issue
              </p>
              <p className="news__name">{copy.issueName}</p>
              <p className="news__month">{latest.label}</p>
              <ExternalLink href={latest.url} className="btn btn--light news__open">
                <span>Read the {latest.label} issue</span>
                <Icon name="out" />
              </ExternalLink>

              {earlier.length ? (
                <div className="news__earlier">
                  <p>Earlier issues</p>
                  <ul>
                    {earlier.map((issue) => (
                      <li key={issue.month}>
                        <ExternalLink
                          href={issue.url}
                          className="news__chip"
                          aria-label={`${copy.issueName}, ${issue.label} (PDF, opens in a new tab)`}
                        >
                          {issue.short}
                        </ExternalLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          <ul className="news__pubs">
            {newsletters.map((item) => (
              <li className="news__pub" key={item.id}>
                <span className="news__icon">
                  <Icon name={item.id === 'world' ? 'mail' : 'book'} />
                </span>
                <div>
                  <p className="news__kind">{item.kind}</p>
                  <h3 className="news__pub-name">{item.name}</h3>
                  <p className="muted">{item.text}</p>
                  <ExternalLink href={item.url} className="more-link news__link">
                    {item.linkLabel}
                    <Icon name="out" />
                  </ExternalLink>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
