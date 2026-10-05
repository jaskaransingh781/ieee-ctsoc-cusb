import ReachStrip from '../components/Reach';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Reveal from '../components/Reveal';
import { eventTypes, getFeaturedEvent, getUsedTypes, listedEvents as events } from '../data/events';
import { site } from '../data/site';
import { usePageTitle } from '../lib/hooks';

// How the chapter fits into the larger organisation, widest first.
const lineage = [
  {
    name: 'IEEE',
    text: 'The world’s largest technical professional organisation, and the body the chapter belongs to.',
  },
  {
    name: 'Consumer Technology Society',
    text: 'The IEEE society for the technology people live with every day: the devices in homes and pockets, and the software and services around them.',
  },
  {
    name: site.branch,
    text: `Our chapter. Students at ${site.university} who run the society’s activities on campus.`,
  },
  {
    name: `${site.location.block}, ${site.location.campus}`,
    text: `Where to find us, in ${site.location.city}.`,
  },
];

const typeBlurb = {
  hackathon: 'Long-format builds where teams take a problem from idea to working prototype.',
  workshop: 'Guided sessions for picking up a tool or a technique.',
  event: 'Chapter events through the year.',
  competition: 'Contests that test problem solving under time pressure.',
  seminar: 'Talks from people working in the field.',
};

export default function About() {
  usePageTitle('About');
  const flagship = getFeaturedEvent();
  const types = getUsedTypes();

  return (
    <>
      <header className="container page-head">
        <h1 className="h1">A student chapter for the technology people actually use.</h1>
        <p className="lead">
          {site.name} is the {site.society} student branch chapter at {site.university}. We bring students
          together to learn, build and compete.
        </p>
      </header>

      <section className="section section--tight">
        <div className="container split">
          <h2 className="h2">Who we are</h2>
          <Reveal className="prose">
            <p>
              Consumer technology is the part of engineering that ends up in people’s hands: phones, wearables,
              connected homes, the apps and services that run on them. The {site.society} is the part of IEEE
              that focuses on it, and we are its student chapter at {site.university}.
            </p>
            <p>
              The chapter is run by students, for students. We organise events and workshops, and we work with
              other societies and departments on campus on larger ones, such as the Zinnovatio hackathon.
            </p>
            <p>
              You will find us at {site.location.block}, {site.location.campus}, {site.location.city}.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container split">
          <div>
            <h2 className="h2">Where the chapter sits</h2>
            <p className="muted split__note">From the global organisation down to our block on campus.</p>
          </div>
          <Reveal as="ol" className="lineage">
            {lineage.map((step) => (
              <li key={step.name} className="lineage__step">
                <span className="lineage__node" aria-hidden="true" />
                <h3 className="h3">{step.name}</h3>
                <p className="muted">{step.text}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="section-head__text">
              <h2 className="h2">What we run</h2>
              <p className="muted">Everything below links to the events themselves.</p>
            </div>
            <Link to="/events" className="more-link">
              View all events
              <Icon name="arrow" />
            </Link>
          </div>

          <div className="kinds">
            {types.map((type) => {
              const list = events.filter((event) => event.type === type);
              return (
                <Reveal key={type} className="kinds__item">
                  <span className={`chip chip--${eventTypes[type].tone}`}>{list.length}</span>
                  <h3 className="h3">{eventTypes[type].plural}</h3>
                  <p className="muted">{typeBlurb[type]}</p>
                  <ul className="kinds__list">
                    {list.map((event) => (
                      <li key={event.slug}>
                        <Link to={`/events/${event.slug}`} className="text-link">
                          {event.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link to={`/events?type=${type}`} className="more-link">
                    See {eventTypes[type].plural.toLowerCase()}
                    <Icon name="arrow" />
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {flagship ? (
        <section className="section section--tint">
          <div className="container split">
            <div>
              <h2 className="h2">Zinnovatio</h2>
              <p className="muted split__note">The national hackathon we help organise.</p>
            </div>
            <Reveal>
              <div className="prose">
                <p>
                  Zinnovatio is {site.university}’s national hackathon series, hosted by the university and
                  organised by the Department of CSE, Nalanda. IEEE CTSoc is a co-organiser of the fourth
                  edition, {flagship.title}, alongside the IEEE Computer Society student chapter and C-Square.
                </p>
                <p>
                  The series has grown with every edition, and the three earlier ones are part of our{' '}
                  <Link to="/journey" className="text-link">
                    journey
                  </Link>
                  .
                </p>
              </div>

              <div className="about-actions">
                <Button to={`/events/${flagship.slug}`} icon="arrow">
                  About {flagship.title}
                </Button>
                <Button to="/signup#contact" variant="secondary">
                  Contact the chapter
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      <ReachStrip />
    </>
  );
}
