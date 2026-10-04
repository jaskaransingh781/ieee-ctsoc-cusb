import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

/** Fades content up once, the first time it scrolls into view. */
export default function Reveal({ as = 'div', delay = 0, y = 16, className, children, ...rest }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.55, ease, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
