import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getEvent } from '../data/events';
import { useCountdown } from '../lib/countdown';
import './IeeeDayTeaser.css';

const ease = [0.22, 1, 0.36, 1];
const reveal = {
  hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
  show: (order) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.48, ease, delay: order * 0.1 },
  }),
};

export default function IeeeDayTeaser() {
  const event = getEvent('ieee-day-2026');
  const countdown = useCountdown(event?.localCelebration?.startsAt);
  const reduce = useReducedMotion();

  if (!event?.localCelebration?.startsAt || !countdown || countdown.done) return null;

  const localDate = new Date(event.localCelebration.startsAt);
  const localDateParts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata',
  }).formatToParts(localDate).map(({ type, value }) => [type, value]));
  const localDateLabel = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
  }).format(localDate);

  const values = [
    ['days', String(countdown.days).padStart(2, '0')],
    ['hours', countdown.hh],
    ['minutes', countdown.mm],
    ['seconds', countdown.ss],
  ];

  return (
    <section
      className="section section--tight ieee-teaser-wrap"
      id="ieee-day-teaser"
      aria-labelledby="ieee-teaser-title"
    >
      <motion.div
        className="container ieee-teaser"
        initial={reduce ? false : 'hidden'}
        whileInView={reduce ? undefined : 'show'}
        viewport={{ once: true, margin: '0px 0px -6% 0px' }}
      >
        <svg className="ieee-teaser__trace" viewBox="0 0 260 180" aria-hidden="true" focusable="false">
          <path className="ieee-teaser__trail" d="M260 28h-58l-24 24h-44" />
          <path d="M260 82h-34l-20 20h-52" />
          <path d="M260 138h-66l-24-24h-38" />
          <circle cx="132" cy="52" r="3" />
          <circle cx="154" cy="102" r="3" />
          <circle className="ieee-teaser__halo" cx="132" cy="114" r="9" />
          <circle className="ieee-teaser__waypoint" cx="132" cy="114" r="4" />
        </svg>

        <div className="ieee-teaser__story">
          <motion.p className="ieee-teaser__eyebrow" custom={0} variants={reveal}>
            <span className="ieee-teaser__dot" aria-hidden="true" />
            Upcoming · Treasure Hunt
          </motion.p>
          <motion.p className="ieee-teaser__date" custom={1} variants={reveal}>
            {localDateParts.day} <span aria-hidden="true">&#8226;</span> {localDateParts.month} <span aria-hidden="true">&#8226;</span> {localDateParts.year}
          </motion.p>
          <motion.h2 id="ieee-teaser-title" className="ieee-teaser__title" custom={2} variants={reveal}>
            IEEE Day 2026
          </motion.h2>
          <motion.p className="ieee-teaser__venue" custom={3} variants={reveal}>
            IEEE Day 2026 Treasure Hunt at {event.localCelebration.venue}.
          </motion.p>
          <motion.p className="ieee-teaser__copy" custom={3} variants={reveal}>
            Follow the clues. Find the trail. The IEEE Day Treasure Hunt begins soon.
          </motion.p>
          <motion.p className="ieee-teaser__hint" custom={4} variants={reveal}>
            Something is waiting on campus.
          </motion.p>
          <motion.p className="ieee-teaser__reveal" custom={5} variants={reveal}>
            The hunt begins soon.
          </motion.p>
          <motion.p className="ieee-teaser__status" custom={6} variants={reveal}>
            Announcing soon
          </motion.p>
        </div>

        <motion.aside
          className="ieee-teaser__countdown"
          aria-label={`Countdown to the IEEE Day campus event on ${localDateLabel}`}
          custom={3}
          variants={reveal}
        >
          <p className="ieee-teaser__count-label">Coming in</p>
          <div
            className="ieee-teaser__tiles"
            role="timer"
            aria-label={`${countdown.days} days, ${Number(countdown.hh)} hours, ${Number(countdown.mm)} minutes, and ${Number(countdown.ss)} seconds`}
          >
            {values.map(([label, value]) => (
              <span className="ieee-teaser__tile" key={label} aria-hidden="true">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.strong
                    key={value}
                    initial={{ opacity: 0, y: 5, filter: 'blur(2px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -5, filter: 'blur(2px)' }}
                    transition={{ duration: reduce ? 0.08 : 0.2, ease }}
                  >
                    {value}
                  </motion.strong>
                </AnimatePresence>
                <small>{label}</small>
              </span>
            ))}
          </div>
        </motion.aside>
      </motion.div>
    </section>
  );
}
