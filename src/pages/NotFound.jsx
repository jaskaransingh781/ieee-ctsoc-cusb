import { useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { usePageTitle } from '../lib/hooks';

export default function NotFound() {
  usePageTitle('Page not found');
  const location = useLocation();

  return (
    <section className="container notfound">
      <p className="notfound__code">404</p>
      <h1 className="h1">Page not found</h1>
      <p className="lead">
        Nothing lives at <code>{location.pathname}</code>. The link may be out of date.
      </p>
      <div className="notfound__actions">
        <Button to="/" icon="arrow">
          Go to the home page
        </Button>
        <Button to="/events" variant="secondary">
          Browse events
        </Button>
      </div>
    </section>
  );
}
