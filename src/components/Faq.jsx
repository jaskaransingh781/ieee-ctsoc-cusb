import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon';
import './Faq.css';

const ease = [0.22, 1, 0.36, 1];

/**
 * Accordion. One answer open at a time.
 *   defaultOpen : index that starts open (-1 for all closed)
 *   variant     : 'list' (ruled rows) or 'cards' (one bordered card each)
 */
export default function Faq({ items = [], defaultOpen = 0, variant = 'list' }) {
  const [openIndex, setOpenIndex] = useState(defaultOpen);
  const baseId = useId();

  if (!items.length) return null;

  return (
    <div className={`faq faq--${variant}`}>
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        return (
          <div key={item.q} className={`faq__item ${open ? 'is-open' : ''}`}>
            <h3 className="faq__heading">
              <button
                type="button"
                id={buttonId}
                className="faq__button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? -1 : index)}
              >
                <span>{item.q}</span>
                <span className="faq__icon">
                  <Icon name={variant === 'cards' ? 'chevronDown' : 'plus'} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="faq__panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease }}
                >
                  <p className="faq__answer">{item.a}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
