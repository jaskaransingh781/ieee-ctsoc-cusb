# IEEE CTSoc CUSB website

Multi-page site for the IEEE Consumer Technology Society, Chandigarh University Student Branch.
React + Vite + React Router + Framer Motion, with a small Node server for the forms, exchange rates,
newsletter list and the separate CYBERHUNT: DEAD INTERNET event.

## Run it

Needs Node 20.19 or newer.

```bash
npm install
npm run dev        # site on http://localhost:5173, the server on :8787
```

```bash
npm run build      # production build into dist/
npm start          # serves dist/ and the server routes from one Node process
npm test           # checks server flows, live-data helpers, calendar, pop-up and prices
```

## CYBERHUNT: DEAD INTERNET

The fictional puzzle investigation is available at `/events/cyberhunt`; its team briefing, archive
stages, recovery flow and organizer console are served under that route. Team progress, answers,
hints, scores and final submissions are kept on the server. Socket.IO uses its own `/cyberhunt`
namespace, separate from the other event pages.

Without `MONGODB_URI`, Cyberhunt stores its state in `server/data/cyberhunt.json` (or
`CYBERHUNT_DB_FILE`). When MongoDB is configured, it stores state in its own `CyberhuntState`
collection. Development uses the local demo credentials `admin` / `cyberhunt2026`; do not use them
for a live event. Production requires `CYBERHUNT_ADMIN_USER`, `CYBERHUNT_ADMIN_PASSWORD` and
`CYBERHUNT_AUTH_SECRET`. `CYBERHUNT_DURATION_SECONDS` configures the event timer (default 10800
seconds). The API and synchronized Socket.IO event controls require a persistent Node
host; they are not provided by the current Vercel serverless setup.

### One-time retired CODEX MongoDB cleanup

The historical CODEX backend used six dedicated Mongoose models and collections:
`CodexTeam` (`codexteams`), `CodexChallenge` (`codexchallenges`),
`CodexSubmission` (`codexsubmissions`), `CodexScoreEvent` (`codexscoreevents`),
`CodexEventState` (`codexeventstates`) and `CodexUser` (`codexusers`). The cleanup
script derives and verifies each collection name through Mongoose before it reads or deletes.

It is read-only by default. Configure `MONGODB_URI` through the existing environment or ignored
`.env`, verify the intended database name, then run a dry run:

```bash
npm run cleanup:codex -- --expected-database <verified-database-name> --allow-remote
```

The report counts exact schema-shaped matches and leaves non-matching documents for manual review.
Its filters are: team ID and join code strings; challenge ID and answer-hash strings; submission ID,
team ID, challenge ID and a schema-valid status; score-event ID, action and description strings;
the exact event-state `_id` `codex`; and admin username/password-hash strings with role `admin`.
Only those six dedicated collections are eligible. The separate `cyberhuntstates` collection and
its `_id` `cyberhunt` document are counted for protection and never targeted.

Before deletion, take and verify a current database backup and stop any legacy CODEX server that
might still write to these collections. Re-check that the dry-run database name is the intended
target. Deletion requires every explicit gate:

```bash
npm run cleanup:codex -- --expected-database <verified-database-name> --allow-remote --delete --confirm-delete CODEX --backup-confirmed
```

The script reports per-collection deletion results, post-delete matching counts, partial failures,
and whether the Cyberhunt singleton count remained unchanged. It does not drop collections or
delete documents that fail the stated CODEX criteria.

## Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/about` | About |
| `/events` | All events, with time and category filters (`/events?status=past&type=workshop` works as a link) |
| `/events/:slug` | One page per event, e.g. `/events/zinnovatio-4o` |
| `/events/cyberhunt/*` | CYBERHUNT: DEAD INTERNET puzzle investigation and organizer console |
| `/journey` | Timeline of past events |
| `/team` | Team |
| `/membership` | IEEE and IEEE CTSoc student membership information, plus an invitation to contact the chapter |
| `/signup` | Chapter interest form with contact details and official links |
| `/signup#contact` | Contact details on the Sign-up page |
| `/contact` | Redirects to `/signup#contact` for older links |
| `/signin` | Redirects to `/signup#contact` |
| anything else | 404 page (unknown event slugs get "Event not found") |

## Changing content

Everything editable lives in `src/data/`. Components never hard-code names, dates or links.

| File | What it controls |
| --- | --- |
| `src/data/site.js` | Name, email, Instagram / LinkedIn / WhatsApp community / YouTube / GitHub / website links, navbar items, home-page figures |
| `src/data/events.js` | Every event: title, type, status, dates, venue, poster, description, registration link, tracks, schedule, FAQs |
| `src/data/team.js` | Team members: name, role, photo, LinkedIn / Instagram links, who gets the large cards |
| `src/data/gallery.js` | Photographs for event pages and the Journey page |
| `src/data/membership.js` | Membership dues, tax rate, fallback USD to INR rate, dated discounts, official IEEE links, and the wording of the Membership page |
| `src/data/registration.js` | Fields, validation, steps and wording for the separate chapter interest form |
| `src/data/newsletter.js` | The two IEEE CTSoc publications in the "From IEEE CTSoc" section, and that section's wording |

Set any link to `null` and it disappears from the site. Set an event's `poster` or a member's
`image` to `null` and a typographic visual or neutral placeholder is shown instead.

### Images

Put files in `src/assets/` and reference them by their path inside that folder:

```
src/assets/branding/   logos
src/assets/events/     posters and banners   ->  poster: 'events/my-poster.jpg'
src/assets/team/       portraits             ->  image:  'team/full-name.jpg'
src/assets/gallery/    event photographs     ->  src:    'gallery/day-one.jpg'
```

A full `https://` URL also works. The Zinnovatio photographs are currently loaded from
zinnovatio.in; for a production deploy, download them into `src/assets/gallery/` and switch the
paths in `gallery.js` and `events.js`. If a remote image fails to load, the site falls back to the
typographic visual (posters) or drops the tile (gallery), so nothing ever appears broken.

### Team profiles and LinkedIn links

Each person is one line in `src/data/team.js`:

```js
member('charoo-negi', 'Charoo Negi', 'Social Media and Content', {
  linkedin: 'https://www.linkedin.com/in/charoo-negi-38024932b/',
}),
```

Everything inside the `{ }` is optional:

| Field | What it does |
| --- | --- |
| `linkedin` | Adds a LinkedIn button to that person's card |
| `instagram` | Adds an Instagram button |
| `image` | A photograph, e.g. `'team/charoo-negi.jpg'` (file goes in `src/assets/team/`). Without one the card shows initials |
| `bio` | One or two sentences under the role |
| `featured` | `true` gives the person a large card under "Leadership" on the Team page and on the home page |

To add a LinkedIn link to someone who has none, add the braces:
`member('anesh', 'Anesh', 'Secretary', { linkedin: 'https://www.linkedin.com/in/...' }),`

### Instagram, LinkedIn and the WhatsApp community

The three links are `social.instagram`, `social.linkedin` and `social.whatsapp` in `site.js`. They
always appear together, as "Follow on Instagram", "Follow on LinkedIn" and "Join the WhatsApp
community": in the block at the bottom of the home page, on the Team and Sign-up pages, and in a "Stay connected"
strip at the end of the About, Events, Journey and event pages. The footer and mobile menu list them
too. Change a link in that one place and every button follows; set one to `null` and it drops out
everywhere. The buttons themselves are `src/components/Reach.jsx`.

### Membership prices

All the numbers on `/membership` come from `membershipPricing` at the top of `src/data/membership.js`:

```js
export const membershipPricing = {
  ieeeStudent: { usd: 14.0, taxRate: 0.18 },
  ctsocStudent: { usd: 0.5, taxRate: 0.18 },
  usdToInr: 96.2,
  rateDate: '2026-10-02',
  lastUpdated: '2026-10-04',
};
```

Change a number there and every price, total and rupee figure on the page follows. Nothing is typed
into the page itself. The rupee figures are shown with "≈" and labelled indicative; IEEE's checkout
decides the real amount.

**What updates by itself**

- **The rupee conversion.** The server looks up the day's USD to INR rate (`server/feeds.js`, route
  `/api/rates`; it asks Frankfurter, which publishes European Central Bank reference rates, and
  falls back to ExchangeRate-API) and keeps it for twelve hours. The page then says "Live rate" with
  the rate's date. If the lookup fails, or the site is on a host with no server, the page uses
  `usdToInr` above and says "Saved mid-market rate" with `rateDate`. No key or account is needed.
- **Discounts, once you list them.** Add an entry to `membershipDiscounts` in the same file:

  ```js
  export const membershipDiscounts = [
    {
      label: 'Half-year pricing',
      appliesTo: ['ieeeStudent', 'ctsocStudent'],   // one or both
      percentOff: 50,
      from: '2027-03-01',
      to: '2027-08-15',
    },
  ];
  ```

  From the `from` date to the `to` date (India time, both days included) the cards show the offer,
  the usual price struck through, the reduced price, and reduced totals. Before and after, the entry
  does nothing, so it can be added early and left in. Only list an offer IEEE has announced.

**What does not:** the dues themselves. IEEE publishes no feed of its prices or offers and does not
allow its pages to be read automatically, so when IEEE changes its dues, change the two `usd`
numbers and `lastUpdated`.

The buttons use `membershipLinks` in the same file (IEEE's join page and the IEEE Consumer Technology
Society page in the IEEE membership catalog).

### Contacting the chapter

The Membership page invites prospective chapter participants to use the contact section on `/signup`.
The navbar action always reads “Sign up”. The Sign-up page combines the chapter interest form with
the chapter's contact details and official links.

### Home page pieces and where their content lives

- **Impact strip:** `impact` in `site.js` (title, line of text and the figures). `'auto:past-events'`
  and `'auto:team'` count straight from `events.js` and `team.js`. A figure whose value is `null` is
  hidden; "Check-ins processed" is set up that way until you have a number for it.
- **IEEE Day band:** any upcoming event marked `spotlight: true` in `events.js` (currently
  `ieee-day-2026`). It counts down the days, says "Today" on the day, stays up while the celebrations
  run, and takes itself down after the event's `endDate`.
- **Flagship cards and countdowns:** the event marked `featured: true` in `events.js`. The glass
  cards show two live timers: "Registration closes in" runs to `registrationCloses` and switches to
  "Closed" at that moment, without a reload; "Event starts in" runs to `startsAt`. `headline`,
  `tagline` and `summaryLine` are the wording on the cards. Once the event is over the block retires
  and the event joins the previous events.
- **Events bar** (under the hero): every event. Upcoming events are burgundy with an "Upcoming"
  tag, an event that is on is green with "Live now", past events are plain.
- **Previous events showcase:** every event with `status: 'past'`. A card shows the event's
  photograph when it has one and a drawn panel with its initials when it does not. It rotates on its
  own (the bar under the cards is the timer) and pauses on hover, on focus, off-screen, or with its
  pause button. Photographs are never changed by the site: each card shows the file named in that
  event's `poster` / `gallery.js` entry.
- **Our calendar** (before the team): see "Calendar" below.
- **From IEEE CTSoc** (after the team): see "Newsletters" below.

### Event status updates itself

For an event with a `date`, the site works out the status from the clock: "Upcoming" before the
date, "Happening now" from the date to the `endDate`, and "Past" after that. It re-checks every 30
seconds, so a page left open over midnight changes by itself, without a reload. Events written as
`status: 'past'` and events with no date stay exactly as written.

The colours are the same everywhere: burgundy for upcoming, green for on now, slate for past, coral
for deadlines.

### Calendar

"Our calendar" on the home page draws every dated event in `events.js` on a month grid: the event's
days as a bar, its wider window (`endDate`, e.g. the IEEE Day celebrations) as a lighter bar, and
registration / submission deadlines as coral markers. Today is ringed, there is a live India-time
clock, a list of the month's entries with their status, and chips for every month that has
something. Nothing is entered for the calendar itself. Optional fields on an event:

- `short`: a shorter name for the bar (`'IEEE Day'`).
- `windowLabel`: the name of the lighter bar (`'IEEE Day celebrations'`).
- `months: ['2025-10', '2025-11']`: for a past event whose exact days were not recorded. It is
  listed under those months as "exact days not recorded" and no days are marked.

### Pop-up for events that are near or on

A glass pop-up in the bottom corner (`src/components/LivePulse.jsx`) appears by itself:

- **Registration closing**: in the last three days before `registrationCloses`, with a countdown.
- **Get ready**: in the last three days before an event starts, with a countdown.
- **Happening now**: from the event's start to its end, in green.

Three days is `COUNTDOWN_DAYS` near the bottom of `events.js`. With more than one notice the pop-up
rotates between them. It shrinks to a small pill after ten seconds, the minus button does the same,
and the cross dismisses that notice for the rest of the visit. When nothing is within three days,
nothing is shown.

### Newsletters

"From IEEE CTSoc" on the home page shows the society's two publications (`src/data/newsletter.js`).
The server also looks on ctsoc.ieee.org for the monthly "News on Consumer Technology" PDFs
(`server/feeds.js`, route `/api/newsletter`) and, when it finds them, the section features the
newest issue and links the five before it. It checks again every twelve hours. Only links on
ctsoc.ieee.org that answered as a PDF are shown; if the site cannot be reached the section says so
and shows the two publication cards alone. It never lists an issue it has not found.

An event marked `archive: false` (IEEE Day) drops out of the lists and is not counted under "Events
hosted" once it is over, because it is an occasion the chapter points at rather than one it hosted.
Its own page keeps working. If the chapter runs something for it and you want it kept in the
archive, delete that line and add what happened to its `description`.

### Event details page

`detailSections` at the top of `events.js` lists the blocks the page shows. It is currently
`['about', 'tracks', 'prizes', 'faqs']`. The data for the other blocks (`highlights`, `schedule`,
`judging`, `numbers`, `gallery`) is still in each event; add a name to the list to bring that block
back.

For the flagship event, `detailPoster` is the portrait poster in the sidebar (click to enlarge),
`organisedBy` is the "Organised by" line, and `submission` holds the PPT / idea submission form
link and its deadline. Two more posters are in `src/assets/events/` if you want to swap them in:
`zinnovatio-4o-poster-tracks.webp` (the earlier poster with the tracks) and
`zinnovatio-4o-closing-soon.webp`.

An event only gets a "View details" link when its `description` has at least one paragraph.

`registrationCloses` drives the "Registration closes in" countdown. When it passes, the site
switches to "Registration closed" on its own and removes the Register buttons. For Zinnovatio 4.O
it is 7 October 2026, 11:59 pm IST, from the official poster. The PPT submission link hides itself
the same way after its deadline. To extend either, change the date in `events.js`.

### Still to fill in

- After the site is live, open the home page once and look at "From IEEE CTSoc". If it says the
  latest issues could not be checked, ctsoc.ieee.org is refusing the server's requests; the section
  still works with its two cards, and nothing else needs doing.
- `membership.js`: check the two dues once against IEEE's own checkout, signed in as a student in
  India, and correct them here if they differ.
- `site.js`: the "Check-ins processed" figure, and the chapter's own "Students registered" number
  if it differs from the one entered.
- `team.js`: photographs, and LinkedIn links for the nine people who do not have one yet.
- `events.js`, IEEE Day: what the chapter itself is doing for it, once decided. The IEEE Day emblem
  in `src/assets/events/ieee-day-2026-emblem.webp` was cut from a small image (236px); replace it
  with the full-size file from ieeeday.org if you have it.
- `events.js`: dates, venues and a `description` for Engineers Day, AI Visionaries, AI Mascot,
  MATLAB Workshop, Code Relay and Algolympia if they should get a details page.

## The server

`server/index.js` serves the site APIs and the separate CYBERHUNT event API:

| Route | What it does |
| --- | --- |
| `POST /api/contact` | Checks contact requests and emails them to the chapter inbox. The handler retains its legacy chapter payload for compatibility. |
| `GET /api/rates` | The day's USD to INR rate, kept for twelve hours |
| `GET /api/newsletter` | The IEEE CTSoc newsletter issues found online, kept for twelve hours |
| `GET /api/health` | Says whether email is set up |

The last three need no keys. When a lookup fails they answer `{ "ok": false }` and the page falls
back to what is saved in `src/data/`.

## Contact form email

The chapter interest form posts to `/api/contact`. The server validates the answers and emails them
to the chapter inbox with the sender as reply-to. Credentials stay on the server and never reach the browser.

1. Copy `.env.example` to `.env`.
2. In the Google account for `ieeectsoc.cu@gmail.com`, turn on 2-Step Verification and create an
   App password at https://myaccount.google.com/apppasswords.
3. Paste it into `.env` as `GMAIL_APP_PASSWORD`. Never commit `.env`.
4. Restart `npm run dev`. The server log should say `email delivery: configured`.

Until that is done the form shows "Your message was not sent" with the reason. It never reports
success unless the mail service accepted the message.

Each email contains: name, email, phone, subject, message, timestamp (IST and UTC) and the page it
was sent from. Built in: input validation, header-injection stripping, HTML escaping, a honeypot
field and a limit of 5 messages per address per 10 minutes.

## Deploying

**Any Node host (Render, Railway, a VPS):** build command `npm install && npm run build`, start
command `npm start`. Add the variables from `.env.example` in the host's environment settings.

**Vercel:** `api/contact.js`, `api/rates.js` and `api/newsletter.js` run as serverless functions and
`vercel.json` handles page routing.
Add `GMAIL_USER`, `GMAIL_APP_PASSWORD` and `CONTACT_TO` under Project Settings, Environment Variables.

**Static-only hosts (GitHub Pages, plain Netlify):** the pages work, but the contact form needs the
API. Host `server/` separately, set `ALLOWED_ORIGIN` to the site's address, and point `ENDPOINT` in
`src/components/ChapterForm.jsx` at it. Without the server the Membership page uses the saved
exchange rate and the newsletter section shows its two cards.

## Design tokens and overall size

Colours, type, radii and shadows are CSS variables at the top of `src/styles/base.css`. The blue is
sampled from the IEEE CTSoc CUSB logo. `--burgundy` is upcoming, `--green` is live / active,
`--slate` is past and `--coral` is deadlines.

Every size in the stylesheets is in `rem`, and one rule near the top of `base.css` sets the scale:

```css
@media (min-width: 1200px) {
  html { font-size: clamp(72%, min(0.79vw, 1.66vh), 100%); }
}
```

On laptop and desktop screens the size follows the window, by its width and by its height, so each
section of the home page fits in one window on a 1920x1080 laptop at 100% browser zoom (and at
125% Windows scaling) as well as on a large monitor. Phones and tablets are not scaled. To make
everything bigger or smaller, change `0.79vw` and `1.66vh` together.
