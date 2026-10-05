import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Footer from './components/Footer';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import LivePulse from './components/LivePulse';
import IeeeDayWelcome from './components/IeeeDayWelcome';
import { useEventClock, useLiveEvents } from './lib/hooks';
import Home from './pages/Home';

// Every page except Home is loaded on demand, so the first visit stays light.
const About = lazy(() => import('./pages/About'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Journey = lazy(() => import('./pages/Journey'));
const Team = lazy(() => import('./pages/Team'));
const Membership = lazy(() => import('./pages/Membership'));
const Signup = lazy(() => import('./pages/Signup'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteLoader() {
  return (
    <div className="route-pending" role="status" aria-live="polite">
      <div className="route-loader" />
      <span className="visually-hidden">Loading page</span>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  // Keeps event statuses in step with the clock, and redraws the open page
  // when one changes (an event starting or finishing).
  useEventClock();
  useLiveEvents();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <AnnouncementBar />
      <Navbar />
      <LivePulse />
      <IeeeDayWelcome />
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => {
          if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
      >
        <motion.main
          id="main"
          className="page"
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.14 } }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense fallback={<RouteLoader />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:slug" element={<EventDetail />} />
              <Route path="/journey" element={<Journey />} />
              <Route path="/team" element={<Team />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/contact" element={<Navigate to="/signup#contact" replace />} />
              <Route path="/signin" element={<Navigate to="/signup#contact" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}
