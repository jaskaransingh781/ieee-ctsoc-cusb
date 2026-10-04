import Button from '../components/Button';
import { ReachButtons } from '../components/Reach';
import Reveal from '../components/Reveal';
import TeamCard, { TeamFeature } from '../components/TeamCard';
import { site } from '../data/site';
import { getFeaturedTeam, getTeamLeads, hasNamedTeam } from '../data/team';
import { usePageTitle } from '../lib/hooks';

export default function Team() {
  usePageTitle('Team');
  const leadership = getFeaturedTeam();
  const leads = getTeamLeads();

  return (
    <>
      <header className="container page-head">
        <h1 className="h1">Team</h1>
        <p className="lead">The students who plan, build and run everything {site.name} does.</p>
      </header>

      <div className="container team-page">
        {!hasNamedTeam ? (
          <p className="notice" role="note">
            The roster for the current team is being finalised. Names, roles and photographs will appear here.
          </p>
        ) : null}

        {leadership.length ? (
          <section className="team-block" aria-labelledby="leadership-title">
            <div className="team-block__head">
              <h2 className="team-block__title" id="leadership-title">
                Leadership
              </h2>
              <span className="team-block__rule" aria-hidden="true" />
              <span className="team-block__count">{String(leadership.length).padStart(2, '0')}</span>
            </div>
            <Reveal className="tfeatures">
              {leadership.map((member) => (
                <TeamFeature key={member.id} member={member} />
              ))}
            </Reveal>
          </section>
        ) : null}

        {leads.length ? (
          <section className="team-block" aria-labelledby="leads-title">
            <div className="team-block__head">
              <h2 className="team-block__title" id="leads-title">
                Team leads
              </h2>
              <span className="team-block__rule" aria-hidden="true" />
              <span className="team-block__count">{String(leads.length).padStart(2, '0')}</span>
            </div>
            <Reveal className="team-grid">
              {leads.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </Reveal>
          </section>
        ) : null}
      </div>

      <section className="container team-join">
        <div className="team-join__inner">
          <div>
            <h2 className="h2">Want to work with the chapter?</h2>
            <p className="muted">Tell us what you would like to help with and we will get back to you.</p>
          </div>
          <div className="team-join__actions">
            <Button to="/contact" icon="arrow">
              Send a query
            </Button>
            <ReachButtons />
          </div>
        </div>
      </section>
    </>
  );
}
