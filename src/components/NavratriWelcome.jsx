import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Rangoli from './Rangoli';
import './NavratriWelcome.css';

const SESSION_KEY = 'ctsoc-navratri-welcome-dismissed-v1';

function wasDismissed() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function NavratriWelcome({ active }) {
  const [visible, setVisible] = useState(() => active && !wasDismissed());
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (active && !wasDismissed()) setVisible(true);
  }, [active]);

  useEffect(() => {
    if (!visible) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [visible]);

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // Keep this mounted app instance dismissed even when storage is unavailable.
    }
    setVisible(false);
  };

  return createPortal(
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="navratri-welcome"
          role="dialog"
          aria-modal="true"
          aria-labelledby="navratri-welcome-title"
          aria-describedby="navratri-welcome-message"
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="navratri-welcome__backdrop" aria-hidden="true" />
          <motion.section
            className="navratri-welcome__card"
            initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              ref={closeRef}
              className="navratri-welcome__close"
              type="button"
              onClick={dismiss}
              aria-label="Close Navratri greeting"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
            <span className="navratri-welcome__light navratri-welcome__light--one" aria-hidden="true" />
            <span className="navratri-welcome__light navratri-welcome__light--two" aria-hidden="true" />
            <span className="navratri-welcome__spark navratri-welcome__spark--one" aria-hidden="true" />
            <span className="navratri-welcome__spark navratri-welcome__spark--two" aria-hidden="true" />
            <Rangoli className="navratri-welcome__rangoli" />

            <div className="navratri-welcome__content">
              <p className="navratri-welcome__eyebrow"><span /> FESTIVE SPECIAL <span /></p>
              <h1 id="navratri-welcome-title">HAPPY NAVRATRI</h1>
              <p className="navratri-welcome__hindi" lang="hi">शुभ नवरात्रि</p>
              <p className="navratri-welcome__message" id="navratri-welcome-message">
                May these nine sacred nights bring strength, wisdom, happiness and new beginnings.
              </p>
              <p className="navratri-welcome__date">11–19 OCTOBER 2026</p>
              <div className="navratri-welcome__diya" aria-hidden="true">
                <span className="navratri-welcome__flame" />
                <span className="navratri-welcome__wick" />
                <span className="navratri-welcome__bowl" />
                <span className="navratri-welcome__base" />
              </div>
              <Link className="navratri-welcome__cta" to="/#calendar-title" onClick={dismiss}>
                CELEBRATE WITH CTSoc <span aria-hidden="true">→</span>
              </Link>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
