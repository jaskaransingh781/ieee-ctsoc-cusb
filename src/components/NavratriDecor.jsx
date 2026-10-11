import Rangoli from './Rangoli';

const particles = [
  { x: '8%', y: '38%', duration: '13s', delay: '-8s', drift: '12px' },
  { x: '17%', y: '72%', duration: '16s', delay: '-2s', drift: '-9px' },
  { x: '29%', y: '24%', duration: '14s', delay: '-11s', drift: '10px' },
  { x: '39%', y: '80%', duration: '18s', delay: '-5s', drift: '-13px' },
  { x: '58%', y: '31%', duration: '15s', delay: '-7s', drift: '8px' },
  { x: '68%', y: '75%', duration: '17s', delay: '-13s', drift: '-11px' },
  { x: '82%', y: '39%', duration: '14s', delay: '-4s', drift: '12px' },
  { x: '92%', y: '67%', duration: '19s', delay: '-10s', drift: '-8px' },
];

const bulbs = [
  { x: '3%', delay: '0s', color: '#f4b84e' },
  { x: '11%', delay: '-1.3s', color: '#ec6c59' },
  { x: '19%', delay: '-2.6s', color: '#62c7df' },
  { x: '27%', delay: '-0.7s', color: '#a58be8' },
  { x: '35%', delay: '-2s', color: '#f4b84e' },
  { x: '7%', delay: '-1s', color: '#ec6c59' },
  { x: '26%', delay: '-2.3s', color: '#62c7df' },
  { x: '45%', delay: '-0.4s', color: '#f4b84e' },
  { x: '64%', delay: '-1.7s', color: '#a58be8' },
  { x: '83%', delay: '-2.9s', color: '#ec6c59' },
];

const fireworks = [
  { x: '12%', y: '28%', size: '15rem', delay: '-1.8s', duration: '8.2s', color: '#efae4d' },
  { x: '86%', y: '34%', size: '17rem', delay: '-5.2s', duration: '9.4s', color: '#e76c57' },
  { x: '72%', y: '72%', size: '13rem', delay: '-3.7s', duration: '7.6s', color: '#7a91e8' },
  { x: '28%', y: '76%', size: '14rem', delay: '-6.4s', duration: '10s', color: '#52bcd6' },
];

const rockets = [
  { side: 'left', delay: '-2s', duration: '7.8s', color: '#efae4d' },
  { side: 'right', delay: '-5.5s', duration: '9.2s', color: '#e76c57' },
  { side: 'left', delay: '-7s', duration: '10.5s', color: '#827ce0' },
];

function Kandil({ side, delay }) {
  return (
    <div className={`navratri-decor__kandil navratri-decor__kandil--${side}`} style={{ '--delay': delay }}>
      <span className="navratri-decor__cord" />
      <svg viewBox="0 0 44 70" focusable="false">
        <path className="navratri-decor__kandil-cap" d="M15 12h14l-3 7H18zM11 53h22l-4 7H15z" />
        <path className="navratri-decor__kandil-frame" d="M14 20h16l4 29H10zM14 20l8 29 8-29M10 49h24" />
        <path className="navratri-decor__kandil-glass" d="M17 25h10l3 19H14z" />
      </svg>
    </div>
  );
}

function Firework({ x, y, size, delay, duration, color, index }) {
  return (
    <div
      className={`navratri-decor__firework navratri-decor__firework--${index}`}
      style={{ '--x': x, '--y': y, '--size': size, '--delay': delay, '--duration': duration, '--burst-color': color }}
    >
      {Array.from({ length: 18 }, (_, spark) => (
        <span
          key={spark}
          className="navratri-decor__ray"
          style={{
            '--angle': `${spark * 20}deg`,
            '--length': `${42 + ((spark * 17) % 55)}px`,
            '--spark-delay': `${(spark % 5) * 35}ms`,
          }}
        />
      ))}
      {Array.from({ length: 8 }, (_, spark) => (
        <span
          key={`ember-${spark}`}
          className="navratri-decor__ember"
          style={{ '--angle': `${spark * 45 + 20}deg`, '--distance': `${35 + (spark % 3) * 9}px` }}
        />
      ))}
      <span className="navratri-decor__burst-core" />
    </div>
  );
}

function Diya({ side }) {
  return (
    <svg className={`navratri-decor__diya navratri-decor__diya--${side}`} viewBox="0 0 76 54" focusable="false">
      <ellipse className="navratri-decor__diya-glow" cx="38" cy="39" rx="31" ry="10" />
      <path className="navratri-decor__flame" d="M38 4C29 15 34 20 38 23c4-4 10-9 0-19Z" />
      <path className="navratri-decor__flame-core" d="M38 12c-4 6-2 8 0 10 2-2 4-5 0-10Z" />
      <path className="navratri-decor__wick" d="M38 23v5" />
      <path className="navratri-decor__bowl" d="M12 29c3 13 12 19 26 19s23-6 26-19c-12 5-40 5-52 0Z" />
      <path className="navratri-decor__bowl-rim" d="M11 29c14 6 40 6 54 0" />
      <path className="navratri-decor__bowl-detail" d="M27 40h22" />
    </svg>
  );
}

export default function NavratriDecor() {
  return (
    <div className="navratri-decor" aria-hidden="true">
      <div className="navratri-decor__ambient" />
      {fireworks.map((firework, index) => <Firework key={firework.x} {...firework} index={index} />)}
      {rockets.map((rocket, index) => (
        <span
          key={`${rocket.side}-${index}`}
          className={`navratri-decor__rocket navratri-decor__rocket--${rocket.side} navratri-decor__rocket--${index}`}
          style={{ '--delay': rocket.delay, '--duration': rocket.duration, '--rocket-color': rocket.color }}
        />
      ))}
      <Rangoli className="navratri-decor__rangoli navratri-decor__rangoli--left" />
      <Rangoli className="navratri-decor__rangoli navratri-decor__rangoli--right" />
      <div className="navratri-decor__light-string navratri-decor__light-string--left">
        {bulbs.slice(0, 5).map((bulb, index) => (
          <span key={bulb.x} className="navratri-decor__bulb" style={{ '--x': bulb.x, '--delay': bulb.delay, '--size': index % 2 ? '5px' : '6px', '--bulb-color': bulb.color }} />
        ))}
      </div>
      <div className="navratri-decor__light-string navratri-decor__light-string--right">
        {bulbs.slice(5).map((bulb, index) => (
          <span key={bulb.x} className="navratri-decor__bulb" style={{ '--x': bulb.x, '--delay': bulb.delay, '--size': index % 2 ? '5px' : '6px', '--bulb-color': bulb.color }} />
        ))}
      </div>
      <Kandil side="left" delay="-1.4s" />
      <Kandil side="right" delay="-3.1s" />
      <Kandil side="left-lower" delay="-4.7s" />
      <Kandil side="right-lower" delay="-2.6s" />
      <Diya side="left" />
      <Diya side="right" />
      {particles.map((particle, index) => (
        <span
          key={particle.x}
          className={`navratri-decor__particle navratri-decor__particle--${index % 3}`}
          style={{
            '--x': particle.x,
            '--y': particle.y,
            '--duration': particle.duration,
            '--delay': particle.delay,
            '--drift': particle.drift,
          }}
        />
      ))}
    </div>
  );
}
