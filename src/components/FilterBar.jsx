import { useId } from 'react';
import { motion } from 'framer-motion';
import './FilterBar.css';

/**
 * A row of mutually exclusive options with a sliding highlight.
 *   options: [{ value, label, count }]
 */
export function Segmented({ label, options, value, onChange, variant = 'segmented' }) {
  const groupId = useId();
  return (
    <div className={`filter filter--${variant}`} role="group" aria-label={label}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={`filter__option ${active ? 'is-active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {active ? (
              <motion.span
                layoutId={`filter-${groupId}`}
                className="filter__highlight"
                transition={{ type: 'spring', stiffness: 520, damping: 40 }}
              />
            ) : null}
            <span className="filter__label">{option.label}</span>
            {typeof option.count === 'number' ? <span className="filter__count">{option.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export default function FilterBar({ status, type, onStatus, onType, statusOptions, typeOptions }) {
  return (
    <div className="filterbar">
      <Segmented label="Filter by time" options={statusOptions} value={status} onChange={onStatus} />
      <Segmented label="Filter by category" options={typeOptions} value={type} onChange={onType} variant="chips" />
    </div>
  );
}
