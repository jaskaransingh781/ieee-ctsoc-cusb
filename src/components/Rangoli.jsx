import './Rangoli.css';

const petals = Array.from({ length: 12 }, (_, index) => index * 30);
const dots = Array.from({ length: 16 }, (_, index) => index * 22.5);

export default function Rangoli({ className = '' }) {
  return (
    <svg
      className={`rangoli ${className}`.trim()}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="rangoli__outer" cx="100" cy="100" r="91" />
      <circle className="rangoli__ring" cx="100" cy="100" r="78" />
      <g className="rangoli__petals">
        {petals.map((angle) => (
          <path
            key={angle}
            style={{ '--angle': `${angle}deg`, '--petal-delay': `${angle / 30 * 75}ms` }}
            d="M100 96C82 82 80 59 100 34C120 59 118 82 100 96Z"
          />
        ))}
      </g>
      <g className="rangoli__geometry">
        <path d="M100 22 178 100 100 178 22 100Z" />
        <path d="M100 48 152 100 100 152 48 100Z" />
        <circle cx="100" cy="100" r="34" />
      </g>
      <g className="rangoli__dots">
        {dots.map((angle, index) => (
          <circle
            key={angle}
            style={{ '--dot-delay': `${index * 90}ms` }}
            transform={`rotate(${angle} 100 100)`}
            cx="100"
            cy="12"
            r={index % 4 === 0 ? 2.7 : 1.8}
          />
        ))}
      </g>
      <g className="rangoli__center">
        <circle cx="100" cy="100" r="16" />
        <path d="M100 89C106 95 106 105 100 111 94 105 94 95 100 89Z" />
        <circle cx="100" cy="100" r="3" />
      </g>
    </svg>
  );
}
