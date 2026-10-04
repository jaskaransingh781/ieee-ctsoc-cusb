// Small line-icon set. All icons share one 24px grid and stroke weight so
// they read as a family. Usage: <Icon name="calendar" />

const paths = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 3.9 5.2 3.9 8.5s-1.3 6.1-3.9 8.5c-2.6-2.4-3.9-5.2-3.9-8.5s1.3-6.1 3.9-8.5Z" />
    </>
  ),
  trend: (
    <>
      <path d="M4 17.5 9.5 12l3.5 3.5L20 8.5" />
      <path d="M14.5 8.5H20V14" />
    </>
  ),
  cpu: (
    <>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
      <rect x="10" y="10" width="4" height="4" rx="0.6" />
      <path d="M9.5 3.5v3M14.5 3.5v3M9.5 17.5v3M14.5 17.5v3M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3" />
    </>
  ),
  device: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <path d="M10.5 17.5h3" />
    </>
  ),
  spark: (
    <>
      <path d="M11 4.5 12.7 9.300l4.800 1.700-4.800 1.700L11 17.500l-1.700-4.800L4.500 11l4.800-1.700L11 4.500Z" />
      <path d="M18 15.500v4M16 17.500h4" />
    </>
  ),
  nodes: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="m8.200 10.900 7.600-3.800M8.200 13.100l7.600 3.800" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M7 14.500h4" />
    </>
  ),
  minus: <path d="M6 12h12" />,
  out: <path d="M7 17 17 7M9 7h8v8" />,
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.800 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.500V12l3 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.500" r="3.250" />
      <path d="M2.750 19.500a6.250 6.250 0 0 1 12.500 0M16 5.600a3.250 3.250 0 0 1 0 5.800M17.500 14.200a6.250 6.250 0 0 1 3.750 5.300" />
    </>
  ),
  ticket: (
    <>
      <path d="M4 8.500a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.750a1.750 1.750 0 0 0 0 3.500V15.500a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.750a1.750 1.750 0 0 0 0-3.500Z" />
      <path d="M14 6.500v11" strokeDasharray="2 2.500" />
    </>
  ),
  flag: <path d="M5 21V4M5 4.500h11.500l-2.250 4 2.250 4H5" />,
  layers: (
    <>
      <path d="m12 3.500 8.500 4.500-8.500 4.500L3.500 8 12 3.500Z" />
      <path d="m3.500 12.500 8.500 4.500 8.500-4.500" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.500" width="18" height="13" rx="2.500" />
      <path d="m3.500 7.500 8.500 6 8.500-6" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.660 0l3-3a4 4 0 0 0-5.660-5.660l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.660 0l-3 3a4 4 0 0 0 5.660 5.660l1-1" />
    </>
  ),
  check: <path d="m5 12.500 4.500 4.500L19 7.500" />,
  alert: (
    <>
      <path d="M12 4 2.750 19.500h18.500L12 4Z" />
      <path d="M12 10v4.500M12 17.200v.100" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 8h16M4 16h16" />,
  chevronLeft: <path d="m14.500 6-6 6 6 6" />,
  chevronRight: <path d="m9.500 6 6 6-6 6" />,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4.5h8v5a4 4 0 0 1-8 0v-5Z" />
      <path d="M8 6H5.5a2.5 2.5 0 0 0 2.6 3M16 6h2.500a2.500 2.500 0 0 1-2.600 3M12 13.500V17M8.500 19.500h7M9.500 17h5" />
    </>
  ),
  pause: <path d="M9 6v12M15 6v12" />,
  play: <path d="M8.500 6v12l9.500-6-9.500-6Z" />,

  // Track pictograms
  city: (
    <>
      <path d="M3 20.500h18M5 20.500V9.500l5-2.500v13.500M10 20.500V4.500l8 3v13" />
      <path d="M13.500 10v.100M13.500 13.500v.100M13.500 17v.100M7.500 12.500v.100M7.500 16v.100" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 13c0-4-2.500-6.500-7.500-6.500C4.500 10.500 7 13 12 13ZM12 10.500c0-3.500 2.200-6 7.500-6 0 4-2.300 6-7.500 6Z" />
      <path d="M7 21h10" />
    </>
  ),
  pulse: (
    <>
      <path d="M12 20.500s-8-4.700-8-10.700A4.300 4.300 0 0 1 12 7.500a4.300 4.300 0 0 1 8 2.300c0 6-8 10.700-8 10.700Z" />
      <path d="M6.500 12.500h3l1.500-2.500 2 4.500 1.500-2h3" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.500C10.300 5.200 8 4.500 4 4.500v13.500c4 0 6.300.700 8 2 1.700-1.300 4-2 8-2V4.500c-4 0-6.300.700-8 2Z" />
      <path d="M12 6.500V20" />
    </>
  ),
  energy: (
    <>
      <circle cx="12" cy="12" r="3.750" />
      <path d="M12 3v2.250M12 18.750V21M3 12h2.250M18.750 12H21M5.600 5.600l1.600 1.600M16.800 16.800l1.600 1.600M5.600 18.400l1.600-1.600M16.800 7.200l1.600-1.600" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.500 5 6v5.500c0 4.300 2.900 7.600 7 9 4.100-1.400 7-4.700 7-9V6l-7-2.500Z" />
      <path d="m9 12 2.200 2.200L15.200 10" />
    </>
  ),
};

export default function Icon({ name, className = '', size, ...rest }) {
  const content = paths[name];
  if (!content) return null;
  return (
    <svg
      className={`icon icon--${name} ${className}`.trim()}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.600"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {content}
    </svg>
  );
}
