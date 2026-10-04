// ---------------------------------------------------------------------------
// Things the site keeps up to date by itself, fetched here on the server and
// remembered for a few hours so other sites are asked only now and then.
//
//   GET /api/rates       today's US dollar to Indian rupee rate
//   GET /api/newsletter  which monthly issues of IEEE CTSoc's "News on
//                        Consumer Technology" are online
//
// The browser cannot ask those sites directly (they do not allow it), which
// is why this runs on the server. If a source cannot be reached, the answer
// is { ok: false } and the page falls back to what is saved in src/data/.
// ---------------------------------------------------------------------------

const HOUR = 60 * 60 * 1000;
const USER_AGENT = 'Mozilla/5.0 (compatible; IEEE-CTSoc-CUSB-website/1.0; +mailto:ieeectsoc.cu@gmail.com)';

const withTimeout = (ms) => (typeof AbortSignal?.timeout === 'function' ? AbortSignal.timeout(ms) : undefined);

// ------------------------------------------------------------------ rates

// Tried in order. Both are free and need no key.
const RATE_SOURCES = [
  {
    name: 'Frankfurter (European Central Bank reference rates)',
    link: 'https://frankfurter.dev/',
    url: 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR',
    read: (json) => ({ rate: json?.rates?.INR, date: json?.date }),
  },
  {
    name: 'ExchangeRate-API',
    link: 'https://www.exchangerate-api.com',
    url: 'https://open.er-api.com/v6/latest/USD',
    read: (json) => ({
      rate: json?.rates?.INR,
      date: json?.time_last_update_unix ? new Date(json.time_last_update_unix * 1000).toISOString().slice(0, 10) : null,
    }),
  },
];

const RATE_KEEP = 12 * HOUR;
const RETRY_AFTER = 10 * 60 * 1000;
const rateMemory = { value: null, at: 0 };

// A rate outside this range is treated as a broken answer, not a price.
const plausible = (rate) => typeof rate === 'number' && Number.isFinite(rate) && rate > 40 && rate < 250;

export async function getUsdInr({ fetchImpl = globalThis.fetch, now = Date.now(), memory = rateMemory } = {}) {
  const age = now - memory.at;
  if (memory.value && age < (memory.value.ok ? RATE_KEEP : RETRY_AFTER)) return memory.value;

  let result = { ok: false, error: 'No exchange-rate source could be reached.' };
  for (const source of RATE_SOURCES) {
    try {
      const response = await fetchImpl(source.url, {
        headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
        signal: withTimeout(6000),
      });
      if (!response.ok) continue;
      const { rate, date } = source.read(await response.json());
      if (!plausible(rate)) continue;
      result = {
        ok: true,
        rate: Math.round(rate * 100) / 100,
        date: /^\d{4}-\d{2}-\d{2}$/.test(date ?? '') ? date : new Date(now).toISOString().slice(0, 10),
        source: source.name,
        sourceLink: source.link,
        checkedAt: new Date(now).toISOString(),
      };
      break;
    } catch {
      // Try the next source.
    }
  }

  memory.value = result;
  memory.at = now;
  return result;
}

// ------------------------------------------------------------- newsletter

// Each monthly issue is a PDF with the year and month in its name.
const issueUrl = (year, month) =>
  `https://ctsoc.ieee.org/images/CTSOC-NCT-${year}-${String(month).padStart(2, '0')}.pdf`;

const LOOK_BACK_MONTHS = 30; // how far back to look for issues
const AT_A_TIME = 6; // months asked about together, so the site is not flooded
const SHOW_ISSUES = 6;
const NEWS_KEEP = 12 * HOUR;
const newsMemory = { value: null, at: 0 };

async function issueExists(url, fetchImpl) {
  const headers = { 'User-Agent': USER_AGENT, Accept: 'application/pdf,*/*' };
  const looksRight = (response) =>
    response.status === 200 || response.status === 206
      ? /pdf|octet-stream/i.test(response.headers?.get?.('content-type') ?? 'pdf')
      : false;
  try {
    const head = await fetchImpl(url, { method: 'HEAD', headers, redirect: 'follow', signal: withTimeout(7000) });
    if (looksRight(head)) return true;
    if (head.status === 404) return false;
    // Some servers refuse HEAD: ask for the first byte instead.
    const first = await fetchImpl(url, {
      method: 'GET',
      headers: { ...headers, Range: 'bytes=0-0' },
      redirect: 'follow',
      signal: withTimeout(7000),
    });
    return looksRight(first);
  } catch {
    return false;
  }
}

export async function getNewsletterIssues({ fetchImpl = globalThis.fetch, now = Date.now(), memory = newsMemory } = {}) {
  const age = now - memory.at;
  if (memory.value && age < (memory.value.ok ? NEWS_KEEP : RETRY_AFTER)) return memory.value;

  // This month first, then back through the months before it (India time).
  const today = new Date(now + 5.5 * HOUR);
  const months = Array.from({ length: LOOK_BACK_MONTHS }, (_, back) => {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - back, 1));
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
  });

  // Newest months first, a few at a time, stopping once there are enough.
  const issues = [];
  for (let from = 0; from < months.length && issues.length < SHOW_ISSUES; from += AT_A_TIME) {
    const found = await Promise.all(
      months.slice(from, from + AT_A_TIME).map(async ({ year, month }) => {
        const url = issueUrl(year, month);
        return (await issueExists(url, fetchImpl)) ? { month: `${year}-${String(month).padStart(2, '0')}`, url } : null;
      }),
    );
    issues.push(...found.filter(Boolean));
  }
  issues.splice(SHOW_ISSUES);

  const result = issues.length
    ? { ok: true, issues, checkedAt: new Date(now).toISOString() }
    : { ok: false, issues: [], error: 'No issues could be confirmed on ctsoc.ieee.org.' };

  memory.value = result;
  memory.at = now;
  return result;
}
