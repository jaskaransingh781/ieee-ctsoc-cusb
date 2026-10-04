import { useEffect } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import './HeroField.css';

// Circuit traces that run in from the page edges and end in a terminal,
// echoing the traces in the IEEE CTSoc mark. They draw once on load.
const left = [
  { d: 'M0 130H170l40 40h130', node: [346, 170], tone: 'blue', delay: 0.25 },
  { d: 'M0 300H70l34-34h70', node: [180, 266], tone: 'line', delay: 0.4 },
  { d: 'M0 450H110l36 36h50', node: [202, 486], tone: 'line', delay: 0.55 },
  { d: 'M0 640H190l42-42h120', node: [358, 598], tone: 'cyan', delay: 0.7 },
];

const right = [
  { d: 'M420 110H260l-40 40H100', node: [94, 150], tone: 'line', delay: 0.3 },
  { d: 'M420 280h-62l-34 34h-64', node: [254, 314], tone: 'blue', delay: 0.45 },
  { d: 'M420 430H320l-36-36h-40', node: [238, 394], tone: 'coral', delay: 0.6 },
  { d: 'M420 630H280l-44-44H106', node: [100, 586], tone: 'line', delay: 0.75 },
];

const dots = {
  left: [
    [96, 372],
    [114, 372],
    [132, 372],
  ],
  right: [
    [288, 208],
    [306, 208],
    [324, 208],
  ],
};

const ease = [0.22, 1, 0.36, 1];

function Traces({ items, extraDots, reduce }) {
  return (
    <svg viewBox="0 0 420 760" width="420" height="760" aria-hidden="true" focusable="false">
      {items.map((trace) => (
        <g key={trace.d} className={`field__trace field__trace--${trace.tone}`}>
          <motion.path
            d={trace.d}
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease, delay: trace.delay }}
          />
          <motion.circle
            cx={trace.node[0]}
            cy={trace.node[1]}
            r="6"
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease, delay: trace.delay + 0.95 }}
            style={{ transformOrigin: `${trace.node[0]}px ${trace.node[1]}px` }}
          />
        </g>
      ))}
      {extraDots.map(([cx, cy], index) => (
        <motion.circle
          key={`${cx}-${cy}`}
          className="field__dot"
          cx={cx}
          cy={cy}
          r="3"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.2 + index * 0.08 }}
        />
      ))}
    </svg>
  );
}

export default function HeroField() {
  const reduce = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 60, damping: 18, mass: 0.6 });
  const y = useSpring(pointerY, { stiffness: 60, damping: 18, mass: 0.6 });
  const xInverse = useTransform(x, (value) => -value);

  // A few pixels of drift that follows the pointer. Desktop only.
  useEffect(() => {
    if (reduce || !window.matchMedia('(pointer: fine)').matches) return undefined;
    const onMove = (event) => {
      pointerX.set((event.clientX / window.innerWidth - 0.5) * 14);
      pointerY.set((event.clientY / window.innerHeight - 0.5) * 10);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [pointerX, pointerY, reduce]);

  return (
    <div className="field" aria-hidden="true">
      <div className="field__grid" />
      <motion.div className="field__side field__side--left" style={{ x, y }}>
        <Traces items={left} extraDots={dots.left} reduce={reduce} />
      </motion.div>
      <motion.div className="field__side field__side--right" style={{ x: xInverse, y }}>
        <Traces items={right} extraDots={dots.right} reduce={reduce} />
      </motion.div>
    </div>
  );
}
