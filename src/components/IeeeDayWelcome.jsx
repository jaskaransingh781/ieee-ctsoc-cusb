import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { site } from '../data/site';
import { resolveImage } from '../lib/assets';
import './IeeeDayWelcome.css';

const SESSION_KEY = 'ctsoc-ieee-day-2026-welcome';
const ease = [0.22, 1, 0.36, 1];
const sequence = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: 0.2, staggerChildren: 0.18 } },
};
const reveal = {
  hidden: { opacity: 0, y: 12, filter: 'blur(5px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.48, ease } },
};

function isOfficialIeeeDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return date.year === '2026' && date.month === '10' && date.day === '06';
}

export default function IeeeDayWelcome() {
  const [visible, setVisible] = useState(false);
  const continueRef = useRef(null);
  const shownThisMount = useRef(false);
  const reduce = useReducedMotion();
  const logo = resolveImage(site.mark);

  useEffect(() => {
    if (!isOfficialIeeeDay()) return undefined;
    if (!shownThisMount.current) {
      try {
        if (window.sessionStorage.getItem(SESSION_KEY)) return undefined;
        window.sessionStorage.setItem(SESSION_KEY, 'shown');
      } catch {
        // The app remains mounted across navigation if browser storage is disabled.
      }
      shownThisMount.current = true;
    }

    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 3400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) continueRef.current?.focus();
  }, [visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="ieee-welcome"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ieee-welcome-title"
          onKeyDown={(event) => event.key === 'Escape' && setVisible(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduce ? 0.15 : 0.45, ease } }}
          transition={{ duration: reduce ? 0.15 : 0.35, ease }}
        >
          <span className="ieee-welcome__glow" aria-hidden="true" />
          <svg className="ieee-welcome__circuit" viewBox="0 0 900 500" aria-hidden="true">
            <path d="M0 150h210l42 42h118m530-105H700l-50 50H520M0 355h120l56-56h190m534 95H735l-55-55H560" />
            <circle cx="370" cy="192" r="4" />
            <circle cx="520" cy="95" r="4" />
            <circle cx="366" cy="299" r="4" />
            <circle cx="560" cy="339" r="5" />
          </svg>
          <div className="ieee-welcome__particles" aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
          </div>

          <motion.div
            className="ieee-welcome__content"
            variants={sequence}
            initial={reduce ? false : 'hidden'}
            animate="visible"
            transition={{ duration: reduce ? 0.15 : 0.65, ease }}
          >
            {logo ? <motion.img variants={reveal} className="ieee-welcome__logo" src={logo} alt="IEEE CTSoc CUSB" /> : null}
            <motion.p variants={reveal} className="ieee-welcome__eyebrow">IEEE CTSoc CUSB WISHES YOU</motion.p>
            <motion.h1 variants={reveal} id="ieee-welcome-title">A HAPPY IEEE DAY 2026</motion.h1>
            <motion.p variants={reveal} className="ieee-welcome__message">Celebrating innovation, collaboration &amp; a better tomorrow.</motion.p>
            <motion.p variants={reveal} className="ieee-welcome__date">6 OCTOBER 2026</motion.p>
            <motion.p variants={reveal} className="ieee-welcome__local">Our chapter celebrates on 9 October at Chandigarh University.</motion.p>
          </motion.div>
          <button ref={continueRef} className="ieee-welcome__skip" type="button" onClick={() => setVisible(false)}>
            Continue to the website
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
