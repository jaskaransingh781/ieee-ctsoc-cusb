// ---------------------------------------------------------------------------
// GALLERY
// Photographs shown on event pages and the Journey page.
//
// `src` is either a path inside src/assets/ (e.g. 'gallery/day-one.jpg') or a
// full https:// URL. `event` is the slug of the event the photo belongs to.
//
// The Zinnovatio photographs below are the official ones from zinnovatio.in
// and are loaded from that site. For a production deploy it is safer to
// download them into src/assets/gallery/ and point `src` at the local file;
// if a remote image ever fails to load, the tile is simply left out.
// ---------------------------------------------------------------------------

const Z = 'https://zinnovatio.in/images/story-thumbs';
const credit = 'zinnovatio.in';

export const gallery = [
  // Zinnovatio (first edition, 2024)
  {
    id: 'z1-stage',
    event: 'zinnovatio',
    src: `${Z}/zinno1-Z7.webp`,
    alt: 'Dignitaries, faculty conveners and student leads on the main stage',
    caption: 'Founding stage',
    credit,
  },
  {
    id: 'z1-floor',
    event: 'zinnovatio',
    src: `${Z}/zinno1-IMG_6712.JPG.webp`,
    alt: 'Student teams building prototypes on the hackathon floor',
    caption: 'The first cohort',
    credit,
  },
  {
    id: 'z1-mentors',
    event: 'zinnovatio',
    src: `${Z}/zinno1-DSC09098.JPG.webp`,
    alt: 'Faculty and mentors guiding a team during round one evaluation',
    caption: 'Mentor guidance',
    credit,
  },
  {
    id: 'z1-podium',
    event: 'zinnovatio',
    src: `${Z}/archive-team.webp`,
    alt: 'Winning teams with faculty dignitaries on stage',
    caption: 'Podium ceremony',
    credit,
  },

  // Zinnovatio 2.O (2025)
  {
    id: 'z2-winner',
    event: 'zinnovatio-2o',
    src: `${Z}/zinno2-Z1.webp`,
    alt: 'The winning team receiving a ₹30,000 cheque in front of the Zinnovatio 2.0 backdrop',
    caption: 'Winners',
    credit,
  },
  {
    id: 'z2-runner-up',
    event: 'zinnovatio-2o',
    src: `${Z}/zinno2-Z2.webp`,
    alt: 'First runner-up team receiving a ₹20,000 cheque and trophy',
    caption: 'First runner-up',
    credit,
  },
  {
    id: 'z2-second-runner-up',
    event: 'zinnovatio-2o',
    src: `${Z}/zinno2-Z5.webp`,
    alt: 'Second runner-up team receiving a ₹10,000 cheque',
    caption: 'Second runner-up',
    credit,
  },
  {
    id: 'z2-committee',
    event: 'zinnovatio-2o',
    src: `${Z}/zinno2-Z20.webp`,
    alt: 'Organising committee and mentors at the Zinnovatio 2.0 backdrop',
    caption: 'Organising committee',
    credit,
  },

  // Zinnovatio 3.O (2025)
  {
    id: 'z3-night',
    event: 'zinnovatio-3o',
    src: `${Z}/zinno3-IMG_7465.JPG.webp`,
    alt: 'Teams coding on the hackathon floor in the middle of the night',
    caption: 'The overnight build',
    credit,
  },
  {
    id: 'z3-opening',
    event: 'zinnovatio-3o',
    src: `${Z}/zinno3-DSC09036.JPG.webp`,
    alt: 'Opening ceremony and briefing in the auditorium',
    caption: 'Auditorium launch',
    credit,
  },
  {
    id: 'z3-jury',
    event: 'zinnovatio-3o',
    src: `${Z}/zinno3-DSC09149.JPG.webp`,
    alt: 'Jury members reviewing a team’s system during evaluation',
    caption: 'Jury evaluation',
    credit,
  },
  {
    id: 'z3-trophy',
    event: 'zinnovatio-3o',
    src: `${Z}/zinno3-DSC09238.JPG.webp`,
    alt: 'Trophy presentation to the winning team',
    caption: 'Trophy presentation',
    credit,
  },
];

/** Photos for one or more event slugs, in the order the slugs are given. */
export function getGallery(slugs = []) {
  const list = Array.isArray(slugs) ? slugs : [slugs];
  return list.flatMap((slug) => gallery.filter((photo) => photo.event === slug));
}
