import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Things the site's own server keeps up to date (see server/feeds.js).
// Each address is asked once per visit and the answer is shared by every
// component that wants it. The hooks return
//   null             while the answer is on its way
//   { ok: false }    if the server could not get it (the page then uses
//                    what is saved in src/data/)
//   { ok: true, … }  the live answer
// ---------------------------------------------------------------------------

const answers = new Map();

function ask(url) {
  if (!answers.has(url)) {
    answers.set(
      url,
      fetch(url, { headers: { Accept: 'application/json' } })
        .then((response) => (response.ok ? response.json() : { ok: false }))
        .then((data) => (data && typeof data === 'object' ? data : { ok: false }))
        .catch(() => ({ ok: false })),
    );
  }
  return answers.get(url);
}

function useLive(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let current = true;
    ask(url).then((answer) => current && setData(answer));
    return () => {
      current = false;
    };
  }, [url]);
  return data;
}

/** Today's US dollar to Indian rupee rate: { ok, rate, date, source }. */
export const useLiveRate = () => useLive('/api/rates');

/** IEEE CTSoc newsletter issues found online: { ok, issues: [{ month, url }] }. */
export const useLiveNewsletterData = () => useLive('/api/newsletter');
