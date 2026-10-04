import { Link } from 'react-router-dom';
import ChapterJoin from '../components/ChapterJoin';
import { ReachButtons } from '../components/Reach';
import { site } from '../data/site';
import { usePageTitle } from '../lib/hooks';
import './Membership.css';

/**
 * The navbar's "Sign up" button lands here: the free chapter registration.
 * It emails the student's answers to the chapter inbox. It does not create
 * an account and never asks for a password.
 */
export default function Signup() {
  usePageTitle('Sign up');

  return (
    <section className="container signup-page theme-chapter" aria-labelledby="join-title">
      <ChapterJoin as="h1" />

      <p className="muted small signup-page__more">
        Looking for IEEE membership itself?{' '}
        <Link to="/membership" className="text-link">
          See membership and pricing
        </Link>
        . Have a question instead?{' '}
        <Link to="/contact" className="text-link">
          Contact the chapter
        </Link>
        .
        {!site.signInEnabled ? ' Member sign-in is not open yet; this form does not create a password or an account.' : ''}
      </p>
      <ReachButtons size="sm" className="signup-page__reach" />
    </section>
  );
}
