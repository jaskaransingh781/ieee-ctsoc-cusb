import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Icon from './Icon';
import './ZinnovatioWelcome.css';

const WELCOME_KEY = 'ctsoc-zinnovatio-40-welcome-v1';
const ease = [0.22, 1, 0.36, 1];

export default function ZinnovatioWelcome() {
  const [visible, setVisible] = useState(false);
  const primaryBtnRef = useRef(null);
  const reduce = useReducedMotion();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if previously seen in this session
    try {
      if (window.sessionStorage.getItem(WELCOME_KEY)) {
        return;
      }
    } catch {
      // storage disabled fallback
    }

    // Let the main page render first, then introduce the welcome experience
    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 450);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) {
      primaryBtnRef.current?.focus();
      const onKeyDown = (e) => {
        if (e.key === 'Escape') dismiss();
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }
  }, [visible]);

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(WELCOME_KEY, 'seen');
    } catch {
      // storage exception safe
    }
    setVisible(false);
  };

  const handleLetsBuild = () => {
    dismiss();
    const buildSection = document.getElementById('zexp-build');
    if (buildSection) {
      buildSection.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
    }
  };

  const handleExplore = () => {
    dismiss();
    navigate('/events/zinnovatio-4o');
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="zinn-welcome"
          role="dialog"
          aria-modal="true"
          aria-labelledby="zinn-welcome-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduce ? 0.15 : 0.28, ease } }}
          transition={{ duration: reduce ? 0.15 : 0.35, ease }}
        >
          {/* Backdrop with subtle red radial glow */}
          <motion.div
            className="zinn-welcome__backdrop"
            onClick={dismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Liquid-glass capsule expanding smoothly */}
          <motion.div
            className="zinn-welcome__card"
            initial={reduce ? { opacity: 0, scale: 0.98 } : { opacity: 0, scale: 0.88, y: -24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0, scale: 0.98 } : { opacity: 0, scale: 0.92, y: -16 }}
            transition={
              reduce
                ? { duration: 0.2 }
                : { type: 'spring', stiffness: 290, damping: 26, mass: 0.9 }
            }
          >
            {/* Top light sweep and inner glass reflections */}
            <div className="zinn-welcome__light-sweep" aria-hidden="true" />
            <div className="zinn-welcome__glow" aria-hidden="true" />

            <button
              type="button"
              className="zinn-welcome__close"
              onClick={dismiss}
              aria-label="Dismiss welcome overlay"
            >
              <Icon name="close" size={18} />
            </button>

            <div className="zinn-welcome__body">
              <motion.div
                className="zinn-welcome__eyebrow-wrap"
                initial={reduce ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.3 }}
              >
                <span className="zinn-welcome__dot" aria-hidden="true" />
                <span className="zinn-welcome__eyebrow">ARE YOU READY?</span>
              </motion.div>

              <motion.p
                className="zinn-welcome__subhead"
                initial={reduce ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, duration: 0.32 }}
              >
                THE WAIT IS OVER.
              </motion.p>

              <motion.h2
                id="zinn-welcome-title"
                className="zinn-welcome__title"
                initial={reduce ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.36 }}
              >
                ZINNOVATIO 4.0 ARRIVES THIS WEEKEND.
              </motion.h2>

              <motion.div
                className="zinn-welcome__meta-pill"
                initial={reduce ? {} : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.26, duration: 0.3 }}
              >
                <Icon name="calendar" size={14} />
                <span>30–31 OCTOBER 2026 · 36-HOUR NATIONAL-LEVEL HACKATHON</span>
              </motion.div>

              <motion.p
                className="zinn-welcome__copy"
                initial={reduce ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.32 }}
              >
                Two days. One relentless build. Endless possibilities. Get ready to turn ideas into working solutions.
              </motion.p>

              <motion.div
                className="zinn-welcome__actions"
                initial={reduce ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.34 }}
              >
                <button
                  type="button"
                  ref={primaryBtnRef}
                  className="zinn-welcome__btn zinn-welcome__btn--primary"
                  onClick={handleLetsBuild}
                >
                  <span>LET&apos;S BUILD</span>
                  <Icon name="arrow" size={16} />
                </button>
                <button
                  type="button"
                  className="zinn-welcome__btn zinn-welcome__btn--secondary"
                  onClick={handleExplore}
                >
                  <span>EXPLORE THE EVENT</span>
                  <Icon name="out" size={15} />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

