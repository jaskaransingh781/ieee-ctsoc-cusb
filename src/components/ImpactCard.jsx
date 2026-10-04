import { site } from '../data/site';
import { getImpactStats } from '../lib/impact';
import CountUp from './CountUp';
import Icon from './Icon';
import Reveal from './Reveal';
import './ImpactCard.css';

/**
 * The impact strip under the hero: a short statement on the left and the
 * headline figures on the right. Wording and numbers come from
 * `impact` in src/data/site.js.
 */
export default function ImpactCard() {
  const stats = getImpactStats();
  const { title, text, note } = site.impact;

  return (
    <section className="section section--tight" aria-labelledby="impact-title">
      <div className="container">
        <Reveal className="impact">
          <div className="impact__intro">
            <h2 id="impact-title" className="impact__title">
              {title}
            </h2>
            <p className="impact__text">{text}</p>
          </div>

          <dl className="impact__stats" style={{ '--count': stats.length }}>
            {stats.map((stat) => (
              <div className="impact__stat" key={stat.label}>
                <dt className="impact__label">
                  <Icon name={stat.icon} />
                  {stat.label}
                </dt>
                <dd className="impact__value">
                  <CountUp value={stat.value} />
                  {stat.plus ? (
                    <span className="impact__plus" aria-hidden="true">
                      +
                    </span>
                  ) : null}
                  {stat.plus ? <span className="visually-hidden"> or more</span> : null}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
        {note ? <p className="impact__note small muted">{note}</p> : null}
      </div>
    </section>
  );
}
