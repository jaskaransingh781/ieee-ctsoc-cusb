import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/** Counts from zero to `value` the first time it scrolls into view. */
export default function CountUp({ value, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setShown(value);
      return undefined;
    }
    if (!inView) return undefined;
    const controls = animate(0, value, {
      duration: 1.3,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setShown(Math.round(latest)),
      onComplete: () => setShown(value),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref}>
      {/* Screen readers get the final figure, not the animation frames. */}
      <span className="visually-hidden">
        {prefix}
        {value.toLocaleString('en-IN')}
        {suffix}
      </span>
      <span aria-hidden="true">
        {prefix}
        {shown.toLocaleString('en-IN')}
        {suffix}
      </span>
    </span>
  );
}
