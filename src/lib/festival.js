const FESTIVAL_START = '2026-10-11';
const FESTIVAL_END = '2026-10-20';
const VIJAYADASHAMI = '2026-10-20';

export function getFestivalTheme(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Kolkata',
  }).formatToParts(date);
  const currentDate = parts.reduce((value, part) => {
    if (part.type === 'year') value.year = part.value;
    if (part.type === 'month') value.month = part.value;
    if (part.type === 'day') value.day = part.value;
    return value;
  }, {});
  const dateKey = `${currentDate.year}-${currentDate.month}-${currentDate.day}`;

  if (dateKey < FESTIVAL_START || dateKey > FESTIVAL_END) return null;
  return dateKey === VIJAYADASHAMI ? 'vijayadashami' : 'navratri';
}
