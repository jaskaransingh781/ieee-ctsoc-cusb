// ---------------------------------------------------------------------------
// SITE-WIDE SETTINGS
// Every link, email address and social URL used anywhere on the site comes
// from this file. Change a value here and every component picks it up.
// Set a value to null to hide that link everywhere.
// ---------------------------------------------------------------------------

export const site = {
  name: 'IEEE CTSoc CUSB',
  society: 'IEEE Consumer Technology Society',
  branch: 'Chandigarh University Student Branch',
  university: 'Chandigarh University',
  websiteUrl: 'https://ieee-ctsoc-cusb.co.in/',

  // Images live in src/assets/. Paths here are relative to that folder.
  logo: 'branding/ieee-ctsoc-cusb.webp',
  logoOnDark: 'branding/ieee-ctsoc-cusb-white.webp', // white version, used in the footer
  mark: 'branding/ieee-ctsoc-mark.png',

  tagline:
    'The IEEE Consumer Technology Society student branch chapter at Chandigarh University.',

  location: {
    block: 'B1 Block',
    campus: 'Chandigarh University',
    city: 'Mohali, Punjab',
    mapsUrl: 'https://maps.google.com/?q=Chandigarh+University+Mohali',
  },

  // Official contact address. The contact form also delivers here
  // (the delivery address itself is set on the server, see .env.example).
  email: 'ieeectsoc.cu@gmail.com',

  social: {
    instagram: 'https://www.instagram.com/ctsoc_cusb',
    linkedin: 'https://www.linkedin.com/company/ieee-ctsoc-cusb/',
    whatsapp: 'https://chat.whatsapp.com/Bj4GiFRkPDx9bfB9qZfwjp', // community invite link
    youtube: null,
    github: null,
    website: null,
  },

  // Extra official links shown in the Sign-up contact information and About page.
  otherLinks: [
    { label: 'IEEE Consumer Technology Society', url: 'https://ctsoc.ieee.org' },
    { label: 'Chandigarh University', url: 'https://www.cuchd.in' },
    { label: 'Zinnovatio', url: 'https://zinnovatio.in/' },
  ],

  nav: [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Events', to: '/events' },
    { label: 'Team', to: '/team' },
    { label: 'Gallery', to: '/journey#gallery' },
    { label: 'Resources', to: '/about#resources' },
  ],

  // The recurring primary sign-up action shown in the footer and navbar.
  navCta: { label: 'Join CTSoc', to: '/membership' },

  // The impact strip on the home page.
  //   value : a number, or 'auto:past-events' / 'auto:events' / 'auto:team'
  //           to count straight from events.js / team.js.
  //           null hides that figure until you have a number for it.
  //   plus  : true shows a small "+" after the number.
  //   icon  : users | calendar | check | trophy | flag | clock | layers
  impact: {
    title: 'IEEE CTSoc CUSB impact',
    text: 'A student community that learns by building, and keeps turning up.',
    stats: [
      { value: 5700, plus: true, label: 'Students registered', icon: 'users' },
      { value: 'auto:past-events', plus: false, label: 'Events hosted', icon: 'calendar' },
      // No check-in count has been supplied yet. Put the number here to show it.
      { value: null, plus: true, label: 'Check-ins processed', icon: 'check' },
      { value: 'auto:team', plus: false, label: 'Team members', icon: 'trophy' },
    ],
    note: null,
  },
};

export const socialLabels = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp community',
  youtube: 'YouTube',
  github: 'GitHub',
  website: 'Website',
};

/** Social links that actually have a URL, in display order. */
export function getSocialLinks() {
  return Object.entries(site.social)
    .filter(([, url]) => Boolean(url))
    .map(([key, url]) => ({ key, url, label: socialLabels[key] ?? key }));
}
