// ---------------------------------------------------------------------------
// TEAM
// One line per person: member(id, name, role, { ...extras }).
//
// Extras are optional. Add any of these inside the { } at the end of a line:
//
//   linkedin  : 'https://www.linkedin.com/in/...'   shows a LinkedIn button
//   instagram : 'https://www.instagram.com/...'     shows an Instagram button
//   image     : 'team/full-name.jpg'   a file in src/assets/team/. Without
//                                      one, the card shows the initials tile.
//   bio       : 'One or two sentences.'
//   featured  : true                   large card at the top of the Team page
//                                      and on the home page
//
// Example, adding a LinkedIn profile and a photo to someone:
//
//   member('jasnoor-kaur', 'Jasnoor Kaur', 'Vice Chairperson', {
//     featured: true,
//     linkedin: 'https://www.linkedin.com/in/their-profile/',
//     image: 'team/jasnoor-kaur.jpg',
//   }),
//
// Leave a link out (or set it to null) and its button simply does not appear.
// Add or remove lines freely; the layout adapts.
// ---------------------------------------------------------------------------

const member = (id, name, role, extras = {}) => ({
  id,
  name,
  role,
  image: null,
  bio: null,
  instagram: null,
  linkedin: null,
  featured: false,
  ...extras,
});

export const team = [
  member('pratham-joshi', 'Pratham Joshi', 'Chairperson', {
    featured: true,
    linkedin: 'https://www.linkedin.com/in/pratham-joshi-155564322/',
  }),
  member('jasnoor-kaur', 'Jasnoor Kaur', 'Vice Chairperson', { featured: true }),
  member('aakriti-khanna', 'Aakriti Khanna', 'CSR & Announcements', {
    linkedin: 'https://www.linkedin.com/in/aakriti-khanna-61192a311/',
  }),
  member('simarjot-singh', 'Simarjot Singh', 'Event Manager'),
  member('arshveer-singh-saini', 'Arshveer Singh Saini', 'Treasurer / Finance, Event Media Lead'),
  member('anesh', 'Anesh', 'Secretary'),
  member('harshabadpreet-singh-kullar', 'Harshabadpreet Singh Kullar', 'Joint Secretary'),
  member('varinderjit-singh', 'Varinderjit Singh', 'Operations'),
  member('charoo-negi', 'Charoo Negi', 'Social Media and Content', {
    linkedin: 'https://www.linkedin.com/in/charoo-negi-38024932b/',
  }),
  member('jaskaran-singh', 'Jaskaran Singh', 'Technical'),
  member('sakshi', 'Sakshi', 'Branding'),
  member('rakshit-parmar', 'Rakshit Parmar', 'Graphic Lead'),
];

/** True once at least one real person has been entered. */
export const hasNamedTeam = team.some((person) => Boolean(person.name));

/** The people shown on the large cards (Chairperson, Vice Chairperson). */
export const getFeaturedTeam = () => team.filter((person) => person.featured);

/** Everyone else, in the order written above. */
export const getTeamLeads = () => team.filter((person) => !person.featured);
