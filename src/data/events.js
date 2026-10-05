// ---------------------------------------------------------------------------
// EVENTS
// One object per event. Every event card, the Events page filters, the
// previous-events carousel, the Journey page and each /events/<slug> page
// read from this list.
//
// To add an event: copy an object, give it a unique `slug`, fill what you
// know and leave the rest as null. Missing fields are handled on the page.
//
// type    : 'event' | 'workshop' | 'hackathon' | 'competition' | 'seminar'
// status  : 'upcoming' | 'ongoing' | 'past'
// date    : 'YYYY-MM-DD' or null.   endDate: same, for multi-day events.
// dateLabel: optional text shown instead of the formatted date.
// poster  : path inside src/assets/ (e.g. 'events/my-poster.jpg'), a full
//           https:// URL, or null for the typographic visual.
// posterShape: 'wide' for banners (3:1). Leave out for normal posters.
// description: paragraphs for the details page. An event with an empty
//           description gets no "View details" link.
//
//
// Status looks after itself for dated events: once `date` arrives an
// 'upcoming' event shows as "Happening now", and after `endDate` (or `date`)
// it moves to the previous events on its own. Events written as 'past', and
// events with no `date`, are left exactly as written.
//
// months  : ['YYYY-MM', ...] for a past event whose exact days are not known.
//           The calendar lists it under those months without marking days.
// short   : optional shorter name for the calendar's narrow bars.
//
// spotlight: true gives an upcoming event its own band on the home page
//           (used for IEEE Day).
// archive : false keeps an event out of the previous events, the Journey
//           page and the "Events hosted" count once it is over. Use it for
//           an occasion the chapter is pointing at rather than hosting.
//           Remove the line once there is something of the chapter's own
//           to show for it.
// info    : optional rows for the details-page sidebar, in place of the
//           standard date and venue rows: [{ label, value }, ...]
//
// Countdown fields (full date-time with the +05:30 India offset):
//   startsAt            -> "Starts in" on the home page flagship card
//   registrationCloses  -> "Registration closes in" on the details page.
//                          Once it passes, the site shows registration as
//                          closed. Set to null to hide the countdown.
// ---------------------------------------------------------------------------

// Which blocks the event details page shows, in this order. Add any of
// 'numbers', 'highlights', 'tracks', 'schedule', 'judging', 'gallery' to
// bring those blocks back; the data for them is still in each event below.
export const detailSections = ['about', 'tracks', 'prizes', 'faqs'];

export const eventTypes = {
  event: { label: 'Event', plural: 'Events', tone: 'blue' },
  workshop: { label: 'Workshop', plural: 'Workshops', tone: 'cyan' },
  hackathon: { label: 'Hackathon', plural: 'Hackathons', tone: 'coral' },
  competition: { label: 'Competition', plural: 'Competitions', tone: 'blue' },
  seminar: { label: 'Seminar', plural: 'Seminars', tone: 'cyan' },
};

export const statusLabels = {
  upcoming: 'Upcoming',
  ongoing: 'Happening now',
  past: 'Past',
};

const ZINNOVATIO_SITE = 'https://zinnovatio.in/';
const ZINNOVATIO_IMG = 'https://zinnovatio.in/images/story-thumbs';

export const events = [
  // ----------------------------------------------------------------- FLAGSHIP
  {
    id: 'zinnovatio-4o',
    slug: 'zinnovatio-4o',
    title: 'Zinnovatio 4.O',
    type: 'hackathon',
    status: 'upcoming',
    featured: true,
    registrationOpen: true,
    date: '2026-10-30',
    endDate: '2026-10-31',
    startsAt: '2026-10-30T09:00:00+05:30', // check-in time on zinnovatio.in
    endsAt: '2026-10-31T17:00:00+05:30',
    registrationCloses: '2026-10-07T23:59:00+05:30', // last date to register, per the official poster
    venue: 'Chandigarh University, Mohali, Punjab',
    venueShort: 'Chandigarh University',
    venueNote: 'Hall to be announced',
    // Home page flagship cards
    headline: 'Thirty-six hours to a working prototype.',
    tagline: '36 hours. Limitless ideas. Let’s build something epic.',
    organisedBy: 'Department of Computer Science, Nalanda',
    // PPT / idea submission form
    submission: {
      label: 'PPT / idea submission',
      url: 'https://forms.gle/brFVe8g8QZYw4QdK8',
      deadline: '2026-10-07',
    },
    summaryLine: '36 hours on campus. Teams of 3 to 5. Online screening first, then the finale.',
    duration: '36 hours',
    poster: 'events/zinnovatio-4o-banner-2400.webp',
    posterSmall: 'events/zinnovatio-4o-banner-1200.webp',
    posterShape: 'wide',
    // Portrait poster shown on the details page (click to enlarge).
    detailPoster: 'events/zinnovatio-4o-poster.webp',
    detailPosterAlt:
      'Zinnovatio 4.0 official poster: Gen-Z Hackathon, a 36-hour national level hackathon presented by the Department of CSE, Nalanda. 30 to 31 October 2026, Chandigarh University, Mohali, Punjab. Prize pool ₹1,00,000+. Teams of 3 to 5.',
    posterAlt:
      'Zinnovatio 4.0 banner: 36-hour national level hackathon, 30 to 31 October 2026, Chandigarh University, Mohali. Prize pool ₹1,00,000+. Teams of 3 to 5.',
    visualTheme: 'coral',
    shortDescription:
      'A 36-hour national-level hackathon at Chandigarh University. Teams of three to five build working prototypes across six national focus areas.',
    description: [
      'Zinnovatio is Chandigarh University’s national hackathon series, and the fourth edition runs on campus on 30 and 31 October 2026. Teams pick one of six focus areas, get through an online screening round, and then spend the finale building something that actually runs.',
      'The bar is a working prototype. Finalists show a live repository and a functioning demo to the jury, with mentors checking in along the way.',
      'Zinnovatio 4.O is hosted by Chandigarh University and organised by the Department of Computer Science, Nalanda. IEEE CTSoc is a co-organiser.',
    ],
    facts: [
      { label: 'Duration', value: '36 hours' },
      { label: 'Team size', value: '3 to 5 members' },
      { label: 'Format', value: 'Online round, then on-campus finale' },
      { label: 'Entry', value: 'Free. ₹500 per team if shortlisted' },
    ],
    deadline: { label: 'PPT / idea submission', date: '2026-10-07' },
    registrationUrl:
      'https://unstop.com/hackathons/zinnovatio-40-chandigarh-university-cu-ajitgarh-punjab-1749579',
    registrationLabel: 'Register on Unstop',
    websiteUrl: ZINNOVATIO_SITE,
    instagramUrl: null,
    linkedinUrl: null,
    highlights: [
      {
        title: 'Working code only',
        text: 'Teams are judged on a live repository and a functioning demo, not on slides.',
      },
      {
        title: 'Six national focus areas',
        text: 'Each team chooses one area to solve for, from cities and farming to defence.',
      },
      {
        title: 'Mentor check-ins',
        text: 'Mentors review progress during the build and help teams sharpen their idea.',
      },
      {
        title: 'Live jury demos',
        text: 'The finale closes with in-person evaluation and an awards ceremony on campus.',
      },
    ],
    prizes: {
      pool: '₹1,00,000+',
      note: 'Goodies for all participants, as stated on the official poster. The split across positions has not been published yet.',
      // Add position prizes here when announced, e.g.
      // { label: 'Winner', value: '₹50,000' },
      items: [],
    },
    tracks: [
      { title: 'Smart & Sustainable Cities', icon: 'city', tone: 'blue' },
      { title: 'AgriTech & Rural Transformation', icon: 'sprout', tone: 'cyan' },
      { title: 'Healthcare, Wellbeing & Assistive Technologies', icon: 'pulse', tone: 'coral' },
      { title: 'Education, Skilling & Future of Work', icon: 'book', tone: 'blue' },
      { title: 'Energy, Environment & Climate Action', icon: 'energy', tone: 'cyan' },
      { title: 'Defence, Aerospace & National Security', icon: 'shield', tone: 'coral' },
    ],
    tracksTitle: 'Tracks',
    tracksIntro: 'Each team picks one of six tracks to build for.',
    tracksNote: 'Full briefs for each track are published on zinnovatio.in.',
    timeline: [
      {
        group: 'Before the finale',
        items: [
          {
            when: 'Open now',
            title: 'Online screening',
            text: 'Teams register on Unstop and submit their abstract, architecture and feasibility notes.',
          },
          {
            when: '4 Oct 2026',
            title: 'PPT / idea submission',
            text: 'Teams submit their PPT or idea through the submission form.',
            link: { label: 'Submission form', url: 'https://forms.gle/brFVe8g8QZYw4QdK8' },
          },
        ],
      },
      {
        group: 'Day 1, 30 October',
        items: [
          { when: '09:00', title: 'Check-in', text: 'Teams arrive, verify registration and collect badges.' },
          { when: '11:00', title: 'Opening session', text: 'Rules, schedule, tracks and judging are explained.' },
          { when: '12:00', title: 'Hacking begins', text: 'Teams start building their prototypes.' },
          { when: '20:00', title: 'Mentor check-in', text: 'Mentors review progress with each team.' },
        ],
      },
      {
        group: 'Day 2, 31 October',
        items: [
          { when: '12:00', title: 'Code freeze', text: 'Work stops and submissions are locked.' },
          { when: '14:00', title: 'Jury evaluations', text: 'Live demos to the jury, running until 16:30.' },
          { when: '17:00', title: 'Awards ceremony', text: 'Results and prizes.' },
        ],
      },
    ],
    judging: [
      'Novelty and technical viability',
      'Relevance to the chosen focus area',
      'A live, working prototype',
      'Architecture and quality of execution',
    ],
    // Shown as tiles above the questions.
    quickFacts: [
      { label: 'Team size', value: '3 to 5' },
      { label: 'Registration cost', value: 'Free. ₹500 per team if shortlisted' },
    ],
    faqs: [
      {
        q: 'Who can take part?',
        a: 'Zinnovatio 4.O is a national-level hackathon for students. Teams of three to five register together on Unstop.',
      },
      {
        q: 'Is there a registration fee?',
        a: 'Registering on Unstop is free. Teams that are shortlisted for the on-campus finale pay ₹500 per team, not per member.',
      },
    ],
    // Not shown for now. Move any of these into `faqs` above to show them.
    faqsExtra: [
      {
        q: 'Who organises Zinnovatio 4.O?',
        a: 'It is hosted by Chandigarh University and organised by the Department of CSE, Nalanda. IEEE CTSoc is a co-organiser, alongside the IEEE Computer Society student chapter and C-Square.',
      },
      {
        q: 'How does the format work?',
        a: 'There is an online screening round on Unstop first. Shortlisted teams then come to Chandigarh University for the on-campus finale on 30 and 31 October 2026, which ends with live demos to the jury.',
      },
      {
        q: 'What do we have to show the jury?',
        a: 'Working software: a live repository and a functioning demo. A slide deck on its own does not count.',
      },
      {
        q: 'Which problem areas can we choose from?',
        a: 'Smart and sustainable cities; agritech and rural transformation; healthcare, wellbeing and assistive technologies; education, skilling and the future of work; energy, environment and climate action; and defence, aerospace and national security.',
      },
      {
        q: 'Who do we contact with a question about the hackathon?',
        a: 'Write to zinnovatio@cumail.in or events.cse2@cumail.in. For anything about IEEE CTSoc CUSB itself, use the contact section on the Sign-up page.',
      },
    ],
    contacts: ['zinnovatio@cumail.in', 'events.cse2@cumail.in'],
    galleryTitle: 'From earlier editions',
    galleryFrom: ['zinnovatio-3o', 'zinnovatio-2o', 'zinnovatio'],
    source: { label: 'zinnovatio.in', url: ZINNOVATIO_SITE },
  },

  // ----------------------------------------------------------------- IEEE DAY
  {
    id: 'ieee-day-2026',
    slug: 'ieee-day-2026',
    title: 'IEEE Day 2026',
    type: 'event',
    status: 'upcoming',
    spotlight: true,
    archive: false, // a worldwide occasion, not an event the chapter hosted
    date: '2026-10-06',
    endDate: '2026-10-20', // celebrations run until this date
    dateLabel: 'Tuesday, 6 October 2026',
    startsAt: '2026-10-06T00:00:00+05:30',
    endsAt: '2026-10-20T23:59:59+05:30',
    localCelebration: {
      startsAt: '2026-10-09T00:00:00+05:30',
      venue: 'Chandigarh University',
    },
    venue: 'IEEE communities worldwide',
    venueShort: 'Worldwide',
    short: 'IEEE Day',
    // On the calendar the main day is marked solid and the rest of the
    // celebration window as a lighter band with this name.
    windowLabel: 'IEEE Day celebrations',
    theme: 'Leveraging Technology for a Better Tomorrow',
    tagline: 'Leveraging Technology for a Better Tomorrow',
    celebrationsLabel: '6 to 20 October 2026',
    emblem: 'events/ieee-day-2026-emblem.webp',
    poster: 'events/ieee-day-2026.webp',
    posterTall: 'events/ieee-day-2026-tall.webp', // 4:5 crop for the previous-events carousel
    posterAlt: 'IEEE Day 2026, 6 October 2026. The IEEE Day emblem beside the name.',
    visualTheme: 'blue',
    shortDescription:
      'The day IEEE members around the world mark the first time engineers met to share technical ideas, in 1884.',
    bandText:
      'IEEE Day marks the first time engineers came together to share technical ideas, back in 1884. IEEE communities around the world celebrate it every October.',
    description: [
      'IEEE Day marks the anniversary of the first time IEEE members came together to share their technical ideas, in 1884. Every October, IEEE sections, societies and student branches around the world celebrate it in their own way.',
      'In 2026 it falls on Tuesday, 6 October, and celebrations continue until 20 October. The theme is “Leveraging Technology for a Better Tomorrow”.',
      'IEEE CTSoc CUSB is part of that community. Anything the chapter announces for IEEE Day goes out on our Instagram and in the WhatsApp community, and the official IEEE Day website lists events happening around the world.',
    ],
    info: [
      { label: 'IEEE Day', value: 'Tuesday, 6 October 2026' },
      { label: 'Celebrations run', value: '6 to 20 October 2026' },
      { label: 'Theme', value: 'Leveraging Technology for a Better Tomorrow' },
    ],
    registrationUrl: null,
    registrationNote: 'Events around the world are listed on the official IEEE Day website.',
    websiteUrl: 'https://ieeeday.org/',
    websiteLabel: 'Open ieeeday.org',
    quickFacts: [
      { label: 'Date', value: '6 October 2026' },
      { label: 'Celebrations', value: '6 to 20 October' },
      { label: 'Marks', value: 'A first meeting in 1884' },
      { label: 'Where', value: 'Worldwide' },
    ],
    faqs: [
      {
        q: 'What is IEEE Day?',
        a: 'It marks the anniversary of the first time IEEE members gathered to share their technical ideas, in 1884. IEEE communities around the world celebrate it every year in October.',
      },
      {
        q: 'When is IEEE Day 2026?',
        a: 'Tuesday, 6 October 2026. Celebrations and events continue until 20 October 2026.',
      },
      {
        q: 'What is the theme?',
        a: '“Leveraging Technology for a Better Tomorrow”.',
      },
      {
        q: 'How do I follow what IEEE CTSoc CUSB does for it?',
        a: 'Follow the chapter on Instagram or join the WhatsApp community; both links are in the footer of this site. For events elsewhere, see ieeeday.org.',
      },
    ],
    source: { label: 'ieeeday.org', url: 'https://ieeeday.org/' },
  },

  // --------------------------------------------------------------------- PAST
  // Listed in the order they appear on the Journey page and in the
  // previous-events carousel.
  {
    id: 'code-relay',
    slug: 'code-relay',
    title: 'Code Relay',
    type: 'event',
    status: 'past',
    date: null,
    endDate: null,
    venue: null,
    poster: null,
    visualTheme: 'blue',
    shortDescription: 'From the IEEE CTSoc CUSB archive.',
    description: [],
    registrationUrl: null,
    websiteUrl: null,
  },
  {
    id: 'algolympia',
    slug: 'algolympia',
    title: 'Algolympia',
    type: 'event',
    status: 'past',
    date: null,
    endDate: null,
    venue: null,
    poster: null,
    visualTheme: 'cyan',
    shortDescription: 'From the IEEE CTSoc CUSB archive.',
    description: [],
    registrationUrl: null,
    websiteUrl: null,
  },
  {
    id: 'zinnovatio',
    slug: 'zinnovatio',
    title: 'Zinnovatio',
    type: 'hackathon',
    status: 'past',
    date: null,
    endDate: null,
    dateLabel: 'September to October 2024',
    months: ['2024-09', '2024-10'], // for the calendar: exact days were not recorded
    year: 2024,
    venue: 'Chandigarh University, Mohali',
    poster: `${ZINNOVATIO_IMG}/zinno1-Z7.webp`,
    posterAlt: 'Dignitaries, faculty conveners and student leads on stage at the first Zinnovatio',
    visualTheme: 'coral',
    shortDescription:
      'The first edition. 832 students registered and teams built practical software for healthcare, women’s safety and civic accessibility.',
    description: [
      'The first Zinnovatio ran in autumn 2024. 832 students registered, forming teams of three to five across disciplines.',
      'Teams worked on practical software for healthcare, women’s safety and civic accessibility, and presented live demos to university leadership and industry mentors over two rounds.',
    ],
    facts: [
      { label: 'Registered', value: '832 builders' },
      { label: 'Prizes awarded', value: '₹50,000' },
      { label: 'Format', value: 'Two rounds, hybrid' },
    ],
    websiteUrl:
      'https://unstop.com/hackathons/zinnovatio-gen-z-innovations-hackathon-chandigarh-university-cu-ajitgarh-punjab-1154581',
    websiteLabel: 'Edition page on Unstop',
    galleryTitle: 'Photographs',
    galleryFrom: ['zinnovatio'],
    source: { label: 'zinnovatio.in', url: ZINNOVATIO_SITE },
  },
  {
    id: 'zinnovatio-2o',
    slug: 'zinnovatio-2o',
    title: 'Zinnovatio 2.O',
    type: 'hackathon',
    status: 'past',
    date: null,
    endDate: null,
    dateLabel: 'January to February 2025',
    months: ['2025-01', '2025-02'],
    year: 2025,
    venue: 'Chandigarh University, Mohali',
    poster: `${ZINNOVATIO_IMG}/zinno2-Z20.webp`,
    posterAlt: 'Organising committee and mentors in front of the Zinnovatio 2.0 backdrop',
    visualTheme: 'coral',
    shortDescription:
      'Registrations nearly doubled to 1,581, with harder problem statements: lunar imagery, deepfake detection and cloud defence.',
    description: [
      'The second edition raised the technical bar. Problem statements included enhancing ISRO Chandrayaan-2 lunar crater imagery, detecting AI face-swap deepfakes and mitigating DDoS attacks in the cloud.',
      'Registrations grew by about 90 percent to 1,581, and the top three teams took home ₹30,000, ₹20,000 and ₹10,000.',
    ],
    facts: [
      { label: 'Registered', value: '1,581 builders' },
      { label: 'Prizes awarded', value: '₹60,000+' },
      { label: 'Problem statements', value: '25+' },
    ],
    websiteUrl:
      'https://unstop.com/hackathons/zinnovatio-gen-z-innovations-hackathon-20-chandigarh-university-cu-ajitgarh-punjab-1368241',
    websiteLabel: 'Edition page on Unstop',
    galleryTitle: 'Photographs',
    galleryFrom: ['zinnovatio-2o'],
    source: { label: 'zinnovatio.in', url: ZINNOVATIO_SITE },
  },
  {
    id: 'zinnovatio-3o',
    slug: 'zinnovatio-3o',
    title: 'Zinnovatio 3.O',
    type: 'hackathon',
    status: 'past',
    date: null,
    endDate: null,
    dateLabel: 'October to November 2025',
    months: ['2025-10', '2025-11'],
    year: 2025,
    venue: 'Chandigarh University, Mohali',
    poster: `${ZINNOVATIO_IMG}/zinno3-IMG_7465.JPG.webp`,
    posterAlt: 'Teams coding through the night on the Zinnovatio 3.0 hackathon floor',
    visualTheme: 'coral',
    shortDescription:
      'The move to a national hackathon: 3,303 registrations and a 36-hour overnight build on campus around eight UN Sustainable Development Goals.',
    description: [
      'With 3,303 registrations from institutions across India, the third edition turned Zinnovatio into a national event.',
      'The finale became a 36-hour overnight build on campus. Teams worked on eight UN Sustainable Development Goals and were evaluated in person by domain experts.',
    ],
    facts: [
      { label: 'Registered', value: '3,303 builders' },
      { label: 'Prizes awarded', value: '₹1,00,000+' },
      { label: 'Format', value: '36-hour overnight build' },
    ],
    websiteUrl:
      'https://unstop.com/p/zinnovatio-30-chandigarh-university-cu-ajitgarh-punjab-1557303',
    websiteLabel: 'Edition page on Unstop',
    galleryTitle: 'Photographs',
    galleryFrom: ['zinnovatio-3o'],
    source: { label: 'zinnovatio.in', url: ZINNOVATIO_SITE },
  },
  // Previous events with no details page yet. Add a date, venue and a
  // `description` to any of them and its "View details" link appears.
  {
    id: 'engineers-day',
    slug: 'engineers-day',
    title: 'Engineers Day',
    type: 'event',
    status: 'past',
    date: null,
    endDate: null,
    venue: null,
    poster: null,
    visualTheme: 'blue',
    shortDescription: 'An IEEE CTSoc CUSB event.',
    description: [],
  },
  {
    id: 'ai-visionaries',
    slug: 'ai-visionaries',
    title: 'AI Visionaries',
    type: 'event',
    status: 'past',
    date: null,
    endDate: null,
    venue: null,
    poster: null,
    visualTheme: 'blue',
    shortDescription: 'An IEEE CTSoc CUSB event.',
    description: [],
  },
  {
    id: 'ai-mascot',
    slug: 'ai-mascot',
    title: 'AI Mascot',
    type: 'event',
    status: 'past',
    date: null,
    endDate: null,
    venue: null,
    poster: null,
    visualTheme: 'blue',
    shortDescription: 'An IEEE CTSoc CUSB event.',
    description: [],
  },
  {
    id: 'matlab-workshop',
    slug: 'matlab-workshop',
    title: 'MATLAB Workshop',
    type: 'workshop',
    status: 'past',
    date: null,
    endDate: null,
    venue: null,
    poster: null,
    visualTheme: 'cyan',
    shortDescription: 'A MATLAB workshop from IEEE CTSoc CUSB.',
    description: [],
  },
];

// ----------------------------------------------------------- live status
// Dated events move from 'upcoming' to 'ongoing' to 'past' by themselves.
// Worked out when the site loads and again every half minute while a page
// is open (see refreshEventStatuses below), in India time.

/** When an event starts and ends, as timestamps. null if it has no date. */
export function eventSpan(event) {
  if (!event?.date) return null;
  const start = new Date(event.startsAt ?? `${event.date}T00:00:00+05:30`).getTime();
  const end = new Date(event.endsAt ?? `${event.endDate ?? event.date}T23:59:59+05:30`).getTime();
  return Number.isFinite(start) && Number.isFinite(end) ? { start, end } : null;
}

// The status each event was given in the list above.
const writtenStatus = new Map(events.map((event) => [event.slug, event.status]));

function liveStatus(event, now) {
  const written = writtenStatus.get(event.slug);
  const span = eventSpan(event);
  if (written === 'past' || !span) return written;
  if (now > span.end) return 'past';
  if (now >= span.start) return 'ongoing';
  return 'upcoming';
}

/** Sets every event's status for the given moment. True if anything changed. */
function applyStatuses(now) {
  let changed = false;
  for (const event of events) {
    const status = liveStatus(event, now);
    // `finishedByDate` marks events that became past on their own, so they
    // are placed after the archive (they are the most recent).
    const finishedByDate = status === 'past' && writtenStatus.get(event.slug) !== 'past';
    if (status !== event.status || finishedByDate !== event.finishedByDate) changed = true;
    event.status = status;
    event.finishedByDate = finishedByDate;
  }
  return changed;
}

applyStatuses(Date.now());

// How many days before an event (or a registration deadline) the site
// starts counting down in the pop-up at the corner of the screen.
export const COUNTDOWN_DAYS = 3;

// ---------------------------------------------------------------- helpers

/** Looks an event up by its slug, for /events/<slug>. */
export function getEvent(slug) {
  return events.find((event) => event.slug === slug) ?? null;
}

/**
 * The events shown in lists and counted in totals: everything, except an
 * event marked `archive: false` once it is over.
 */
const computeListed = () => events.filter((event) => !(event.status === 'past' && event.archive === false));
// `let`, because it is rebuilt when a status changes while a page is open.
// eslint-disable-next-line import/no-mutable-exports
export let listedEvents = computeListed();

// --------------------------------------------- keeping statuses up to date
// A page left open over the start or end of an event should not go stale.
// The app calls refreshEventStatuses() on a timer; anything that listed
// events is redrawn when a status has changed.

let statusVersion = 0;
const statusListeners = new Set();

/** Re-checks every status against the clock. Returns true if one changed. */
export function refreshEventStatuses(now = Date.now()) {
  if (!applyStatuses(now)) return false;
  listedEvents = computeListed();
  statusVersion += 1;
  statusListeners.forEach((listener) => listener());
  return true;
}

export function subscribeEventStatuses(listener) {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

export const getEventStatusVersion = () => statusVersion;

/** The flagship event, until it is over. After that it joins the previous events. */
export function getFeaturedEvent() {
  return events.find((event) => event.featured && event.status !== 'past') ?? null;
}

/** Upcoming and ongoing events: featured first, then dated, then undated. */
export function getCurrentEvents() {
  return listedEvents
    .filter((event) => event.status !== 'past')
    .sort((a, b) => {
      if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
      if (a.date && b.date) return a.date.localeCompare(b.date);
      if (a.date || b.date) return a.date ? -1 : 1;
      return 0;
    });
}

/**
 * Past events, oldest first: the archive in the order written above, then
 * any dated event that has since finished, by date.
 */
export function getPastEvents() {
  const past = listedEvents.filter((event) => event.status === 'past');
  return [
    ...past.filter((event) => !event.finishedByDate),
    ...past.filter((event) => event.finishedByDate).sort((a, b) => a.date.localeCompare(b.date)),
  ];
}

/** Upcoming or ongoing events marked `spotlight: true` (the home page band). */
export function getSpotlightEvents() {
  return getCurrentEvents().filter((event) => event.spotlight);
}

/** Types that are actually used, so the filter only shows relevant ones. */
export function getUsedTypes(list = listedEvents) {
  return Object.keys(eventTypes).filter((type) => list.some((event) => event.type === type));
}

export function getUsedStatuses(list = listedEvents) {
  return ['upcoming', 'ongoing', 'past'].filter((status) =>
    list.some((event) => event.status === status),
  );
}

/** True when the event has enough written about it for a details page. */
export function hasDetails(event) {
  return Boolean(event?.description?.length);
}

/**
 * 'open'   registration link exists and has not closed
 * 'closed' registrationCloses has passed
 * 'none'   past event or no registration link
 */
export function getRegistrationState(event, now = Date.now()) {
  if (!event?.registrationUrl || event.status === 'past') return 'none';
  if (event.registrationCloses && new Date(event.registrationCloses).getTime() <= now) return 'closed';
  return 'open';
}
