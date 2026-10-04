// ---------------------------------------------------------------------------
// IEEE CTSoc NEWSLETTERS
// The two publications IEEE's Consumer Technology Society sends out, shown
// in the "From IEEE CTSoc" section of the home page.
//
// The list of latest issues is not kept here: the site's server looks on
// ctsoc.ieee.org for the monthly PDFs (server/feeds.js) and the section
// shows whichever it finds. When the server cannot reach that site, the
// section shows these two cards on their own.
// ---------------------------------------------------------------------------

export const newsletters = [
  {
    id: 'nct',
    name: 'CTSoc News on Consumer Technology',
    kind: 'Monthly, online',
    text: 'The society’s monthly online publication on consumer technology: research news, member activities and what is coming up.',
    linkLabel: 'Browse issues',
    url: 'https://ctsoc.ieee.org/publications/ctsoc-nct.html',
  },
  {
    id: 'world',
    name: 'CTSoc World Newsletter',
    kind: 'Monthly, by email',
    text: 'Sent to members each month, with calls for papers, upcoming conferences and events, and the contents of the society’s publications.',
    linkLabel: 'About the newsletter',
    url: 'https://ctsoc.ieee.org/publications/ctsoc-newsletter.html',
  },
];

export const newsletterCopy = {
  title: 'From IEEE CTSoc',
  text: 'Newsletters from the IEEE Consumer Technology Society. The latest issues appear here by themselves.',
  issueName: 'News on Consumer Technology',
};
